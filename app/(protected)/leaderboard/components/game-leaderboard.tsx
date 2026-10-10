"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Difficulty } from "@/lib/profile/leveling";
import { LeaderboardAvatar } from "@/components/play/leaderboard-avatar";
import { getGameLeaderboard, type LeaderboardData } from "../actions";

interface Game {
  id: string;
  slug: string;
  name: string;
  description: string | null;
}

const VALID_GAME_SLUGS = ["speed-verb-challenge", "enigma-scroll", "wordfall", "space-lex", "flash-translation", "flashback", "grammar-rush"];
const GAMES_WITHOUT_DIFFICULTY = ["space-lex", "flash-translation", "flashback", "grammar-rush"];
const TIME_BASED = ["flash-translation"];

function getDifficultyLabels(gameSlug: string | null): Record<Difficulty, string> {
  if (gameSlug === "enigma-scroll") {
    return { easy: "4 lettres", medium: "5 lettres", hard: "6 lettres" };
  }
  return { easy: "Facile", medium: "Moyen", hard: "Difficile" };
}

function formatScore(slug: string, score: number) {
  if (TIME_BASED.includes(slug)) {
    return `${(score / 1000).toFixed(1)} s`;
  }
  return score.toLocaleString("fr-FR");
}

export function GameLeaderboard({ games, currentUserId }: { games: Game[]; currentUserId?: string }) {
  const validGames = games.filter((game) => VALID_GAME_SLUGS.includes(game.slug));
  const [selectedGame, setSelectedGame] = useState<Game | null>(validGames[0] ?? null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("easy");
  const [leaderboard, setLeaderboard] = useState<LeaderboardData>({ easy: [], medium: [], hard: [] });
  const [loading, setLoading] = useState(true);

  const hasDifficulty = selectedGame ? !GAMES_WITHOUT_DIFFICULTY.includes(selectedGame.slug) : true;

  useEffect(() => {
    if (!selectedGame) return;
    setSelectedDifficulty(GAMES_WITHOUT_DIFFICULTY.includes(selectedGame.slug) ? "medium" : "easy");
    let cancelled = false;
    setLoading(true);
    getGameLeaderboard(selectedGame.id)
      .then((data) => {
        if (!cancelled) setLeaderboard(data);
      })
      .catch(() => {
        if (!cancelled) setLeaderboard({ easy: [], medium: [], hard: [] });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedGame]);

  const entries = leaderboard[selectedDifficulty];
  const labels = getDifficultyLabels(selectedGame?.slug ?? null);

  if (validGames.length === 0) {
    return (
      <div className="eq-card">
        <p className="eq-muted">Aucun jeu disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="eq-board">
      <div className="eq-board-tabs" role="tablist" aria-label="Jeu">
        {validGames.map((game) => (
          <button
            key={game.id}
            type="button"
            role="tab"
            aria-selected={selectedGame?.id === game.id}
            onClick={() => setSelectedGame(game)}
            className={`eq-board-tab${selectedGame?.id === game.id ? " is-active" : ""}`}
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

          {hasDifficulty ? (
            <div className="eq-board-difficulty" role="tablist" aria-label="Difficulté">
              {(["easy", "medium", "hard"] as Difficulty[]).map((difficulty) => (
                <button
                  key={difficulty}
                  type="button"
                  role="tab"
                  aria-selected={selectedDifficulty === difficulty}
                  onClick={() => setSelectedDifficulty(difficulty)}
                  className={`eq-chip ${selectedDifficulty === difficulty ? "eq-chip-cyan" : "eq-chip-muted"}`}
                >
                  {labels[difficulty]}
                </button>
              ))}
            </div>
          ) : null}

          {loading ? (
            <p className="eq-muted eq-board-empty">Chargement du classement…</p>
          ) : entries.length === 0 ? (
            <p className="eq-muted eq-board-empty">
              Aucun score enregistré{hasDifficulty ? " pour cette difficulté" : ""}. Sois le premier.
            </p>
          ) : (
            <ol className="eq-board-list">
              {entries.map((entry) => (
                <li key={entry.user_id} className={`eq-board-row${entry.user_id === currentUserId ? " is-me" : ""}${entry.rank <= 3 ? ` is-top-${entry.rank}` : ""}`}>
                  <span className="eq-board-rank">{entry.rank}</span>
                  <span className="eq-board-avatar">
                    <LeaderboardAvatar
                      username={entry.username}
                      equippedAvatar={entry.equipped_avatar ?? null}
                      equippedBackground={entry.equipped_background ?? null}
                      size={48}
                    />
                  </span>
                  <span className="eq-board-name">
                    <b>{entry.username}</b>
                    <small>
                      {entry.equipped_title ? `${entry.equipped_title.name} · ` : ""}
                      {entry.games_played} partie{entry.games_played > 1 ? "s" : ""}
                    </small>
                  </span>
                  <span className="eq-board-score">{formatScore(selectedGame.slug, entry.best_score)}</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      ) : null}
    </div>
  );
}
