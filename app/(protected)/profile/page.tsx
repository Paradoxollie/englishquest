import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/(protected)/actions";
import { BadgesSection } from "@/components/rewards/badges-section";
import { RewardOnMount } from "@/components/rewards/reward-on-mount";
import { ClassJoinCard } from "@/components/classes/class-join-card";
import { isAdmin } from "@/lib/auth/roles";
import { lessons } from "@/lib/courses/lessons";
import { loadBadgesWithSync } from "@/lib/profile/badges-server";
import { getLevelProgress } from "@/lib/profile/economy";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/profile";
import { AvatarDisplay } from "./avatar-display";
import { CustomizationDisplay } from "./customization-display";
import { DeleteAccountForm } from "./delete-account-form";
import { ShopSection } from "./shop/shop-section";
import { TitleDisplay } from "./title-display";

export const metadata: Metadata = { title: "Profil" };

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

type BestScoreRow = {
  score: number;
  created_at: string;
  games: { name: string; slug?: string } | Array<{ name: string; slug?: string }> | null;
};

type CourseProgressRow = {
  status: string;
  courses: { course_number: number; title: string } | Array<{ course_number: number; title: string }> | null;
};

function relatedCourse(row: CourseProgressRow) {
  return Array.isArray(row.courses) ? row.courses[0] ?? null : row.courses;
}

function relatedGame(row: BestScoreRow) {
  return Array.isArray(row.games) ? row.games[0] ?? null : row.games;
}

