import Image from "next/image";
import Link from "next/link";
import { HomeClassCard } from "@/components/classes/home-class-card";
import { GameCard } from "@/components/play/game-card";
import { BadgeMedal } from "@/components/rewards/badge-medal";
import { MissionStarsLegend } from "@/components/rewards/mission-stars";
import { WelcomeGoldNotice } from "@/components/rewards/welcome-gold-notice";
import type { Chapter } from "@/lib/courses/chapters";
import type { MissionSummary } from "@/lib/courses/mission-summary";
import type { CourseRoadmapEntry } from "@/lib/courses/progress";
import { PRACTICE_STAR_TARGET, type MissionStars } from "@/lib/courses/stars";
import type { GameConfig } from "@/lib/games/config";
import { getBadgeDefinition, type BadgeTier } from "@/lib/profile/badges";
import type { DailyChallengeState } from "@/lib/profile/daily-challenge";
import type { getLevelProgress } from "@/lib/profile/economy";
import { formatRank } from "@/lib/profile/league";
import { resolveArt } from "@/lib/art-server";
import { getGamePresentation } from "@/lib/games/presentation";

type LevelProgress = ReturnType<typeof getLevelProgress>;

type HomeViewProps = {
  greetingLabel: string;
  username: string;
  userId: string;
  xp: number;
  gold: number;
  level: LevelProgress;
  completedCount: number;
  totalCourses: number;
  daily: DailyChallengeState;
  streakMultiplier: number;
  dailyXp: number;
  currentCourse: CourseRoadmapEntry | null;
  courseTitle: string | null;
  chapter: Chapter | null;
  mission: MissionSummary | null;
  dailyGames: GameConfig[];
  otherGames: GameConfig[];
  nextDailyGame: GameConfig | null;
  /** Nouveau joueur sans mission validée et sans test de niveau. */
  suggestPlacement?: boolean;
  /** Or de bienvenue à signaler (nouveau compte), sinon null. */
  welcomeGold?: number | null;
  latestBadges?: Array<{ key: string; name: string; tier: BadgeTier }>;
  badgeCount?: number;
  /** Ligue de la semaine ; null si elle n'est pas disponible. */
  week?: { rank: number | null; xp: number; totalPlayers: number; resetLabel: string } | null;
  missionStars?: MissionStars | null;
  missionPracticeBest?: number;
  totalStars?: number;
  maxStars?: number;
};

