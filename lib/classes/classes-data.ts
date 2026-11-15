import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { COURSE_CATALOG_TAG } from "@/lib/courses/cache";
import { chapters, getChapterForCourse, getCourseShortName } from "@/lib/courses/chapters";
import { getCourseById } from "@/lib/courses/data";
import { decodeCourseMissionTelemetry } from "@/lib/courses/mission-state";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProfileRole } from "@/types/profile";
import {
  averageOf,
  compareHomework,
  getAssignmentStatus,
  isTeacherRole,
  isUuid,
  parisDateString,
  rankStrugglingCourses,
  type AssignmentStatus,
  type PupilRow,
  type QuizAttempt,
  type StrugglingCourse,
} from "./classes";

/**
 * Lectures de l'espace classe, toujours avec la clé service et toujours après
 * contrôle du compte : un professeur ne lit que ses classes (un administrateur
 * toutes), un élève que les siennes. Aucune adresse e-mail n'est lue ici.
 */

type AdminClient = ReturnType<typeof createSupabaseAdminClient>;

export type Viewer = {
  id: string;
  role: ProfileRole;
  username: string;
};

export type ClassRecord = {
  id: string;
  teacher_id: string;
  name: string;
  code: string;
  created_at: string;
  archived_at: string | null;
};

type MemberRecord = { class_id: string; user_id: string; joined_at: string };
type AssignmentRecord = {
  id: string;
  class_id: string;
  course_id: number;
  due_date: string | null;
  note: string | null;
  created_at: string;
};
type ProgressRecord = {
  id: string;
  user_id: string;
  course_id: string;
  status: string;
  best_score: number | null;
  completed_at: string | null;
  updated_at: string | null;
};

const CLASS_COLUMNS = "id, teacher_id, name, code, created_at, archived_at";
const PAGE_SIZE = 1000;

/** Compte connecté et rôle, lus une fois par requête. */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createSupabaseAdminClient();
  const { data } = await admin.from("profiles").select("role, username").eq("id", user.id).maybeSingle();
  const role = data?.role === "teacher" || data?.role === "admin" ? (data.role as ProfileRole) : "student";
  return { id: user.id, role, username: (data?.username as string | undefined) ?? "" };
});

/**
 * Lit toutes les lignes d'une requête, par pages de mille (limite par défaut
 * de l'API Supabase). Trente élèves avancés dépassent vite mille lignes de
 * progression.
 */
async function fetchAllRows<T>(
  query: (from: number, to: number) => PromiseLike<{ data: unknown[] | null; error: { message: string } | null }>
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await query(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    const page = (data ?? []) as T[];
    rows.push(...page);
    if (page.length < PAGE_SIZE) return rows;
  }
}

/** Correspondance uuid de la table courses ↔ numéro de cours (1 à 50). */
const getCourseNumberMap = unstable_cache(
  async (): Promise<Array<[string, number]>> => {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.from("courses").select("id, course_number");
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => [row.id as string, row.course_number as number]);
  },
  ["classes-course-number-map"],
  { revalidate: 3600, tags: [COURSE_CATALOG_TAG] }
);

async function courseNumbersByUuid() {
  return new Map(await getCourseNumberMap());
}

export function courseLabel(courseId: number) {
  const course = getCourseById(courseId);
  return course ? `Mission ${courseId} · ${getCourseShortName(course.title)}` : `Mission ${courseId}`;
}

export function courseTitle(courseId: number) {
  return getCourseById(courseId)?.title ?? `Cours ${courseId}`;
}

/** Les cinquante missions, rangées par chapitre, pour la liste « Donner en devoir ». */
export function buildMissionOptionGroups(assignedCourseIds: number[]) {
  const assigned = new Set(assignedCourseIds);
  return chapters.map((chapter) => ({
    label: `Chapitre ${chapter.id} · ${chapter.name} (${chapter.level.split(" ")[0]})`,
    options: chapter.courseIds.map((courseId) => ({
      value: courseId,
      label: `${courseId}. ${courseTitle(courseId)}`,
      assigned: assigned.has(courseId),
    })),
  }));
}