const roleLabels: Record<string, string> = {
  student: "Élève",
  teacher: "Professeur",
  admin: "Administrateur",
};

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ motdepasse?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const adminClient = createSupabaseAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profileData } = await adminClient.from("profiles").select("*").eq("id", user.id).maybeSingle();
  const profile = profileData as Profile | null;

  if (!profile) {
    return (
      <div className="eq-container eq-section">
        <div className="eq-card mx-auto max-w-xl">
          <p className="eq-kicker">Profil introuvable</p>
          <h1 className="eq-h2 mt-2">Impossible de charger ton profil.</h1>
          <p className="eq-muted mt-3">Actualise la page. Si le problème continue, écris-nous depuis la page contact.</p>
        </div>
      </div>
    );
  }

  const [{ data: bestScores }, { data: courseProgress }, { count: gamesPlayed }, userIsAdmin, badges] = await Promise.all([
    adminClient
      .from("game_scores")
      .select("score, created_at, games ( id, name, slug )")
      .eq("user_id", user.id)
      .order("score", { ascending: false })
      .limit(40),
    adminClient
      .from("user_course_progress")
      .select("status, courses ( id, course_number, title )")
      .eq("user_id", user.id)
      .in("status", ["unlocked", "in_progress", "completed"]),
    adminClient.from("game_scores").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    isAdmin(),
    // Rattrape les badges déjà mérités avant de les afficher.
    loadBadgesWithSync(user.id),
  ]);

  const progressRows = (courseProgress ?? []) as CourseProgressRow[];
  const completedCourses = progressRows.filter((row) => row.status === "completed").length;
  const currentRow = progressRows.find((row) => row.status === "in_progress") ?? progressRows.find((row) => row.status === "unlocked");
  const currentCourse = currentRow ? relatedCourse(currentRow) : null;

  // Un seul meilleur score par jeu.
  const bestByGame = new Map<string, { name: string; score: number; slug: string | null }>();
  for (const row of (bestScores ?? []) as BestScoreRow[]) {
    const game = relatedGame(row);
    if (!game) continue;
    if (!bestByGame.has(game.name)) {
      bestByGame.set(game.name, { name: game.name, score: row.score, slug: game.slug ?? null });
    }
  }
  const bestList = Array.from(bestByGame.values());

  const level = getLevelProgress(profile.xp);
  const memberSince = new Date(profile.created_at).toLocaleDateString("fr-FR", { year: "numeric", month: "long" });

  return (
    <div className="eq-container eq-section eq-profile">
      <header className="eq-profile-head">
        <AvatarDisplay userId={user.id} username={profile.username} size="lg" />
        <div className="eq-profile-identity">
          <p className="eq-kicker">{roleLabels[profile.role] ?? profile.role}</p>
          <h1 className="eq-h1">{profile.username}</h1>
          <TitleDisplay userId={user.id} />
          <p className="eq-muted">Membre depuis {memberSince}</p>
        </div>
        <div className="eq-profile-level">
          <span className="eq-ring eq-ring-lg" data-level={level.level} style={{ "--p": level.percent } as React.CSSProperties} aria-hidden="true" />
          <div>
            <b>Niveau {level.level}</b>
            <span className="eq-bar eq-bar-cyan" aria-hidden="true">
              <i style={{ width: `${level.percent}%` }} />
            </span>
            <small>
              {level.xpIntoLevel} / {level.xpForLevel} XP · {level.xpToNext} XP avant le niveau {level.level + 1}
            </small>
          </div>
        </div>
      </header>

      <dl className="eq-home-stats eq-profile-stats">
        <div>
          <dt>Expérience totale</dt>
          <dd>{profile.xp} XP</dd>
        </div>
        <div>
          <dt>Or</dt>
          <dd>{profile.gold}</dd>
        </div>
        <div>
          <dt>Missions validées</dt>
          <dd>{completedCourses} / 50</dd>
        </div>
        <div>
          <dt>Parties jouées</dt>
          <dd>{gamesPlayed ?? 0}</dd>
        </div>
      </dl>

      <div className="eq-profile-grid">
        <section className="eq-card" aria-labelledby="profile-progress">
          <p className="eq-kicker">Aventure</p>
          <h2 id="profile-progress" className="eq-h3">
            {currentCourse
              ? `Mission ${currentCourse.course_number} · ${lessons[currentCourse.course_number]?.title ?? currentCourse.title}`
              : completedCourses >= 50
                ? "Les 50 missions sont validées."
                : "Aucune mission lancée"}
          </h2>
          <p className="eq-muted">
            {completedCourses} mission{completedCourses > 1 ? "s" : ""} validée{completedCourses > 1 ? "s" : ""} sur 50.
          </p>
          <div className="eq-home-actions">
            <Link href="/quest" className="eq-btn eq-btn-gold">
              Ouvrir la carte
            </Link>
            {currentCourse ? (
              <Link href={`/cours/${currentCourse.course_number}`} className="eq-btn eq-btn-ghost">
                Continuer le cours
              </Link>
            ) : null}
          </div>
        </section>

        <section className="eq-card" aria-labelledby="profile-scores">
          <p className="eq-kicker">Meilleurs scores</p>
          <h2 id="profile-scores" className="eq-h3">
            {bestList.length > 0 ? "Ton record par jeu" : "Pas encore de score"}
          </h2>
          {bestList.length > 0 ? (
            <ul className="eq-profile-scores">
              {bestList.map((item) => (
                <li key={item.name}>
                  {item.slug ? <Link href={`/play/${item.slug}`}>{item.name}</Link> : <span>{item.name}</span>}
                  <b>{item.score}</b>
                </li>
              ))}
            </ul>
          ) : (
            <p className="eq-muted">Joue une partie et ton premier record apparaîtra ici.</p>
          )}
          <div className="eq-home-actions">
            <Link href="/leaderboard" className="eq-btn eq-btn-ghost eq-btn-sm">
              Voir les classements
            </Link>
          </div>
        </section>
      </div>

      <BadgesSection earned={badges.all} stats={badges.stats} />
      {badges.newlyEarned.length > 0 ? <RewardOnMount detail={{ badges: badges.newlyEarned }} /> : null}

      <ClassJoinCard userId={user.id} />
      <section className="eq-profile-section" aria-labelledby="profile-look">
        <div className="eq-home-section-head">
          <div>
            <p className="eq-kicker">Apparence</p>
            <h2 id="profile-look" className="eq-h3">
              Avatar, titre et fond
            </h2>
          </div>
        </div>
        <CustomizationDisplay userId={user.id} username={profile.username} />
      </section>

      <section className="eq-profile-section" id="boutique" aria-labelledby="profile-shop">
        <div className="eq-home-section-head">
          <div>
            <p className="eq-kicker">Boutique</p>
            <h2 id="profile-shop" className="eq-h3">
              Dépense ton or
            </h2>
          </div>
          <span className="eq-chip eq-chip-gold">{profile.gold} or</span>
        </div>
        <p className="eq-muted eq-profile-shop-note">
          L&apos;or est rare : il vient des missions validées, des records et du défi du jour. Certains objets demandent aussi un
          niveau minimum.
        </p>
        <ShopSection userLevel={level.level} userGold={profile.gold} userId={user.id} />
      </section>

      <section className="eq-card eq-profile-account" aria-labelledby="profile-account">
        <p className="eq-kicker">Compte</p>
        <h2 id="profile-account" className="eq-h3">
          {user.email && !user.email.endsWith("@noreply.englishquest.local") ? user.email : "Compte sans adresse e-mail"}
        </h2>
        {params.motdepasse === "ok" ? (
          <p role="status" className="eq-chip eq-chip-mint w-fit">
            Mot de passe mis à jour.
          </p>
        ) : null}
        <p className="eq-muted text-sm">
          Tes données : pseudo, adresse e-mail si tu en as donné une, scores, progression et objets. Rien d&apos;autre.
          Tout est expliqué dans la{" "}
          <Link href="/confidentialite" className="font-bold text-[var(--cyan)]">
            politique de confidentialité
          </Link>
          .
        </p>
        <div className="eq-home-actions">
          {userIsAdmin ? (
            <Link href="/dashboard" className="eq-btn eq-btn-ghost">
              Tableau de bord
            </Link>
          ) : null}
          <Link href="/contact" className="eq-btn eq-btn-ghost">
            Nous écrire
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="eq-btn eq-btn-danger">
              Se déconnecter
            </button>
          </form>
        </div>
        <div className="mt-4">
          <DeleteAccountForm />
        </div>
      </section>
    </div>
  );
}
