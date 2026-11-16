import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/(protected)/actions";
import { BadgesSection } from "@/components/rewards/badges-section";
import { RewardOnMount } from "@/components/rewards/reward-on-mount";
import { ClassJoinCard } from "@/components/classes/class-join-card";
import { games as gameCatalog } from "@/lib/games/config";
import { formatLeaderboardScore, getGameLeaderboardMeta } from "@/lib/games/leaderboard-config";
import { getUserBestScoresBySlug } from "@/lib/games/leaderboard-service";
import { lessons } from "@/lib/courses/lessons";
import { loadBadgesWithSync } from "@/lib/profile/badges-server";
import { getLevelProgress } from "@/lib/profile/economy";
import { getServerUser } from "@/lib/supabase/auth-cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/types/profile";
import type { ShopItem, UserEquippedItems } from "@/types/shop";
import { AvatarDisplay } from "./avatar-display";
import { CustomizationDisplay } from "./customization-display";
import { DeleteAccountForm } from "./delete-account-form";
import { ShopSection } from "./shop/shop-section";
import { TitleDisplay } from "./title-display";

export const metadata: Metadata = { title: "Profil" };

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

type CourseProgressRow = {
  status: string;
  courses: { course_number: number; title: string } | Array<{ course_number: number; title: string }> | null;
};

function relatedCourse(row: CourseProgressRow) {
  return Array.isArray(row.courses) ? row.courses[0] ?? null : row.courses;
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
  const user = await getServerUser();

  if (!user) {
    redirect("/auth/login");
  }

  const adminClient = createSupabaseAdminClient();
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

  const scoreOrderBySlug = Object.fromEntries(
    gameCatalog.map((game) => [game.slug, getGameLeaderboardMeta(game.slug).scoreOrder])
  );

  const [bestBySlug, { data: courseProgress }, { count: gamesPlayed }, badges, { data: equippedData }] = await Promise.all([
    getUserBestScoresBySlug(user.id, scoreOrderBySlug),
    adminClient
      .from("user_course_progress")
      .select("status, courses ( id, course_number, title )")
      .eq("user_id", user.id)
      .in("status", ["unlocked", "in_progress", "completed"]),
    adminClient.from("game_scores").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    // Rattrape les badges déjà mérités avant de les afficher.
    loadBadgesWithSync(user.id),
    adminClient
      .from("user_equipped_items")
      .select(`
        *,
        equipped_avatar:shop_items!equipped_avatar_id(*),
        equipped_title:shop_items!equipped_title_id(*),
        equipped_background:shop_items!equipped_background_id(*)
      `)
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);
  const userIsAdmin = profile.role === "admin";
  const initialEquipped: UserEquippedItems | null = equippedData
    ? ({
        ...equippedData,
        equipped_avatar: Array.isArray(equippedData.equipped_avatar)
          ? equippedData.equipped_avatar[0] ?? null
          : equippedData.equipped_avatar ?? null,
        equipped_title: Array.isArray(equippedData.equipped_title)
          ? equippedData.equipped_title[0] ?? null
          : equippedData.equipped_title ?? null,
        equipped_background: Array.isArray(equippedData.equipped_background)
          ? equippedData.equipped_background[0] ?? null
          : equippedData.equipped_background ?? null,
      } as UserEquippedItems)
    : null;
  const initialTitle = (initialEquipped?.equipped_title as ShopItem | null | undefined) ?? null;

  const progressRows = (courseProgress ?? []) as CourseProgressRow[];
  const completedCourses = progressRows.filter((row) => row.status === "completed").length;
  const currentRow = progressRows.find((row) => row.status === "in_progress") ?? progressRows.find((row) => row.status === "unlocked");
  const currentCourse = currentRow ? relatedCourse(currentRow) : null;

  const bestList = gameCatalog
    .filter((game) => typeof bestBySlug[game.slug] === "number")
    .map((game) => ({
      name: game.name,
      slug: game.slug,
      scoreLabel: formatLeaderboardScore(getGameLeaderboardMeta(game.slug).format, bestBySlug[game.slug]),
    }));

  const level = getLevelProgress(profile.xp);
  const memberSince = new Date(profile.created_at).toLocaleDateString("fr-FR", { year: "numeric", month: "long" });

  return (
    <div className="eq-container eq-section eq-profile">
      <header className="eq-profile-head">
        <AvatarDisplay userId={user.id} username={profile.username} size="lg" initialEquipped={initialEquipped} />
        <div className="eq-profile-identity">
          <span className="eq-caption">{roleLabels[profile.role] ?? profile.role}</span>
          <h1 className="eq-h1">{profile.username}</h1>
          <TitleDisplay userId={user.id} initialTitle={initialTitle} />
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
        <div className="is-xp">
          <dt>Expérience totale</dt>
          <dd>{profile.xp} XP</dd>
        </div>
        <div className="is-gold">
          <dt>Or</dt>
          <dd>{profile.gold}</dd>
        </div>
        <div className="is-missions">
          <dt>Missions validées</dt>
          <dd>{completedCourses} / 50</dd>
        </div>
        <div className="is-streak">
          <dt>Parties jouées</dt>
          <dd>{gamesPlayed ?? 0}</dd>
        </div>
      </dl>

      <div className="eq-profile-grid">
        <section className="eq-card" aria-labelledby="profile-progress">
          <span className="eq-caption">Aventure</span>
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
          <span className="eq-caption">Meilleurs scores</span>
          <h2 id="profile-scores" className="eq-h3">
            {bestList.length > 0 ? "Ton record par jeu" : "Pas encore de score"}
          </h2>
          {bestList.length > 0 ? (
            <ul className="eq-profile-scores">
              {bestList.map((item) => (
                <li key={item.slug}>
                  <Link href={`/play/${item.slug}`}>{item.name}</Link>
                  <Link href={`/leaderboard?game=${item.slug}`} title={`Voir le classement ${item.name}`}>
                    <b>{item.scoreLabel}</b>
                  </Link>
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
      <section className="eq-profile-section eq-section-divider" aria-labelledby="profile-look">
        <div className="eq-section-head">
          <div>
            <span className="eq-caption">Apparence</span>
            <h2 id="profile-look" className="eq-h2">
              Avatar, titre, fond et vaisseau
            </h2>
          </div>
        </div>
        <CustomizationDisplay userId={user.id} username={profile.username} />
      </section>

      <section className="eq-profile-section eq-section-divider" id="boutique" aria-labelledby="profile-shop">
        <div className="eq-section-head">
          <div>
            <span className="eq-caption">Boutique</span>
            <h2 id="profile-shop" className="eq-h2">
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
        <span className="eq-caption">Compte</span>
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
          <Link href="/confidentialite" className="eq-text-link">
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