/** La classe, si le compte la gère : son professeur, ou un administrateur. */
export async function findManagedClass(admin: AdminClient, viewer: Viewer, classId: unknown): Promise<ClassRecord | null> {
  if (!isTeacherRole(viewer.role) || !isUuid(classId)) return null;
  const { data, error } = await admin.from("classes").select(CLASS_COLUMNS).eq("id", classId).maybeSingle();
  if (error || !data) return null;
  const record = data as ClassRecord;
  if (viewer.role !== "admin" && record.teacher_id !== viewer.id) return null;
  return record;
}

async function usernamesById(admin: AdminClient, ids: string[]) {
  const unique = Array.from(new Set(ids));
  if (unique.length === 0) return new Map<string, string>();
  const rows = await fetchAllRows<{ id: string; username: string }>((from, to) =>
    admin.from("profiles").select("id, username").in("id", unique).order("id").range(from, to)
  );
  return new Map(rows.map((row) => [row.id, row.username]));
}

/**
 * Ouvre les missions données en devoir pour ces élèves : une mission encore
 * verrouillée sur leur carte passe à « ouverte », pour qu'ils puissent la
 * valider sans avoir fini les précédentes. Seules les lignes existantes et
 * verrouillées changent ; rien n'est créé, rien n'est refermé.
 */
export async function openCoursesForPupils(admin: AdminClient, userIds: string[], courseNumbers: number[]) {
  const users = Array.from(new Set(userIds));
  const numbers = Array.from(new Set(courseNumbers));
  if (users.length === 0 || numbers.length === 0) return;

  const map = await courseNumbersByUuid();
  const courseUuids = Array.from(map.entries())
    .filter(([, number]) => numbers.includes(number))
    .map(([uuid]) => uuid);
  if (courseUuids.length === 0) return;

  for (let index = 0; index < users.length; index += 100) {
    const { error } = await admin
      .from("user_course_progress")
      .update({ status: "unlocked" })
      .in("user_id", users.slice(index, index + 100))
      .in("course_id", courseUuids)
      .eq("status", "locked");
    if (error) {
      console.error("openCoursesForPupils", error.message);
      return;
    }
  }
}

/* ------------------------------------------------------------------ professeur */

export type TeacherClassSummary = {
  id: string;
  name: string;
  code: string;
  createdAt: string;
  archivedAt: string | null;
  pupilCount: number;
  teacherName: string | null;
  isOwn: boolean;
};

function toSummary(record: ClassRecord, pupilCount: number, viewer: Viewer, teacherName: string | null): TeacherClassSummary {
  return {
    id: record.id,
    name: record.name,
    code: record.code,
    createdAt: record.created_at,
    archivedAt: record.archived_at,
    pupilCount,
    teacherName,
    isOwn: record.teacher_id === viewer.id,
  };
}

/** Les classes du professeur ; toutes les classes pour un administrateur. */
export async function getTeacherClasses(viewer: Viewer): Promise<TeacherClassSummary[]> {
  if (!isTeacherRole(viewer.role)) return [];
  const admin = createSupabaseAdminClient();

  const records = await fetchAllRows<ClassRecord>((from, to) => {
    const query = admin.from("classes").select(CLASS_COLUMNS);
    return (viewer.role === "admin" ? query : query.eq("teacher_id", viewer.id))
      .order("created_at", { ascending: true })
      .range(from, to);
  });
  if (records.length === 0) return [];

  const classIds = records.map((record) => record.id);
  const counts = new Map<string, number>();
  for (let index = 0; index < classIds.length; index += 100) {
    const members = await fetchAllRows<{ class_id: string }>((from, to) =>
      admin
        .from("class_members")
        .select("class_id")
        .in("class_id", classIds.slice(index, index + 100))
        .order("class_id")
        .range(from, to)
    );
    for (const member of members) counts.set(member.class_id, (counts.get(member.class_id) ?? 0) + 1);
  }

  const teacherNames =
    viewer.role === "admin" ? await usernamesById(admin, records.map((record) => record.teacher_id)) : new Map<string, string>();

  return records.map((record) =>
    toSummary(record, counts.get(record.id) ?? 0, viewer, teacherNames.get(record.teacher_id) ?? null)
  );
}

