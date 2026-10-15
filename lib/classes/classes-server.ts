"use server";

import { revalidatePath } from "next/cache";
import { getCourseById } from "@/lib/courses/data";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  JOIN_ATTEMPT_WINDOW_MS,
  MAX_ACTIVE_CLASSES_PER_TEACHER,
  MAX_ASSIGNMENTS_PER_CLASS,
  MAX_CLASSES_PER_PUPIL,
  MAX_PUPILS_PER_CLASS,
  MAX_WRONG_JOIN_CODES_PER_HOUR,
  evaluateJoinAttempts,
  generateClassCode,
  isTeacherRole,
  isUuid,
  isValidClassCode,
  normalizeClassCode,
  validateAssignmentNote,
  validateClassName,
  validateCourseId,
  validateDueDate,
  type ClassActionResult,
} from "./classes";
import { findManagedClass, getViewer, openCoursesForPupils, type ClassRecord, type Viewer } from "./classes-data";

/**
 * Actions de l'espace classe. Chacune relit le compte et son rôle côté
 * serveur, valide ses arguments (qui viennent du navigateur), puis écrit avec
 * la clé service : la base refuse toute écriture directe depuis le navigateur.
 */

type AdminClient = ReturnType<typeof createSupabaseAdminClient>;
type TeacherContext = { viewer: Viewer; admin: AdminClient };
type ClassContext = TeacherContext & { record: ClassRecord };

const UNIQUE_VIOLATION = "23505";
const CODE_ATTEMPTS = 6;
const GENERIC_ERROR = "L'opération n'a pas abouti. Réessayez dans un instant.";
const PUPIL_GENERIC_ERROR = "Ça n'a pas marché. Réessaie dans un instant.";

function teacherPaths(classId?: string) {
  revalidatePath("/teachers");
  if (classId) revalidatePath(`/teachers/classe/${classId}`);
}

function pupilPaths() {
  revalidatePath("/profile");
  revalidatePath("/home");
}

async function requireTeacher(): Promise<TeacherContext | { error: string }> {
  const viewer = await getViewer();
  if (!viewer) return { error: "Votre session a expiré. Reconnectez-vous." };
  if (!isTeacherRole(viewer.role)) return { error: "Cet espace est réservé aux comptes professeur." };
  return { viewer, admin: createSupabaseAdminClient() };
}

async function requireManagedClass(classId: unknown): Promise<ClassContext | { error: string }> {
  const context = await requireTeacher();
  if ("error" in context) return context;
  const record = await findManagedClass(context.admin, context.viewer, classId);
  if (!record) return { error: "Classe introuvable." };
  return { ...context, record };
}

