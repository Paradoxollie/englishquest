import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ComponentType } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/auth/roles";
import type { Profile } from "@/types/profile";
import {
  ArrowRightIcon,
  AvatarIcon,
  BookIcon,
  GameIcon,
  GiftIcon,
  GoldIcon,
  LevelIcon,
  ScrollIcon,
  TrophyIcon,
  XPIcon,
} from "@/components/ui/icons";
import { CustomizationDisplay } from "./customization-display";
import { ShopSection } from "./shop/shop-section";
import { AvatarDisplay } from "./avatar-display";
import { TitleDisplay } from "./title-display";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

type IconComponent = ComponentType<{ className?: string }>;

type BestScoreRow = {
  score: number;
  created_at: string;
  games: { name: string } | Array<{ name: string }> | null;
};

type CourseProgressRow = {
  status: string;
  courses: { course_number: number; title: string } | Array<{ course_number: number; title: string }> | null;
};

function getXPForNextLevel(level: number): number {
  return Math.max(level, 1) * 1000;
}

function getXPProgress(currentXP: number, level: number) {
  const required = getXPForNextLevel(level);
  const percentage = required > 0 ? Math.min((currentXP / required) * 100, 100) : 0;

  return {
    current: currentXP,
    required,
    percentage: Math.round(percentage),
  };
}

function getRelatedCourse(row: CourseProgressRow) {
  if (Array.isArray(row.courses)) {
    return row.courses[0] ?? null;
  }

  return row.courses;
}