export type AssignmentPupilStatus = { userId: string; username: string; status: AssignmentStatus };

export type TeacherAssignment = {
  id: string;
  courseId: number;
  courseLabel: string;
  courseTitle: string;
  dueDate: string | null;
  note: string | null;
  createdAt: string;
  counts: Record<AssignmentStatus, number>;
  pupils: AssignmentPupilStatus[];
};

export type StrugglingCourseView = StrugglingCourse & { label: string; chapterId: number };

export type TeacherClassDetail = {
  summary: TeacherClassSummary;
  pupils: PupilRow[];
  assignments: TeacherAssignment[];
  struggling: StrugglingCourseView[];
  today: string;
};

type PupilProgress = {
  completed: Set<number>;
  inProgress: number[];
  unlocked: number[];
  quiz: QuizAttempt[];
  lastActivity: string | null;
};

function emptyProgress(): PupilProgress {
  return { completed: new Set(), inProgress: [], unlocked: [], quiz: [], lastActivity: null };
}

function laterDay(current: string | null, candidate: string | null | undefined) {
  if (!candidate) return current;
  return !current || candidate > current ? candidate : current;
}

function dayOf(timestamp: string | null | undefined) {
  if (!timestamp) return null;
  const time = Date.parse(timestamp);
  return Number.isFinite(time) ? parisDateString(new Date(time)) : null;
}

/**
 * Progression de chaque élève à partir de user_course_progress. La date
 * d'activité ne retient que ce que l'élève a fait lui-même (mission lancée,
 * lecture, quiz, validation), pas les ouvertures automatiques de missions.
 */
function summarizeProgress(rows: ProgressRecord[], numbers: Map<string, number>) {
  const byUser = new Map<string, PupilProgress>();
  for (const row of rows) {
    const courseId = numbers.get(row.course_id);
    if (!courseId) continue;
    const progress = byUser.get(row.user_id) ?? emptyProgress();
    const telemetry = decodeCourseMissionTelemetry(row.best_score);
    const touched =
      row.status === "in_progress" || row.status === "completed" || telemetry.readingCheckpointReached || telemetry.quizTotal > 0;

    if (row.status === "completed") progress.completed.add(courseId);
    if (row.status === "in_progress") progress.inProgress.push(courseId);
    if (row.status === "unlocked") progress.unlocked.push(courseId);
    if (telemetry.quizTotal > 0) {
      progress.quiz.push({ courseId, accuracy: (telemetry.quizScore / telemetry.quizTotal) * 100 });
    }
    if (touched) progress.lastActivity = laterDay(progress.lastActivity, dayOf(row.updated_at));
    progress.lastActivity = laterDay(progress.lastActivity, dayOf(row.completed_at));
    byUser.set(row.user_id, progress);
  }
  return byUser;
}

function currentMissionOf(progress: PupilProgress | undefined): { id: number | null; label: string } {
  if (!progress) return { id: null, label: "Pas commencé" };
  const current = [...progress.inProgress].sort((a, b) => a - b)[0] ?? [...progress.unlocked].sort((a, b) => a - b)[0];
  if (current) return { id: current, label: courseLabel(current) };
  if (progress.completed.size >= 50) return { id: null, label: "Carte terminée" };
  return { id: null, label: "Pas commencé" };
}