async function countActiveClasses(admin: AdminClient, teacherId: string) {
  const { count, error } = await admin
    .from("classes")
    .select("id", { count: "exact", head: true })
    .eq("teacher_id", teacherId)
    .is("archived_at", null);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

/* ------------------------------------------------------------------ professeur */

export async function createClass(name: unknown): Promise<ClassActionResult<{ id: string; code: string }>> {
  const context = await requireTeacher();
  if ("error" in context) return { ok: false, error: context.error };
  const validated = validateClassName(name);
  if (!validated.ok) return { ok: false, error: validated.error };

  try {
    if ((await countActiveClasses(context.admin, context.viewer.id)) >= MAX_ACTIVE_CLASSES_PER_TEACHER) {
      return {
        ok: false,
        error: `Vous avez déjà ${MAX_ACTIVE_CLASSES_PER_TEACHER} classes actives. Archivez-en une pour en créer une autre.`,
      };
    }

    // Le code est unique en base : en cas de collision (rarissime), on en tire un autre.
    for (let attempt = 0; attempt < CODE_ATTEMPTS; attempt += 1) {
      const code = generateClassCode();
      const { data, error } = await context.admin
        .from("classes")
        .insert({ teacher_id: context.viewer.id, name: validated.value, code })
        .select("id, code")
        .single();
      if (!error && data) {
        teacherPaths();
        return { ok: true, message: `Classe « ${validated.value} » créée. Code : ${data.code}.`, data: { id: data.id, code: data.code } };
      }
      if (error?.code !== UNIQUE_VIOLATION) {
        console.error("createClass", error?.message);
        return { ok: false, error: GENERIC_ERROR };
      }
    }
  } catch (error) {
    console.error("createClass", error);
  }
  return { ok: false, error: GENERIC_ERROR };
}

export async function renameClass(classId: unknown, name: unknown): Promise<ClassActionResult> {
  const context = await requireManagedClass(classId);
  if ("error" in context) return { ok: false, error: context.error };
  const validated = validateClassName(name);
  if (!validated.ok) return { ok: false, error: validated.error };
  if (validated.value === context.record.name) return { ok: true, message: "Le nom n'a pas changé." };

  const { error } = await context.admin.from("classes").update({ name: validated.value }).eq("id", context.record.id);
  if (error) {
    console.error("renameClass", error.message);
    return { ok: false, error: GENERIC_ERROR };
  }
  teacherPaths(context.record.id);
  return { ok: true, message: `Classe renommée : « ${validated.value} ».` };
}

export async function archiveClass(classId: unknown): Promise<ClassActionResult> {
  const context = await requireManagedClass(classId);
  if ("error" in context) return { ok: false, error: context.error };
  if (context.record.archived_at) return { ok: true, message: "La classe est déjà archivée." };

  const { error } = await context.admin
    .from("classes")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", context.record.id);
  if (error) {
    console.error("archiveClass", error.message);
    return { ok: false, error: GENERIC_ERROR };
  }
  teacherPaths(context.record.id);
  return { ok: true, message: "Classe archivée. Son code ne permet plus de la rejoindre." };
}

export async function restoreClass(classId: unknown): Promise<ClassActionResult> {
  const context = await requireManagedClass(classId);
  if ("error" in context) return { ok: false, error: context.error };
  if (!context.record.archived_at) return { ok: true, message: "La classe est déjà active." };

  try {
    if ((await countActiveClasses(context.admin, context.record.teacher_id)) >= MAX_ACTIVE_CLASSES_PER_TEACHER) {
      return { ok: false, error: `${MAX_ACTIVE_CLASSES_PER_TEACHER} classes actives au plus. Archivez-en une autre d'abord.` };
    }
  } catch (error) {
    console.error("restoreClass", error);
    return { ok: false, error: GENERIC_ERROR };
  }

  const { error } = await context.admin.from("classes").update({ archived_at: null }).eq("id", context.record.id);
  if (error) {
    console.error("restoreClass", error.message);
    return { ok: false, error: GENERIC_ERROR };
  }
  teacherPaths(context.record.id);
  return { ok: true, message: "Classe réactivée. Son code fonctionne de nouveau." };
}

export async function regenerateCode(classId: unknown): Promise<ClassActionResult<{ code: string }>> {
  const context = await requireManagedClass(classId);
  if ("error" in context) return { ok: false, error: context.error };

  for (let attempt = 0; attempt < CODE_ATTEMPTS; attempt += 1) {
    const code = generateClassCode();
    if (code === context.record.code) continue;
    const { error } = await context.admin.from("classes").update({ code }).eq("id", context.record.id);
    if (!error) {
      teacherPaths(context.record.id);
      return { ok: true, message: `Nouveau code : ${code}. L'ancien ne fonctionne plus.`, data: { code } };
    }
    if (error.code !== UNIQUE_VIOLATION) {
      console.error("regenerateCode", error.message);
      return { ok: false, error: GENERIC_ERROR };
    }
  }
  return { ok: false, error: GENERIC_ERROR };
}

export async function removePupil(classId: unknown, userId: unknown): Promise<ClassActionResult> {
  const context = await requireManagedClass(classId);
  if ("error" in context) return { ok: false, error: context.error };
  if (!isUuid(userId)) return { ok: false, error: "Élève introuvable." };

  const { data, error } = await context.admin
    .from("class_members")
    .delete()
    .eq("class_id", context.record.id)
    .eq("user_id", userId)
    .select("user_id");
  if (error) {
    console.error("removePupil", error.message);
    return { ok: false, error: GENERIC_ERROR };
  }
  if (!data || data.length === 0) return { ok: false, error: "Cet élève n'est plus dans la classe." };
  teacherPaths(context.record.id);
  return { ok: true, message: "Élève retiré de la classe. Sa progression personnelle est conservée." };
}

export async function assignMission(
  classId: unknown,
  courseId: unknown,
  dueDate: unknown,
  note: unknown
): Promise<ClassActionResult> {
  const context = await requireManagedClass(classId);
  if ("error" in context) return { ok: false, error: context.error };
  if (context.record.archived_at) return { ok: false, error: "La classe est archivée. Réactivez-la pour donner un devoir." };

  const course = validateCourseId(courseId);
  if (!course.ok || !getCourseById(course.value)) return { ok: false, error: "Choisissez une mission dans la liste." };
  const due = validateDueDate(dueDate);
  if (!due.ok) return { ok: false, error: due.error };
  const cleanNote = validateAssignmentNote(note);
  if (!cleanNote.ok) return { ok: false, error: cleanNote.error };

  const { data: existing, error: existingError } = await context.admin
    .from("class_assignments")
    .select("id, course_id")
    .eq("class_id", context.record.id);
  if (existingError) {
    console.error("assignMission", existingError.message);
    return { ok: false, error: GENERIC_ERROR };
  }
  if ((existing ?? []).some((row) => row.course_id === course.value)) {
    return {
      ok: false,
      error: `La mission ${course.value} est déjà en devoir dans cette classe. Supprimez l'ancien devoir pour changer sa date.`,
    };
  }
  if ((existing ?? []).length >= MAX_ASSIGNMENTS_PER_CLASS) {
    return { ok: false, error: `${MAX_ASSIGNMENTS_PER_CLASS} devoirs au plus par classe. Supprimez les plus anciens.` };
  }

  const { error } = await context.admin.from("class_assignments").insert({
    class_id: context.record.id,
    course_id: course.value,
    due_date: due.value,
    note: cleanNote.value,
  });
  if (error) {
    console.error("assignMission", error.message);
    return { ok: false, error: GENERIC_ERROR };
  }

  // La mission s'ouvre sur la carte des élèves, même s'ils n'y sont pas encore arrivés.
  const { data: members } = await context.admin.from("class_members").select("user_id").eq("class_id", context.record.id);
  await openCoursesForPupils(
    context.admin,
    (members ?? []).map((row) => row.user_id as string),
    [course.value]
  );

  teacherPaths(context.record.id);
  return { ok: true, message: `Mission ${course.value} donnée en devoir.` };
}

export async function deleteAssignment(assignmentId: unknown): Promise<ClassActionResult> {
  const teacher = await requireTeacher();
  if ("error" in teacher) return { ok: false, error: teacher.error };
  if (!isUuid(assignmentId)) return { ok: false, error: "Devoir introuvable." };

  const { data: assignment } = await teacher.admin
    .from("class_assignments")
    .select("id, class_id")
    .eq("id", assignmentId)
    .maybeSingle();
  const record = assignment ? await findManagedClass(teacher.admin, teacher.viewer, assignment.class_id) : null;
  if (!assignment || !record) return { ok: false, error: "Devoir introuvable." };

  const { error } = await teacher.admin.from("class_assignments").delete().eq("id", assignment.id);
  if (error) {
    console.error("deleteAssignment", error.message);
    return { ok: false, error: GENERIC_ERROR };
  }
  teacherPaths(record.id);
  return { ok: true, message: "Devoir supprimé." };
}

/* ------------------------------------------------------------------ élève */

/**
 * Limite des essais : chaque code bien formé mais inconnu ajoute une ligne
 * dans class_join_attempts. Avant toute recherche, on compte les échecs de
 * l'heure écoulée pour ce compte ; à dix, on refuse sans chercher, même un
 * code juste. Les lignes de plus d'un jour sont effacées au passage.
 */
async function readJoinVerdict(admin: AdminClient, userId: string) {
  const since = new Date(Date.now() - JOIN_ATTEMPT_WINDOW_MS).toISOString();
  const { data, error } = await admin
    .from("class_join_attempts")
    .select("created_at")
    .eq("user_id", userId)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(MAX_WRONG_JOIN_CODES_PER_HOUR);
  if (error) throw new Error(error.message);
  return evaluateJoinAttempts((data ?? []).map((row) => row.created_at as string));
}

async function recordFailedJoin(admin: AdminClient, userId: string) {
  const { error } = await admin.from("class_join_attempts").insert({ user_id: userId });
  if (error) console.error("recordFailedJoin", error.message);
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  await admin.from("class_join_attempts").delete().eq("user_id", userId).lt("created_at", dayAgo);
}

export async function joinClass(code: unknown): Promise<ClassActionResult<{ classId: string; className: string }>> {
  const viewer = await getViewer();
  if (!viewer) return { ok: false, error: "Connecte-toi pour rejoindre une classe." };

  const normalized = normalizeClassCode(code);
  if (!isValidClassCode(normalized)) {
    return {
      ok: false,
      error: "Un code de classe a six caractères : des lettres et des chiffres, sans O, I, L, 0 ni 1.",
    };
  }

  const admin = createSupabaseAdminClient();
  try {
    const verdict = await readJoinVerdict(admin, viewer.id);
    if (verdict.blocked) {
      return {
        ok: false,
        error: `Trop de codes erronés. Réessaie dans ${verdict.retryInMinutes} minute${verdict.retryInMinutes > 1 ? "s" : ""}.`,
      };
    }

    const { data: found, error: findError } = await admin
      .from("classes")
      .select("id, teacher_id, name, archived_at")
      .eq("code", normalized)
      .maybeSingle();
    if (findError) throw new Error(findError.message);

    if (!found || found.archived_at) {
      await recordFailedJoin(admin, viewer.id);
      const left = verdict.remaining - 1;
      const hint = left > 0 && left <= 3 ? ` Encore ${left} essai${left > 1 ? "s" : ""} cette heure-ci.` : "";
      return { ok: false, error: `Ce code ne correspond à aucune classe. Vérifie-le avec ton professeur.${hint}` };
    }

    if (found.teacher_id === viewer.id) {
      return { ok: false, error: "C'est votre classe : vos élèves la rejoignent avec ce code." };
    }

    const { data: memberships, error: membershipError } = await admin
      .from("class_members")
      .select("class_id")
      .eq("user_id", viewer.id);
    if (membershipError) throw new Error(membershipError.message);
    const joinedIds = (memberships ?? []).map((row) => row.class_id as string);

    if (joinedIds.includes(found.id)) {
      return { ok: true, message: `Tu es déjà dans la classe « ${found.name} ».`, data: { classId: found.id, className: found.name } };
    }

    if (joinedIds.length > 0) {
      const { count: activeCount, error: activeError } = await admin
        .from("classes")
        .select("id", { count: "exact", head: true })
        .in("id", joinedIds)
        .is("archived_at", null);
      if (activeError) throw new Error(activeError.message);
      if ((activeCount ?? 0) >= MAX_CLASSES_PER_PUPIL) {
        return {
          ok: false,
          error: `Tu es déjà dans ${MAX_CLASSES_PER_PUPIL} classes. Quitte-en une depuis ton profil pour rejoindre celle-ci.`,
        };
      }
    }

    const { count: pupilCount, error: countError } = await admin
      .from("class_members")
      .select("user_id", { count: "exact", head: true })
      .eq("class_id", found.id);
    if (countError) throw new Error(countError.message);
    if ((pupilCount ?? 0) >= MAX_PUPILS_PER_CLASS) {
      return { ok: false, error: "Cette classe est complète. Préviens ton professeur." };
    }

    const { error: insertError } = await admin
      .from("class_members")
      .upsert({ class_id: found.id, user_id: viewer.id }, { onConflict: "class_id,user_id", ignoreDuplicates: true });
    if (insertError) throw new Error(insertError.message);

    // Les devoirs déjà donnés à la classe s'ouvrent aussi pour le nouvel élève.
    const { data: assignments } = await admin.from("class_assignments").select("course_id").eq("class_id", found.id);
    await openCoursesForPupils(
      admin,
      [viewer.id],
      (assignments ?? []).map((row) => row.course_id as number)
    );

    pupilPaths();
    return { ok: true, message: `Bienvenue dans la classe « ${found.name} ».`, data: { classId: found.id, className: found.name } };
  } catch (error) {
    console.error("joinClass", error);
    return { ok: false, error: PUPIL_GENERIC_ERROR };
  }
}

export async function leaveClass(classId: unknown): Promise<ClassActionResult> {
  const viewer = await getViewer();
  if (!viewer) return { ok: false, error: "Connecte-toi d'abord." };
  if (!isUuid(classId)) return { ok: false, error: "Classe introuvable." };

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("class_members")
    .delete()
    .eq("class_id", classId)
    .eq("user_id", viewer.id)
    .select("class_id");
  if (error) {
    console.error("leaveClass", error.message);
    return { ok: false, error: PUPIL_GENERIC_ERROR };
  }
  if (!data || data.length === 0) return { ok: false, error: "Tu n'es plus dans cette classe." };
  pupilPaths();
  return { ok: true, message: "Tu as quitté la classe." };
}