function getRelatedGameName(row: BestScoreRow) {
  if (Array.isArray(row.games)) {
    return row.games[0]?.name ?? "Jeu inconnu";
  }

  return row.games?.name ?? "Jeu inconnu";
}

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const adminClient = createSupabaseAdminClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("Error getting user in ProfilePage:", {
      message: userError.message,
      status: userError.status,
    });
  }

  if (!user) {
    redirect("/auth/login");
  }

  let { data: profileData, error } = await adminClient
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Error loading profile in ProfilePage:", {
      code: error.code,
      message: error.message,
    });
  }

  if (!profileData) {
    const username =
      user.user_metadata?.username ||
      user.email?.split("@")[0] ||
      `user_${user.id.slice(0, 8)}`;
    const cleanUsername = username
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "_")
      .substring(0, 50);

    const { data: newProfile, error: createError } = await adminClient
      .from("profiles")
      .insert({
        id: user.id,
        username: cleanUsername,
        email: user.email || null,
        role: "student",
        xp: 0,
        gold: 0,
        level: 1,
      })
      .select()
      .single();

    if (!createError) {
      profileData = newProfile;
    }
  }

  const profile = profileData as Profile | null;

  if (!profile) {
    return (
      <section className="-m-6 bg-[#020617] p-6 text-white md:-m-8 md:p-8">
        <div className="border-4 border-black bg-slate-950 p-6 shadow-[0_4px_0_#000]">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-red-300">
            Profil introuvable
          </p>
          <h1 className="mt-2 text-3xl font-bold text-white text-outline">
            Impossible de charger les donnees du profil.
          </h1>
          <p className="mt-3 text-sm font-semibold text-slate-300">
            Actualise la page ou contacte le support si le probleme continue.
          </p>
        </div>
      </section>
    );
  }

  const [{ data: bestScores }, { data: courseProgress }, userIsAdmin] = await Promise.all([
    adminClient
      .from("game_scores")
      .select(
        `
          score,
          created_at,
          games (
            id,
            name
          )
        `
      )
      .eq("user_id", user.id)
      .order("score", { ascending: false })
      .limit(5),
    adminClient
      .from("user_course_progress")
      .select(
        `
          status,
          courses (
            id,
            course_number,
            title
          )
        `
      )
      .eq("user_id", user.id)
      .in("status", ["unlocked", "in_progress", "completed"]),
    isAdmin(),
  ]);

  const progressRows = (courseProgress ?? []) as CourseProgressRow[];
  const completedCourses = progressRows.filter((row) => row.status === "completed").length;
  const coursesWithNumbers = progressRows
    .map(getRelatedCourse)
    .filter((course): course is { course_number: number; title: string } => Boolean(course));
  const highestCourse =
    coursesWithNumbers.length > 0
      ? coursesWithNumbers.reduce((max, current) =>
          current.course_number > max.course_number ? current : max
        )
      : null;
  const bestScoreRows = (bestScores ?? []) as BestScoreRow[];
  const xpProgress = getXPProgress(profile.xp, profile.level);
  const roleLabels: Record<string, string> = {
    student: "Eleve",
    teacher: "Professeur",
    admin: "Administrateur",
  };
  const memberSince = new Date(profile.created_at).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="-m-6 overflow-hidden bg-[#020617] text-white md:-m-8">
      <section className="relative overflow-hidden border-b-4 border-black">
        <Image
          src="/page-art/home-hero.png"
          alt="Illustration comic book English Quest."
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/88 to-[#020617]/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-black/42" />
        <div className="absolute inset-0 comic-dot-pattern-light opacity-20" />

        <div className="relative mx-auto grid min-h-[610px] max-w-[1280px] gap-6 px-4 py-8 md:min-h-[650px] md:px-8 md:py-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-end">
          <div className="self-end">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200 text-outline">
              Profil joueur
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-[1.02] text-white text-outline md:text-6xl">
              {profile.username}
            </h1>
            <div className="mt-3">
              <TitleDisplay userId={user.id} />
            </div>
            <p className="mt-5 max-w-3xl text-base font-semibold leading-relaxed text-slate-100 text-outline md:text-xl">
              Ton profil regroupe progression, apparence, recompenses, boutique et meilleurs scores
              dans un espace plus clair.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/quest"
                className="comic-button inline-flex items-center gap-2 bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700"
              >
                <BookIcon className="h-4 w-4" />
                Continuer l'aventure
              </Link>
              <Link
                href="/play"
                className="comic-button inline-flex items-center gap-2 bg-amber-600 px-5 py-3 text-sm font-bold text-white hover:bg-amber-700"
              >
                <GameIcon className="h-4 w-4" />
                Lancer un jeu
              </Link>
              {userIsAdmin && (
                <Link
                  href="/dashboard"
                  className="comic-button inline-flex items-center gap-2 bg-cyan-600 px-5 py-3 text-sm font-bold text-white hover:bg-cyan-700"
                >
                  Dashboard admin
                </Link>
              )}
            </div>
          </div>

          <aside className="self-end border-4 border-black bg-slate-950/92 p-5 shadow-[0_4px_0_#000] backdrop-blur-sm md:p-6">
            <div className="flex items-start gap-4">
              <AvatarDisplay userId={user.id} username={profile.username} size="lg" />
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                  {roleLabels[profile.role] || profile.role}
                </p>
                <h2 className="mt-2 text-2xl font-bold text-white text-outline">
                  Niveau {profile.level}
                </h2>
                <p className="mt-1 text-sm font-semibold text-slate-300">
                  Membre depuis {memberSince}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 font-semibold text-slate-300">
                  <XPIcon className="h-4 w-4 text-emerald-300" />
                  <span>Experience</span>
                </div>
                <span className="font-bold text-slate-300">
                  {xpProgress.current.toLocaleString("fr-FR")} / {xpProgress.required.toLocaleString("fr-FR")}
                </span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full border border-black bg-slate-900">
                <div
                  className="relative h-full rounded-full bg-gradient-to-r from-emerald-700 via-emerald-500 to-emerald-300"
                  style={{ width: `${xpProgress.percentage}%` }}
                >
                  <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <main className="mx-auto max-w-[1280px] px-4 py-10 md:px-8 md:py-12">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <ProfileMetric label="Niveau" value={profile.level} detail={`${xpProgress.percentage}% vers le suivant`} Icon={LevelIcon} tone="cyan" />
          <ProfileMetric label="XP" value={profile.xp.toLocaleString("fr-FR")} detail="Experience totale" Icon={XPIcon} tone="emerald" />
          <ProfileMetric label="Or" value={profile.gold.toLocaleString("fr-FR")} detail="Disponible boutique" Icon={GoldIcon} tone="amber" />
          <ProfileMetric label="Cours valides" value={completedCourses} detail={highestCourse ? `Max: cours ${highestCourse.course_number}` : "Aucun cours commence"} Icon={ScrollIcon} tone="purple" />
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div className="border-4 border-black bg-slate-950 p-5 shadow-[0_4px_0_#000] md:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300 text-outline">
              Compte
            </p>
            <h2 className="mt-2 text-3xl font-bold text-white text-outline">
              Informations principales
            </h2>
            <dl className="mt-6 space-y-4">
              <InfoRow label="Nom d'utilisateur" value={profile.username} />
              <InfoRow label="Role" value={roleLabels[profile.role] || profile.role} />
              <InfoRow label="Email" value={profile.email ?? "Non renseigne"} />
              <InfoRow label="Membre depuis" value={memberSince} />
            </dl>
          </div>

          <div className="border-4 border-black bg-slate-950 p-5 shadow-[0_4px_0_#000] md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300 text-outline">
                  Progression
                </p>
                <h2 className="mt-2 text-3xl font-bold text-white text-outline">
                  Position dans le parcours
                </h2>
              </div>
              <Link
                href="/tous-les-cours"
                className="inline-flex w-fit items-center gap-2 text-sm font-bold text-cyan-300 hover:underline"
              >
                Voir les cours
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <div className="border border-white/10 bg-white/5 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Cours le plus haut
                </p>
                <p className="mt-2 text-lg font-bold leading-tight text-white text-outline">
                  {highestCourse
                    ? `Cours ${highestCourse.course_number}: ${highestCourse.title}`
                    : "Aucun cours commence"}
                </p>
              </div>
              <div className="border border-white/10 bg-white/5 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Prochain niveau
                </p>
                <p className="mt-2 text-lg font-bold text-emerald-300">
                  Niveau {profile.level + 1}
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-300">
                  {xpProgress.required - xpProgress.current > 0
                    ? `${(xpProgress.required - xpProgress.current).toLocaleString("fr-FR")} XP restants`
                    : "Palier atteint"}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.78fr)]">
          <div className="border-4 border-black bg-slate-950 p-5 shadow-[0_4px_0_#000] md:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center border-4 border-black bg-cyan-600 shadow-[0_3px_0_#000]">
                <AvatarIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300 text-outline">
                  Apparence
                </p>
                <h2 className="text-3xl font-bold text-white text-outline">
                  Personnalisation
                </h2>
              </div>
            </div>
            <CustomizationDisplay userId={user.id} username={profile.username} />
          </div>

          <div className="border-4 border-black bg-slate-950 p-5 shadow-[0_4px_0_#000] md:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center border-4 border-black bg-purple-600 shadow-[0_3px_0_#000]">
                <TrophyIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-purple-300 text-outline">
                  Scores
                </p>
                <h2 className="text-3xl font-bold text-white text-outline">
                  Meilleurs jeux
                </h2>
              </div>
            </div>

            {bestScoreRows.length > 0 ? (
              <div className="space-y-3">
                {bestScoreRows.map((scoreData, index) => (
                  <div
                    key={`${scoreData.created_at}-${index}`}
                    className="flex items-center justify-between gap-4 border border-white/10 bg-white/5 p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">
                        {getRelatedGameName(scoreData)}
                      </p>
                      <p className="text-xs font-semibold text-slate-400">
                        {new Date(scoreData.created_at).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-emerald-300">
                        {scoreData.score.toLocaleString("fr-FR")}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                        pts
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-slate-300">
                  Aucun score enregistre pour le moment.
                </p>
                <Link
                  href="/play"
                  className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-amber-300 hover:underline"
                >
                  Lancer un jeu
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className="mt-8 border-4 border-black bg-slate-950 p-5 shadow-[0_4px_0_#000] md:p-6">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-300 text-outline">
                Boutique
              </p>
              <h2 className="mt-2 text-3xl font-bold text-white text-outline">
                Debloquer et equiper
              </h2>
            </div>
            <div className="inline-flex w-fit items-center gap-2 border-4 border-black bg-amber-600 px-4 py-2 text-sm font-bold text-white shadow-[0_3px_0_#000]">
              <GiftIcon className="h-4 w-4" />
              {profile.gold.toLocaleString("fr-FR")} or
            </div>
          </div>
          <div className="relative z-10">
            <ShopSection userLevel={profile.level} userGold={profile.gold} userId={user.id} />
          </div>
        </section>
      </main>
    </div>
  );
}

function ProfileMetric({
  label,
  value,
  detail,
  Icon,
  tone,
}: {
  label: string;
  value: string | number;
  detail: string;
  Icon: IconComponent;
  tone: "cyan" | "emerald" | "amber" | "purple";
}) {
  const tones = {
    cyan: "border-cyan-300/25 bg-cyan-950/28 text-cyan-200 bg-cyan-600",
    emerald: "border-emerald-300/25 bg-emerald-950/28 text-emerald-200 bg-emerald-600",
    amber: "border-amber-300/25 bg-amber-950/28 text-amber-200 bg-amber-600",
    purple: "border-purple-300/25 bg-purple-950/28 text-purple-200 bg-purple-600",
  };
  const [borderClass, panelClass, textClass, iconClass] = tones[tone].split(" ");

  return (
    <div className={`border-4 border-black bg-slate-950 p-5 shadow-[0_4px_0_#000] ${borderClass} ${panelClass}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            {label}
          </p>
          <p className={`mt-3 break-words text-3xl font-bold ${textClass}`}>{value}</p>
          <p className="mt-2 text-sm font-semibold text-slate-300">{detail}</p>
        </div>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center border-4 border-black text-white shadow-[0_3px_0_#000] ${iconClass}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/10 bg-white/5 p-4">
      <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </dt>
      <dd className="mt-2 break-words text-base font-bold text-white">{value}</dd>
    </div>
  );
}
