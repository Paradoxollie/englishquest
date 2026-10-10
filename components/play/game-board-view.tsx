"use client";

import { useState } from "react";
import type { PublicLeaderboardEntry } from "@/lib/games/leaderboard-service";
import { LeaderboardAvatar } from "./leaderboard-avatar";

export type BoardBucketView = {
  key: string;
  label: string;
  entries: PublicLeaderboardEntry[];
  personalBest: number | null;
};

export function formatBoardScore(format: "points" | "seconds", score: number) {
  if (format === "seconds") {
    return `${(score / 1000).toFixed(1)} s`;
  }
  return score.toLocaleString("fr-FR");
}

export function GameBoardView({
  buckets,
  currentUserId,
  format,
  title = "Classement",
}: {
  buckets: BoardBucketView[];
  currentUserId: string | null;
  format: "points" | "seconds";
  title?: string;
}) {
  const [activeKey, setActiveKey] = useState(buckets[0]?.key ?? "");
  const active = buckets.find((bucket) => bucket.key === activeKey) ?? buckets[0];

  if (!active) {
    return null;
  }

  return (
    <section className="eq-card eq-game-board" aria-label={title}>
      <h3>{title}</h3>
      {buckets.length > 1 ? (
        <div className="eq-board-difficulty" role="tablist" aria-label="Catégorie">
          {buckets.map((bucket) => (
            <button
              key={bucket.key}
              type="button"
              role="tab"
              aria-selected={bucket.key === active.key}
              onClick={() => setActiveKey(bucket.key)}
              className={`eq-chip ${bucket.key === active.key ? "eq-chip-cyan" : "eq-chip-muted"}`}
            >
              {bucket.label}
            </button>
          ))}
        </div>
      ) : null}

      {currentUserId ? (
        <p className="eq-game-board-me">
          Ton record : <b className="eq-num">{active.personalBest == null ? "aucun" : formatBoardScore(format, active.personalBest)}</b>
        </p>
      ) : null}

      {active.entries.length === 0 ? (
        <p className="eq-muted eq-board-empty">Aucun score enregistré. Sois le premier.</p>
      ) : (
        <ol className="eq-board-list">
          {active.entries.map((entry) => (
            <li
              key={entry.user_id}
              className={`eq-board-row is-compact${entry.user_id === currentUserId ? " is-me" : ""}${entry.rank <= 3 ? ` is-top-${entry.rank}` : ""}`}
            >
              <span className="eq-board-rank">{entry.rank}</span>
              <span className="eq-board-avatar">
                <LeaderboardAvatar
                  username={entry.username}
                  equippedAvatar={entry.equipped_avatar}
                  equippedBackground={entry.equipped_background}
                  size={36}
                />
              </span>
              <span className="eq-board-name">
                <b>{entry.username}</b>
                {entry.equipped_title ? <small>{entry.equipped_title.name}</small> : null}
              </span>
              <span className="eq-board-score">{formatBoardScore(format, entry.best_score)}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
