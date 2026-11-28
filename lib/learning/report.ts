import { getCourseById } from "@/lib/courses/data";
import { getCourseMetadata } from "@/lib/courses/metadata";
import { decodeCourseMissionTelemetry, isCoursePlacementSkip } from "@/lib/courses/mission-telemetry";
import { isCourseQuizScorePassing } from "@/lib/courses/quiz-score";
import { getGameBySlug } from "@/lib/games/config";
import { passages } from "@/lib/adventure/catalog";
import { formatLeaderboardScore, getGameLeaderboardMeta } from "@/lib/games/leaderboard-config";

export type HistoryKind = "tout" | "jeux" | "quiz";
export type ReportQuery = { page?: string; type?: string };
export type GameGroup = {
  slug: string;
  difficulty: string | null;
  plays: number;
  low: number;
  high: number;
  latest: string;
};
export type CourseRow = {
  course: number;
  legacy: number | null;
  status: string | null;
  finished: string | null;
  reading: string | null;
  score: number | null;
  total: number | null;
  tries: number | null;
  best: number | null;
  best_total: number | null;
  latest: string | null;
};
export type LearningReport = {
  username: string;
  className: string | null;
  since: string | null;
  games: GameGroup[];
  courses: CourseRow[];
  atlas: { mission: number; stage: number; updated: string }[];
  historyCount: number;
  history: {
    kind: "jeu" | "quiz";
    happened: string;
    slug: string | null;
    difficulty: string | null;
    course: number | null;
    score: number;
    total: number | null;
  }[];
};
export const historyKinds: Record<HistoryKind, string> = { tout: "Tout", jeux: "Jeux", quiz: "Quiz" };
export function getReportPage(value?: string) {
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 && page <= 2147483647 ? page : 1;
}
export function getHistoryKind(value?: string): HistoryKind {
  return value === "jeux" || value === "quiz" ? value : "tout";
}
export function courseName(id: number) {
  const course = getCourseById(id);
  return course?.publicTitle ?? course?.title ?? `Cours ${id}`;
}
export function gameName(slug: string) {
  return getGameBySlug(slug)?.name ?? slug;
}
export function gameScore(slug: string, value: number) {
  const { format } = getGameLeaderboardMeta(slug);
  return format === "seconds"
    ? formatLeaderboardScore(format, value).replace(".", ",")
    : `${formatLeaderboardScore(format, value)} pts`;
}
export function gameMode(slug: string, difficulty: string | null) {
  if (!difficulty) return "";
  return (
    getGameLeaderboardMeta(slug).buckets.find((b) => b.difficulty === difficulty)?.label ??
    { easy: "Facile", medium: "Moyen", hard: "Difficile" }[difficulty] ??
    ""
  );
}
export function courseFacts(row: CourseRow) {
  const legacy = decodeCourseMissionTelemetry(row.legacy);
  const placed = isCoursePlacementSkip(row.legacy);
  const best =
    row.best_total &&
    row.best != null &&
    (!legacy.quizTotal || row.best / row.best_total >= legacy.quizScore / legacy.quizTotal)
      ? { score: row.best, total: row.best_total }
      : legacy.quizTotal
        ? { score: legacy.quizScore, total: legacy.quizTotal }
        : null;
  return {
    best,
    read: Boolean(row.reading || legacy.readingCheckpointReached),
    passed: row.status === "completed" && !placed,
    placed,
  };
}
type Recommendation = { title: string; reason: string; label: string; href: string; course?: number };
export function recommendations(report: LearningReport): Recommendation[] {
  const graded = report.courses
    .map((row) => {
      const facts = courseFacts(row);
      const grade = row.score != null && row.total ? { score: row.score, total: row.total } : facts.best;
      return { row, grade };
    })
    .filter((x) => x.grade !== null)
    .sort((a, b) => (b.row.latest ?? "").localeCompare(a.row.latest ?? "") || a.row.course - b.row.course);
  const retry = graded.find((x) => x.grade && !isCourseQuizScorePassing(x.grade.score, x.grade.total));
  if (retry?.grade) {
    const id = retry.row.course;
    const reason = `Le ${retry.row.latest ? "dernier quiz" : "meilleur quiz conservé"} sur « ${courseName(id)} » donne ${retry.grade.score}/${retry.grade.total}. Le seuil de validation est de 80 %.`;
    return [
      { title: "Revoir la notion", reason, label: courseName(id), href: `/cours/${id}`, course: id },
      {
        title: "S’entraîner avec Grammar Rush",
        reason:
          "Le jeu intercale des questions de ce cours. Après la partie, refaire le quiz permet de comparer les deux résultats.",
        label: "Jouer sur cette notion",
        href: `/play/grammar-rush?cours=${id}`,
      },
    ];
  }
  const pending = report.courses.find((row) => {
    const { passed, placed, best, read } = courseFacts(row);
    return !passed && !placed && !best && (read || row.status === "in_progress");
  });
  if (pending)
    return [
      {
        title: "Essayer le quiz du cours commencé",
        reason: "Ce cours figure dans le parcours. Aucun résultat de quiz n’y est encore enregistré.",
        label: courseName(pending.course),
        href: `/cours/${pending.course}#quiz`,
        course: pending.course,
      },
    ];
  const strongest = graded.find((x) => x.grade && isCourseQuizScorePassing(x.grade.score, x.grade.total));
  if (strongest?.grade) {
    const id = strongest.row.course;
    const candidates = getCourseMetadata(id).recommendedGameSlugs.filter((slug) => getGameBySlug(slug));
    const slug =
      candidates.find((s) => !report.games.some((g) => g.slug === s)) ?? candidates[0] ?? "grammar-rush";
    return [
      {
        title: "Réutiliser la notion dans un jeu",
        reason: `Le quiz sur « ${courseName(id)} » a été réussi avec ${strongest.grade.score}/${strongest.grade.total}. Ce jeu fait partie des entraînements associés au cours.`,
        label: gameName(slug),
        href: `/play/${slug}${slug === "grammar-rush" ? `?cours=${id}` : ""}`,
      },
    ];
  }
  const lastAtlas = [...report.atlas].sort((a, b) => b.updated.localeCompare(a.updated))[0];
  const passage = lastAtlas && passages.find((p) => p.id === lastAtlas.mission);
  if (passage?.course)
    return [
      {
        title: "Reprendre la notion de la BD",
        reason: `L’escale « ${passage.title} » travaille cette notion. Le quiz du cours permet de la vérifier dans un autre contexte.`,
        label: courseName(passage.course.id),
        href: `/cours/${passage.course.id}`,
        course: passage.course.id,
      },
    ];
  if (report.games.length) {
    const latest = report.games[0].slug;
    const verb = latest === "speed-verb-challenge";
    const id = verb ? 11 : 1;
    return [
      {
        title: "Compléter les parties par un quiz",
        reason: `Une partie de ${gameName(latest)} est enregistrée. Un premier quiz donnera un repère sur une notion précise.`,
        label: courseName(id),
        href: `/cours/${id}`,
        course: id,
      },
    ];
  }
  return [
    {
      title: "Prendre un premier repère",
      reason: "Une première série de dix questions permettra de choisir un entraînement adapté.",
      label: courseName(1),
      href: "/cours/1",
      course: 1,
    },
  ];
}
