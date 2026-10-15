import Link from "next/link";
import { LeaderboardAvatar } from "@/components/play/leaderboard-avatar";
import { formatRank } from "@/lib/profile/league";
import type { LeagueEntry, WeeklyLeague } from "@/lib/profile/league-server";

/* Ligue de la semaine, en tête de la page Classements. */

function LeagueRow({ entry, isMe }: { entry: LeagueEntry; isMe: boolean }) {
  return (
    <li
      className={`eq-board-row${isMe ? " is-me" : ""}${entry.rank <= 3 ? ` is-top-${entry.rank}` : ""}`}
      aria-current={isMe ? "true" : undefined}
    >
      <span className="eq-board-rank">
        <span className="sr-only">Place </span>
        {entry.rank}
      </span>
      <span className="eq-board-avatar">
        <LeaderboardAvatar username={entry.username} equippedAvatar={entry.avatar} equippedBackground={entry.background} size={48} />
      </span>
      <span className="eq-board-name">
        <b>
          {entry.username}
          {isMe ? <span className="eq-league-you"> (toi)</span> : null}
        </b>
        {entry.title ? <small>{entry.title.name}</small> : null}
      </span>
      <span className="eq-board-score">
        {entry.xp.toLocaleString("fr-FR")} <small>XP</small>
      </span>
    </li>
  );
}

export function WeeklyLeagueSection({ league, currentUserId }: { league: WeeklyLeague; currentUserId: string }) {
  const meOutsideTop = league.me && !league.meInTop ? league.me : null;

  return (
    <section className="eq-card eq-league" id="ligue" aria-labelledby="league-title">
      <div className="eq-league-head">
        <div>
          <p className="eq-kicker">Remise à zéro lundi, {league.resetLabel}</p>
          <h2 id="league-title" className="eq-h2">
            Ligue de la semaine
          </h2>
          <p className="eq-muted">
            Toute l&apos;XP gagnée depuis lundi compte : parties, missions, défi du jour, examens.
          </p>
        </div>
        {league.me ? (
          <p className="eq-league-me-chip eq-chip eq-chip-cyan">
            {formatRank(league.me.rank)} place sur {league.totalPlayers}, {league.me.xp.toLocaleString("fr-FR")} XP
          </p>
        ) : null}
      </div>

      {!league.available ? (
        <p className="eq-muted eq-board-empty">La ligue n&apos;est pas encore disponible. Reviens un peu plus tard.</p>
      ) : league.entries.length === 0 ? (
        <div className="eq-board-empty">
          <p className="eq-muted">Personne n&apos;a encore gagné d&apos;XP cette semaine. La première place est à prendre.</p>
          <Link href="/play" className="eq-btn eq-btn-gold eq-btn-sm mt-3">
            Jouer une partie
          </Link>
        </div>
      ) : (
        <>
          <ol className="eq-board-list" aria-label="Classement de la semaine">
            {league.entries.map((entry) => (
              <LeagueRow key={entry.userId} entry={entry} isMe={entry.userId === currentUserId} />
            ))}
            {meOutsideTop ? (
              <>
                <li className="eq-league-gap" aria-hidden="true">
                  …
                </li>
                <LeagueRow entry={meOutsideTop} isMe />
              </>
            ) : null}
          </ol>
          {!league.me ? (
            <p className="eq-muted eq-league-hint">
              Tu n&apos;es pas encore classé cette semaine. Une partie ou une mission suffit pour entrer dans la ligue.
            </p>
          ) : null}
        </>
      )}
    </section>
  );
}
