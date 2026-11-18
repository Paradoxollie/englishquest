"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LeaderboardAvatar } from "@/components/play/leaderboard-avatar";
import { formatLeaderboardScore, getGameLeaderboardMeta } from "@/lib/games/leaderboard-config";
import { getGameLeaderboard, type LeaderboardData } from "../actions";

export interface LeaderboardGameInfo {
  slug: string;
  name: string;
  description: string | null;
}

export function GameLeaderboard({
  games,
  currentUserId,
  initialSlug,
  initialData,
}: {
  games: LeaderboardGameInfo[];
  currentUserId?: string;
  initialSlug?: string;
  initialData?: LeaderboardData;
}) {
  const initialGame =
    games.find((game) => game.slug === initialSlug) ?? games[0] ?? null;

  const [selectedSlug, setSelectedSlug] = useState<string>(initialGame?.slug ?? "");
  const selectedGame = games.find((game) => game.slug === selectedSlug) ?? games[0] ?? null;

  const meta = getGameLeaderboardMeta(selectedGame?.slug ?? "");
  const [selectedBucketKey, setSelectedBucketKey] = useState<string>(meta.buckets[0]?.key ?? "all");
  const [cache, setCache] = useState<Record<string, LeaderboardData>>(() =>
    initialData && initialData.slug ? { [initialData.slug]: initialData } : {}
  );
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedGame) return;
    const nextMeta = getGameLeaderboardMeta(selectedGame.slug);
    setSelectedBucketKey(nextMeta.buckets[0]?.key ?? "all");

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.searchParams.get("game") !== selectedGame.slug) {
        url.searchParams.set("game", selectedGame.slug);
        window.history.replaceState(null, "", url.pathname + url.search + url.hash);
      }
    }

    if (cache[selectedGame.slug]) {
      setLoadingSlug(null);
      return;
    }

    let cancelled = false;
    setLoadingSlug(selectedGame.slug);
    getGameLeaderboard(selectedGame.slug)
      .then((data) => {
        if (!cancelled) {
          setCache((prev) => ({ ...prev, [selectedGame.slug]: data }));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCache((prev) => ({ ...prev, [selectedGame.slug]: { slug: selectedGame.slug, buckets: {} } }));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingSlug((current) => (current === selectedGame.slug ? null : current));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedGame, cache]);

  if (games.length === 0) {
    return (
      <div className="eq-card">
        <p className="eq-muted">Aucun jeu disponible pour le moment.</p>
      </div>
    );
  }

  const activeData = selectedGame ? cache[selectedGame.slug] : undefined;
  const activeBucket = meta.buckets.find((bucket) => bucket.key === selectedBucketKey) ?? meta.buckets[0];
  const standings = activeBucket ? activeData?.buckets[activeBucket.key] : undefined;
  const entries = standings?.entries ?? [];
  const loading = selectedGame ? loadingSlug === selectedGame.slug && !activeData : false;
  const myRank = standings?.myRank ?? null;
  const totalPlayers = standings?.totalPlayers ?? 0;
  const personalBest = standings?.personalBest ?? null;

  return (
    <div className="eq-board">
      <div className="eq-board-tabs" role="tablist" aria-label="Jeu">
        {games.map((game) => (
          <button
            key={game.slug}
            type="button"
            role="tab"
            aria-selected={selectedGame?.slug === game.slug}
            onClick={() => setSelectedSlug(game.slug)}
            className={`eq-board-tab${selectedGame?.slug === game.slug ? " is-active" : ""}`}
          >
            {game.name}
          </button>
        ))}
      </div>

      {selectedGame ? (
        <section className="eq-card eq-board-panel" aria-live="polite">
          <div className="eq-board-head">
            <div>
              <h2 className="eq-h3">{selectedGame.name}</h2>
              {selectedGame.description ? <p className="eq-muted">{selectedGame.description}</p> : null}
            </div>
            <Link href={`/play/${selectedGame.slug}`} className="eq-btn eq-btn-primary eq-btn-sm">
              Jouer
            </Link>
          </div>

          {meta.hasDifficultyTabs ? (
            <div className="eq-board-difficulty" role="tablist" aria-label="Difficulté">
              {meta.buckets.map((bucket) => (
                <button
                  key={bucket.key}
                  type="button"
                  role="tab"
                  aria-selected={activeBucket?.key === bucket.key}
                  onClick={() => setSelectedBucketKey(bucket.key)}
                  className={`eq-chip ${activeBucket?.key === bucket.key ? "eq-chip-cyan" : "eq-chip-muted"}`}
                >
                  {bucket.label}
                </button>
              ))}
            </div>
          ) : null}

          {!loading && currentUserId && personalBest != null ? (
            <p className="eq-game-board-me">
              Ton record : <b className="eq-num">{formatLeaderboardScore(meta.format, personalBest)}</b>
              {myRank != null && totalPlayers > 0 ? (
                <span className="eq-muted">
                  {" "}
                  · {myRank}
                  {myRank === 1 ? "re" : "e"} place sur {totalPlayers}
                </span>
              ) : null}
            </p>
          ) : null}

          {loading ? (
            <p className="eq-muted eq-board-empty">Chargement du classement…</p>
          ) : entries.length === 0 ? (
            <p className="eq-muted eq-board-empty">
              Aucun score enregistré{meta.hasDifficultyTabs ? " pour cette catégorie" : ""}. Sois le premier.
            </p>
          ) : (
            <ol className="eq-board-list">
              {entries.map((entry) => (
                <li
                  key={entry.user_id}
                  className={`eq-board-row${entry.user_id === currentUserId ? " is-me" : ""}${entry.rank <= 3 ? ` is-top-${entry.rank}` : ""}`}
                >
                  <span className="eq-board-rank">{entry.rank}</span>
                  <span className="eq-board-avatar">
                    <LeaderboardAvatar
                      equippedAvatar={entry.equipped_avatar ?? null}
                      equippedBackground={entry.equipped_background ?? null}
                      size={48}
                    />
                  </span>
                  <span className="eq-board-name">
                    <b>
                      {entry.username}
                      {entry.user_id === currentUserId ? <span className="eq-league-you"> (toi)</span> : null}
                    </b>
                    <small>
                      {entry.equipped_title ? `${entry.equipped_title.name} · ` : ""}
                      {entry.games_played} partie{entry.games_played > 1 ? "s" : ""}
                    </small>
                  </span>
                  <span className="eq-board-score">{formatLeaderboardScore(meta.format, entry.best_score)}</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      ) : null}
    </div>
  );
}
