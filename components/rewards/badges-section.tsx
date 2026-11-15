import { BadgeMedal } from "@/components/rewards/badge-medal";
import { BADGE_TIER_LABELS, BADGES, getBadgeProgress, type BadgeStats } from "@/lib/profile/badges";

/* Section « Badges » du profil : obtenus en couleur avec leur date, les autres grisés avec leur condition. */

type EarnedBadgeLike = { key: string; earnedAt: string };

function formatEarnedDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" });
}

export function BadgesSection({ earned, stats }: { earned: EarnedBadgeLike[]; stats: BadgeStats | null }) {
  const earnedAt = new Map(earned.map((badge) => [badge.key, badge.earnedAt]));
  const earnedCount = BADGES.filter((badge) => earnedAt.has(badge.key)).length;
  const percent = Math.round((earnedCount / BADGES.length) * 100);

  return (
    <section className="eq-profile-section" id="badges" aria-labelledby="profile-badges">
      <div className="eq-home-section-head">
        <div>
          <p className="eq-kicker">Badges</p>
          <h2 id="profile-badges" className="eq-h3">
            {earnedCount === 0 ? "Ton premier badge t'attend" : `${earnedCount} badge${earnedCount > 1 ? "s" : ""} sur ${BADGES.length}`}
          </h2>
        </div>
        <span className="eq-chip eq-chip-gold-soft">
          {earnedCount} / {BADGES.length}
        </span>
      </div>
      <div className="eq-bar eq-badges-bar" aria-hidden="true">
        <i style={{ width: `${percent}%` }} />
      </div>

      <ul className="eq-badges-grid">
        {BADGES.map((badge) => {
          const date = earnedAt.get(badge.key);
          const isEarned = Boolean(date);
          const progress = !isEarned && stats ? getBadgeProgress(badge, stats) : null;
          const formatted = date ? formatEarnedDate(date) : null;
          return (
            <li key={badge.key} className={`eq-badge-card ${isEarned ? "is-earned" : "is-locked"}`} data-tier={badge.tier}>
              <BadgeMedal tier={badge.tier} category={badge.category} earned={isEarned} />
              <div className="eq-badge-card-body">
                <p className="eq-badge-card-title">
                  <b>{badge.name}</b>
                  <span className="eq-badge-tier">{BADGE_TIER_LABELS[badge.tier]}</span>
                </p>
                <p className="eq-badge-card-text">{badge.description}</p>
                {isEarned ? (
                  <p className="eq-badge-card-date">{formatted ? `Obtenu le ${formatted}` : "Obtenu"}</p>
                ) : (
                  <>
                    <span className="sr-only">Pas encore obtenu.</span>
                    {progress && progress.target > 1 ? (
                      <div className="eq-badge-card-progress">
                        <span className="eq-bar eq-bar-cyan" aria-hidden="true">
                          <i style={{ width: `${progress.percent}%` }} />
                        </span>
                        <small>
                          {progress.current} / {progress.target}
                        </small>
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