export async function getTeacherClassDetail(viewer: Viewer, classId: string): Promise<TeacherClassDetail | null> {
  const admin = createSupabaseAdminClient();
  const record = await findManagedClass(admin, viewer, classId);
  if (!record) return null;

  const [members, assignmentRows, numbers] = await Promise.all([
    fetchAllRows<MemberRecord>((from, to) =>
      admin.from("class_members").select("class_id, user_id, joined_at").eq("class_id", record.id).order("user_id").range(from, to)
    ),
    fetchAllRows<AssignmentRecord>((from, to) =>
      admin
        .from("class_assignments")
        .select("id, class_id, course_id, due_date, note, created_at")
        .eq("class_id", record.id)
        .order("created_at", { ascending: false })
        .range(from, to)
    ),
    courseNumbersByUuid(),
  ]);

  const userIds = members.map((member) => member.user_id);
  const [profiles, progressRows, teacherNames] = await Promise.all([
    userIds.length > 0
      ? fetchAllRows<{ id: string; username: string; xp: number | null; last_game_date: string | null }>((from, to) =>
          // Pseudo et progression seulement : jamais l'adresse e-mail.
          admin.from("profiles").select("id, username, xp, last_game_date").in("id", userIds).order("id").range(from, to)
        )
      : Promise.resolve([]),
    userIds.length > 0
      ? fetchAllRows<ProgressRecord>((from, to) =>
          admin
            .from("user_course_progress")
            .select("id, user_id, course_id, status, best_score, completed_at, updated_at")
            .in("user_id", userIds)
            .neq("status", "locked")
            .order("id")
            .range(from, to)
        )
      : Promise.resolve([]),
    viewer.role === "admin" && record.teacher_id !== viewer.id
      ? usernamesById(admin, [record.teacher_id])
      : Promise.resolve(new Map<string, string>()),
  ]);

  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
  const progressByUser = summarizeProgress(progressRows, numbers);
  const today = parisDateString();

  const pupils: PupilRow[] = members.map((member) => {
    const profile = profileById.get(member.user_id);
    const progress = progressByUser.get(member.user_id);
    const current = currentMissionOf(progress);
    const lastGameDay = typeof profile?.last_game_date === "string" ? profile.last_game_date.slice(0, 10) : null;
    return {
      userId: member.user_id,
      username: profile?.username ?? "Compte supprimé",
      completedCount: progress?.completed.size ?? 0,
      currentCourseId: current.id,
      currentCourseLabel: current.label,
      lastActivity: laterDay(progress?.lastActivity ?? null, lastGameDay),
      xp: profile?.xp ?? 0,
      quizAverage: averageOf(progress?.quiz.map((attempt) => attempt.accuracy) ?? []),
      quizCount: progress?.quiz.length ?? 0,
    };
  });

  const assignments: TeacherAssignment[] = assignmentRows.map((row) => {
    const statuses = pupils
      .map((pupil) => ({
        userId: pupil.userId,
        username: pupil.username,
        status: getAssignmentStatus({
          completed: progressByUser.get(pupil.userId)?.completed.has(row.course_id) ?? false,
          dueDate: row.due_date,
          today,
        }),
      }))
      .sort((left, right) => left.username.localeCompare(right.username, "fr", { sensitivity: "base", numeric: true }));
    const counts: Record<AssignmentStatus, number> = { fait: 0, en_retard: 0, a_faire: 0 };
    for (const entry of statuses) counts[entry.status] += 1;
    return {
      id: row.id,
      courseId: row.course_id,
      courseLabel: courseLabel(row.course_id),
      courseTitle: courseTitle(row.course_id),
      dueDate: row.due_date,
      note: row.note,
      createdAt: row.created_at,
      counts,
      pupils: statuses,
    };
  });

  // Les devoirs à venir d'abord (date la plus proche), puis sans date, puis les plus anciens.
  assignments.sort((left, right) => {
    const leftPast = left.dueDate !== null && left.dueDate < today;
    const rightPast = right.dueDate !== null && right.dueDate < today;
    if (leftPast !== rightPast) return leftPast ? 1 : -1;
    if (left.dueDate !== right.dueDate) {
      if (!left.dueDate) return 1;
      if (!right.dueDate) return -1;
      return leftPast ? (left.dueDate < right.dueDate ? 1 : -1) : left.dueDate < right.dueDate ? -1 : 1;
    }
    return right.createdAt.localeCompare(left.createdAt);
  });

  const struggling = rankStrugglingCourses(
    Array.from(progressByUser.entries())
      .filter(([userId]) => profileById.has(userId))
      .flatMap(([, progress]) => progress.quiz)
  ).map((course) => ({
    ...course,
    label: courseLabel(course.courseId),
    chapterId: getChapterForCourse(course.courseId).id,
  }));

  return {
    summary: toSummary(record, members.length, viewer, teacherNames.get(record.teacher_id) ?? null),
    pupils,
    assignments,
    struggling,
    today,
  };
}

