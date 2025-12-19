"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type UserHomeData = {
  currentCourse: {
    id: string;
    course_number: number;
    title: string;
    status: string;
  } | null;
  dailyStreak: number;
  gamesPlayedToday: number;
  dailyGoalProgress: number; // 0-3 jeux
  lastPlayedDate: string | null;
};

/**
 * Calcule la série quotidienne basée sur les scores de jeux
 */
function calculateStreak(playedDates: string[]): number {
  if (playedDates.length === 0) return 0;

  // Trier les dates et enlever les doublons (un seul jeu par jour compte)
  const uniqueDates = Array.from(
    new Set(
      playedDates.map((date) => {
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      })
    )
  ).sort((a, b) => b.localeCompare(a)); // Plus récent en premier

  if (uniqueDates.length === 0) return 0;

  // Vérifier si le dernier jour joué est aujourd'hui ou hier
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

  // Si le dernier jour joué n'est ni aujourd'hui ni hier, la série est rompue
  if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) {
    return 0;
  }

  // Compter les jours consécutifs
  let streak = uniqueDates[0] === todayStr ? 1 : 0;
  let currentDate = uniqueDates[0] === todayStr ? today : yesterday;

  for (let i = uniqueDates[0] === todayStr ? 1 : 0; i < uniqueDates.length; i++) {
    const dateStr = uniqueDates[i];
    const expectedDate = new Date(currentDate);
    expectedDate.setDate(expectedDate.getDate() - 1);
    const expectedStr = `${expectedDate.getFullYear()}-${String(expectedDate.getMonth() + 1).padStart(2, "0")}-${String(expectedDate.getDate()).padStart(2, "0")}`;

    if (dateStr === expectedStr) {
      streak++;
      currentDate = expectedDate;
    } else {
      break;
    }
  }

  return streak;
}

export async function getUserHomeData(userId: string): Promise<UserHomeData> {
  const adminClient = createSupabaseAdminClient();

  // Récupérer les scores de jeux pour calculer la série
  const { data: gameScores } = await adminClient
    .from("game_scores")
    .select("played_at")
    .eq("user_id", userId)
    .order("played_at", { ascending: false });

  const playedDates = gameScores?.map((s) => s.played_at) || [];
  const dailyStreak = calculateStreak(playedDates);

  // Compter les jeux joués aujourd'hui
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString();

  const gamesPlayedToday =
    gameScores?.filter((s) => {
      const playedDate = new Date(s.played_at);
      playedDate.setHours(0, 0, 0, 0);
      return playedDate.toISOString() === todayStr;
    }).length || 0;

  // Récupérer le cours en cours (d'abord in_progress, sinon unlocked)
  let currentCourse = null;
  
  try {
    // Chercher un cours en cours
    const { data: inProgressCourse } = await adminClient
      .from("user_course_progress")
      .select(`
        status,
        course_id,
        courses:course_id (
          course_number,
          title
        )
      `)
      .eq("user_id", userId)
      .eq("status", "in_progress")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (inProgressCourse && inProgressCourse.courses && !Array.isArray(inProgressCourse.courses)) {
      const course = inProgressCourse.courses as any;
      currentCourse = {
        id: inProgressCourse.course_id,
        course_number: course.course_number,
        title: course.title,
        status: inProgressCourse.status,
      };
    } else {
      // Si pas de cours en cours, chercher le premier cours débloqué
      const { data: unlockedCourse } = await adminClient
        .from("user_course_progress")
        .select(`
          status,
          course_id,
          courses:course_id (
            course_number,
            title
          )
        `)
        .eq("user_id", userId)
        .eq("status", "unlocked")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (unlockedCourse && unlockedCourse.courses && !Array.isArray(unlockedCourse.courses)) {
        const course = unlockedCourse.courses as any;
        currentCourse = {
          id: unlockedCourse.course_id,
          course_number: course.course_number,
          title: course.title,
          status: unlockedCourse.status,
        };
      }
    }
  } catch (error) {
    // Si la table n'existe pas encore, on continue sans cours
    console.log("Course progress table might not exist yet");
  }

  // Dernière date de jeu
  const lastPlayedDate = playedDates.length > 0 ? playedDates[0] : null;

  return {
    currentCourse,
    dailyStreak,
    gamesPlayedToday,
    dailyGoalProgress: Math.min(gamesPlayedToday, 3),
    lastPlayedDate,
  };
}