export function HomeView({
  greetingLabel,
  username,
  userId,
  xp,
  gold,
  level,
  completedCount,
  totalCourses,
  daily,
  streakMultiplier,
  dailyXp,
  currentCourse,
  courseTitle,
  chapter,
  mission,
  dailyGames,
  otherGames,
  nextDailyGame,
  suggestPlacement = false,
  welcomeGold = null,
  latestBadges = [],
  badgeCount = 0,
  week = null,
  missionStars = null,
  missionPracticeBest = 0,
  totalStars = 0,
  maxStars = 0,
}: HomeViewProps) {
  const completionPercent = totalCourses > 0 ? Math.round((completedCount / totalCourses) * 100) : 0;
  const streakBonusPercent = Math.round((streakMultiplier - 1) * 100);
  const chapterCover = chapter ? resolveArt(chapter.artSrc) : null;

  return (
    <div className="eq-container eq-section">
      <header className="eq-home-hero eq-slam">
        <div className="eq-home-identity">
          <span
            className="eq-ring eq-ring-lg"
            data-level={level.level}
            style={{ ["--p" as string]: level.percent }}
            aria-label={`Niveau ${level.level}, ${level.percent} % vers le niveau ${level.level + 1}`}
          />
          <div className="grid min-w-0 justify-items-start gap-2">
            <span className="eq-caption">{greetingLabel}</span>
            <h1 className="eq-cover-title eq-home-title">{username}</h1>
            <p className="eq-home-level">
              Niveau {level.level} · encore {level.xpToNext} XP avant le niveau {level.level + 1}
            </p>
            {latestBadges.length > 0 ? (
              <ul className="eq-home-badges" aria-label={`Derniers badges, ${badgeCount} au total`}>
                {latestBadges.map((badge) => (
                  <li key={badge.key}>
                    <Link href="/profile#badges" className="eq-badge-pill" title={getBadgeDefinition(badge.key)?.description}>
                      <BadgeMedal tier={badge.tier} category={getBadgeDefinition(badge.key)?.category ?? "mission"} size={22} />
                      <span>{badge.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
        <dl className="eq-home-stats">
          <div className="is-xp">
            <dt>Expérience</dt>
            <dd>{xp.toLocaleString("fr-FR")}</dd>
          </div>
          <div className="is-gold">
            <dt>Or</dt>
            <dd>{gold.toLocaleString("fr-FR")}</dd>
          </div>
          <div className="is-missions">
            <dt>Missions</dt>
            <dd>
              {completedCount}
              <small> / {totalCourses}</small>
            </dd>
          </div>
          <div className="is-streak">
            <dt>Série</dt>
            <dd>
              {daily.dailyStreak}
              <small> jour{daily.dailyStreak > 1 ? "s" : ""}</small>
            </dd>
          </div>
        </dl>
      </header>

      {welcomeGold ? <WelcomeGoldNotice userId={userId} gold={welcomeGold} /> : null}

      <HomeClassCard />
      <div className="eq-home-grid">
        {suggestPlacement ? (
          <section className="eq-card eq-home-placement" aria-labelledby="home-placement">
            <p className="eq-kicker">Nouveau ici ?</p>
            <h2 id="home-placement" className="eq-h3">
              Trouve ton point de départ
            </h2>
            <p className="text-sm text-[var(--muted)]">
              Six questions par chapitre, entre deux et huit minutes. Si tu connais déjà les bases, tu sautes les
              premiers chapitres et tu commences au bon endroit. Sinon, la mission 1 t&apos;attend juste en dessous.
            </p>
            <div className="eq-home-actions">
              <Link href="/test-de-niveau" className="eq-btn eq-btn-primary">
                Passer le test de niveau
              </Link>
            </div>
          </section>
        ) : null}
        <section className="eq-home-mission eq-panel eq-slam eq-slam-2" aria-labelledby="home-mission">
          {chapterCover ? (
            <div className="eq-home-mission-cover" aria-hidden="true">
              <Image src={chapterCover} alt="" fill sizes="(max-width: 768px) 40vw, 220px" className="object-cover" />
            </div>
          ) : null}
          <div className="eq-home-mission-body">
          {currentCourse && mission ? (
            <>
              <span className="eq-caption eq-caption-red">Ta prochaine mission</span>
              <p className="eq-kicker">
                Mission {currentCourse.courseId}
                {chapter ? ` · Chapitre ${chapter.id}, ${chapter.name}` : ""}
              </p>
              <h2 id="home-mission" className="eq-h2">
                {courseTitle ?? currentCourse.title}
              </h2>
              <p className="text-[var(--muted)]">{mission.note}</p>
              <ol className="eq-map-steps">
                <li className={mission.readingDone ? "is-done" : "is-now"}>Lire le cours</li>
                <li className={mission.quizDone ? "is-done" : mission.readingDone ? "is-now" : ""}>{mission.quizLabel}</li>
                <li>{mission.gameLabel}</li>
              </ol>
              {missionStars ? (
                <div className="eq-home-stars">
                  <p className="eq-kicker">Étoiles de la mission</p>
                  <MissionStarsLegend
                    stars={missionStars}
                    practiceBest={missionPracticeBest}
                    practiceTarget={PRACTICE_STAR_TARGET}
                  />
                </div>
              ) : null}
              <div className="eq-home-actions">
                <Link href={mission.cta.href} className="eq-btn eq-btn-primary eq-btn-lg">
                  {mission.cta.label}
                </Link>
                {mission.secondary ? (
                  <Link href={mission.secondary.href} className="eq-btn eq-btn-ghost">
                    {mission.secondary.label}
                  </Link>
                ) : null}
                <Link href="/quest" className="eq-btn eq-btn-ghost">
                  Voir la carte
                </Link>
              </div>
              <p className="mt-auto pt-3 text-sm text-[var(--gold)]">
                + {currentCourse.rewardXp} XP, + {currentCourse.rewardGold} or à la validation
              </p>
            </>
          ) : (
            <>
              <p className="eq-kicker">Aventure</p>
              <h2 id="home-mission" className="eq-h2">
                Toutes les missions sont validées
              </h2>
              <p className="text-[var(--muted)]">
                Tu as terminé la carte. Les jeux restent ouverts, et de nouveaux chapitres arrivent.
              </p>
              <div className="eq-home-actions">
                <Link href="/play" className="eq-btn eq-btn-gold">
                  Jouer
                </Link>
                <Link href="/quest" className="eq-btn eq-btn-ghost">
                  Voir la carte
                </Link>
              </div>
            </>
          )}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs font-bold text-[var(--muted)]">
              <span>Progression sur la carte</span>
              <span>
                {completionPercent} %{maxStars > 0 ? ` · ${totalStars} / ${maxStars} étoiles` : ""}
              </span>
            </div>
            <div className="eq-bar eq-bar-mint mt-1.5" aria-hidden="true">
              <i style={{ width: `${completionPercent}%` }} />
            </div>
          </div>
          </div>
        </section>

        <div className="eq-home-side">
          <section className="eq-card eq-home-daily flex flex-col" aria-labelledby="home-daily">
            <p className="eq-kicker">Défi du jour · {daily.challengeLabel}</p>
            <h2 id="home-daily" className="eq-h3">
              {daily.dailyGoalReached
                ? daily.bonusClaimedToday
                  ? "Défi réussi, bonus reçu"
                  : "Défi réussi"
                : `${daily.dailyGoalProgress} jeu${daily.dailyGoalProgress > 1 ? "x" : ""} sur ${daily.dailyGoalTarget}`}
            </h2>
            <ul className="eq-home-daily-list">
              {dailyGames.map((game) => {
                const done = daily.dailyPlayedGames.includes(game.slug);
                return (
                  <li key={game.slug} className={done ? "is-done" : ""}>
                    <Link href={`/play/${game.slug}`}>{game.name}</Link>
                    <span>{done ? "Joué" : "À jouer"}</span>
                  </li>
                );
              })}
            </ul>
            <p className="text-sm text-[var(--muted)]">
              Joue aux trois jeux du jour : + {dailyXp} XP et + {daily.goldBonus} or
              {streakBonusPercent > 0 ? ` (bonus de série + ${streakBonusPercent} %)` : ""}.
            </p>
            {nextDailyGame && !daily.dailyGoalReached ? (
              <div className="eq-home-actions mt-auto">
                <Link href={`/play/${nextDailyGame.slug}`} className="eq-btn eq-btn-primary">
                  Jouer à {nextDailyGame.name}
                </Link>
              </div>
            ) : null}
          </section>

          {week ? (
            <section className="eq-card eq-home-week" aria-labelledby="home-week">
              <p className="eq-kicker">Ligue de la semaine</p>
              <h2 id="home-week" className="eq-h3">
                Ta semaine
              </h2>
              {week.rank ? (
                <p className="eq-home-week-rank">
                  <b>{formatRank(week.rank)}</b>
                  <span>
                    place sur {week.totalPlayers}
                    <br />+ {week.xp.toLocaleString("fr-FR")} XP depuis lundi
                  </span>
                </p>
              ) : (
                <p className="text-sm text-[var(--muted)]">
                  Pas encore classé cette semaine. Une partie ou une mission suffit pour entrer dans la ligue.
                </p>
              )}
              <p className="text-xs font-bold text-[var(--muted)]">Remise à zéro lundi, {week.resetLabel}.</p>
              <Link href="/leaderboard#ligue" className="eq-btn eq-btn-ghost eq-btn-sm w-fit">
                Voir la ligue
              </Link>
            </section>
          ) : null}
        </div>
      </div>

      {otherGames.length > 0 ? (
        <section className="eq-home-games" aria-labelledby="home-games">
          <div className="eq-section-head">
            <div>
              <span className="eq-caption eq-caption-blue">Entraînement libre</span>
              <h2 id="home-games" className="eq-h2">
                Les jeux
              </h2>
            </div>
            <Link href="/play" className="eq-text-link">
              Tous les jeux
            </Link>
          </div>
          <div className="eq-games-grid">
            {otherGames.map((game) => (
              <GameCard key={game.slug} game={game} artSrc={resolveArt(getGamePresentation(game).artworkSrc)} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