/* ------------------------------------------------------------------ élève */

export type PupilClass = {
  id: string;
  name: string;
  teacherName: string;
  joinedAt: string;
};

export type PupilHomework = {
  assignmentId: string;
  classId: string;
  className: string;
  courseId: number;
  courseLabel: string;
  dueDate: string | null;
  note: string | null;
  status: AssignmentStatus;
};

export type PupilClassOverview = {
  classes: PupilClass[];
  /** Devoirs pas encore faits, les retards d'abord. */
  pending: PupilHomework[];
  today: string;
};

/** Classes actives de l'élève (les classes archivées ne s'affichent plus) et devoirs en attente. */
export async function getPupilClassOverview(userId: string): Promise<PupilClassOverview> {
  const today = parisDateString();
  const admin = createSupabaseAdminClient();

  const { data: memberRows, error: memberError } = await admin
    .from("class_members")
    .select("class_id, joined_at")
    .eq("user_id", userId);
  if (memberError) throw new Error(memberError.message);
  const memberships = (memberRows ?? []) as Array<{ class_id: string; joined_at: string }>;
  if (memberships.length === 0) return { classes: [], pending: [], today };

  const classIds = memberships.map((row) => row.class_id);
  const [{ data: classRows, error: classError }, { data: assignmentRows, error: assignmentError }] = await Promise.all([
    admin.from("classes").select(CLASS_COLUMNS).in("id", classIds).is("archived_at", null),
    admin
      .from("class_assignments")
      .select("id, class_id, course_id, due_date, note, created_at")
      .in("class_id", classIds)
      .order("created_at", { ascending: false })
      .limit(500),
  ]);
  if (classError) throw new Error(classError.message);
  if (assignmentError) throw new Error(assignmentError.message);

  const activeClasses = (classRows ?? []) as ClassRecord[];
  const classById = new Map(activeClasses.map((row) => [row.id, row]));
  const joinedAt = new Map(memberships.map((row) => [row.class_id, row.joined_at]));
  const teacherNames = await usernamesById(admin, activeClasses.map((row) => row.teacher_id));

  const classes: PupilClass[] = activeClasses
    .map((row) => ({
      id: row.id,
      name: row.name,
      teacherName: teacherNames.get(row.teacher_id) ?? "Professeur",
      joinedAt: joinedAt.get(row.id) ?? row.created_at,
    }))
    .sort((left, right) => left.joinedAt.localeCompare(right.joinedAt));

  const assignments = ((assignmentRows ?? []) as AssignmentRecord[]).filter((row) => classById.has(row.class_id));
  if (assignments.length === 0) return { classes, pending: [], today };

  const [{ data: completedRows, error: progressError }, numbers] = await Promise.all([
    admin.from("user_course_progress").select("course_id").eq("user_id", userId).eq("status", "completed"),
    courseNumbersByUuid(),
  ]);
  if (progressError) throw new Error(progressError.message);
  const completed = new Set(
    (completedRows ?? [])
      .map((row) => numbers.get(row.course_id as string))
      .filter((value): value is number => typeof value === "number")
  );

  const pending = assignments
    .map((row) => ({
      assignmentId: row.id,
      classId: row.class_id,
      className: classById.get(row.class_id)?.name ?? "",
      courseId: row.course_id,
      courseLabel: courseLabel(row.course_id),
      dueDate: row.due_date,
      note: row.note,
      status: getAssignmentStatus({ completed: completed.has(row.course_id), dueDate: row.due_date, today }),
    }))
    .filter((homework) => homework.status !== "fait")
    .sort(compareHomework);

  return { classes, pending, today };
}
