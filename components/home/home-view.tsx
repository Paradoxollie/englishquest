import Link from "next/link";
import { GameCard } from "@/components/play/game-card";
import type { Chapter } from "@/lib/courses/chapters";
import type { MissionSummary } from "@/lib/courses/mission-summary";
import type { CourseRoadmapEntry } from "@/lib/courses/progress";
import type { GameConfig } from "@/lib/games/config";
import type { DailyChallengeState } from "@/lib/profile/daily-challenge";
import type { getLevelProgress } from "@/lib/profile/economy";

type LevelProgress = ReturnType<typeof getLevelProgress>;

type HomeViewProps = {
  greetingLabel: string;
  username: string;
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
  canAccessTeachers: boolean;
  /** Nouveau joueur sans mission validée et sans test de niveau. */
  suggestPlacement?: boolean;
};

export function HomeView({
  greetingLabel,
  username,
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
  canAccessTeachers,
  suggestPlacement = false,
}: HomeViewProps) {
  const completionPercent = totalCourses > 0 ? Math.round((completedCount / totalCourses) * 100) : 0;
  const streakBonusPercent = Math.round((streakMultiplier - 1) * 100);

  return (
    <div className="eq-container eq-section">
      <header className="eq-home-head">
        <div className="eq-home-identity">
          <span
            className="eq-ring eq-ring-lg"
            data-level={level.level}
            style={{ ["--p" as string]: level.percent }}
            aria-label={`Niveau ${level.level}, ${level.percent} % vers le niveau ${level.level + 1}`}
          />
          <div>
            <p className="eq-kicker">{greetingLabel}</p>
            <h1 className="eq-h1">{username}</h1>
            <p className="eq-home-level">
              Niveau {level.level} · {level.xpToNext} XP avant le niveau {level.level + 1}
            </p>
          </div>
        </div>
        <dl className="eq-home-stats">
          <div>
            <dt>Expérience</dt>
            <dd className="eq-num">{xp.toLocaleString("fr-FR")} XP</dd>
          </div>
          <div>
            <dt>Or</dt>
            <dd className="eq-num">{gold.toLocaleString("fr-FR")}</dd>
          </div>
          <div>
            <dt>Missions</dt>
            <dd className="eq-num">
              {completedCount} <span className="text-sm text-[var(--muted)]">/ {totalCourses}</span>
            </dd>
          </div>
          <div>
            <dt>Série</dt>
            <dd className="eq-num">
              {daily.dailyStreak} jour{daily.dailyStreak > 1 ? "s" : ""}
            </dd>
          </div>
        </dl>
      </header>

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
        <section className="eq-card eq-home-mission flex flex-col" aria-labelledby="home-mission">
          {currentCourse && mission ? (
            <>
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
                <li className={mission.gameDone ? "is-done" : mission.quizDone ? "is-now" : ""}>{mission.gameLabel}</li>
              </ol>
              <div className="eq-home-actions">
                <Link href={mission.cta.href} className={`eq-btn eq-btn-${mission.cta.tone}`}>
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
              <span>{completionPercent} %</span>
            </div>
            <div className="eq-bar eq-bar-mint mt-1.5" aria-hidden="true">
              <i style={{ width: `${completionPercent}%` }} />
            </div>
          </div>
        </section>

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
            Les trois jeux joués : + {dailyXp} XP et + {daily.goldBonus} or
            {streakBonusPercent > 0 ? ` (série de ${daily.dailyStreak} jours, + ${streakBonusPercent} %)` : ""}.
            Nouveau tirage {daily.nextRefreshLabel.toLowerCase()}.
          </p>
          {nextDailyGame && !daily.dailyGoalReached ? (
            <div className="eq-home-actions mt-auto">
              <Link href={`/play/${nextDailyGame.slug}`} className="eq-btn eq-btn-primary">
                Jouer à {nextDailyGame.name}
              </Link>
            </div>
          ) : null}
        </section>
      </div>

      {otherGames.length > 0 ? (
        <section className="eq-home-games" aria-labelledby="home-games">
          <div className="eq-home-section-head">
            <h2 id="home-games" className="eq-h2">
              Pour s&apos;entraîner
            </h2>
            <Link href="/play" className="font-bold text-[var(--cyan)]">
              Tous les jeux
            </Link>
          </div>
          <div className="eq-home-games-grid">
            {otherGames.map((game) => (
              <GameCard key={game.slug} game={game} compact />
            ))}
          </div>
        </section>
      ) : null}

      <nav className="eq-home-links" aria-label="Raccourcis">
        <Link href="/profile" className="eq-card eq-card-link">
          <p className="eq-h3">Profil et boutique</p>
          <p className="text-sm text-[var(--muted)]">Avatars, titres, meilleurs scores.</p>
        </Link>
        <Link href="/leaderboard" className="eq-card eq-card-link">
          <p className="eq-h3">Classements</p>
          <p className="text-sm text-[var(--muted)]">Où tu te situes, jeu par jeu.</p>
        </Link>
        <Link href={canAccessTeachers ? "/teachers" : "/tous-les-cours"} className="eq-card eq-card-link">
          <p className="eq-h3">{canAccessTeachers ? "Espace professeurs" : "Tous les cours"}</p>
          <p className="text-sm text-[var(--muted)]">
            {canAccessTeachers ? "Ressources et suivi de classe." : "Lire librement, dans n'importe quel ordre."}
          </p>
        </Link>
      </nav>
    </div>
  );
}
