"use client";

import { useRef, type KeyboardEvent } from "react";
import { GAME_LEVELS, getGameLevelLabel, type GameLevel } from "@/lib/games/levels";

/**
 * Choix du niveau de vocabulaire sur l'écran de démarrage d'un jeu.
 * Un joueur connecté voit le niveau de son chapitre en cours, qu'il peut
 * changer pour la partie ; un invité commence au niveau Débutant.
 */
export function LevelPicker({
  value,
  onChange,
  suggested,
  label = "Niveau du vocabulaire",
}: {
  value: GameLevel;
  onChange: (level: GameLevel) => void;
  suggested: GameLevel | null;
  label?: string;
}) {
  const groupRef = useRef<HTMLDivElement>(null);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const index = GAME_LEVELS.findIndex((level) => level.value === value);
    const next = GAME_LEVELS[(index + step + GAME_LEVELS.length) % GAME_LEVELS.length];
    onChange(next.value);
    window.requestAnimationFrame(() => {
      groupRef.current?.querySelector<HTMLButtonElement>(`[data-level="${next.value}"]`)?.focus();
    });
  };

  return (
    <div className="eq-level-picker">
      <p className="eq-level-picker-label" id="eq-level-picker-label">
        {label}
      </p>
      <div
        ref={groupRef}
        className="eq-level-picker-row"
        role="radiogroup"
        aria-labelledby="eq-level-picker-label"
        onKeyDown={onKeyDown}
      >
        {GAME_LEVELS.map((level) => {
          const checked = level.value === value;
          return (
            <button
              key={level.value}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={checked ? 0 : -1}
              data-level={level.value}
              className="eq-level-chip"
              onClick={() => onChange(level.value)}
            >
              <b>{level.label}</b>
              <span>{level.cefr}</span>
            </button>
          );
        })}
      </div>
      <p className="eq-level-picker-note">
        {suggested
          ? suggested === value
            ? `Niveau de ton chapitre en cours. Tu peux en changer pour cette partie.`
            : `Ton chapitre en cours correspond au niveau ${getGameLevelLabel(suggested)}.`
          : "Sans compte, commence par Débutant ou choisis ton niveau."}
      </p>
    </div>
  );
}
