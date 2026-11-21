"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { LiveRound } from "@/lib/classes/live-shared";
import { games } from "@/lib/games/config";
import { isGameSessionSlug, type GameSessionSlug } from "@/lib/games/game-session-rules";
import { courseChoices, describeRound, durationLabel } from "./live-round-catalog";

type DraftEntry = { id: number; round: LiveRound };
type PlannerProps = { busy: boolean; onPrepare: (rounds: LiveRound[]) => void };

export function LiveTeacherPlanner({ busy, onPrepare }: PlannerProps) {
  const [kind, setKind] = useState<LiveRound["kind"]>("game");
  const [slug, setSlug] = useState<GameSessionSlug>("space-lex");
  const [courseId, setCourseId] = useState(1);
  const [minutes, setMinutes] = useState("2");
  const [seconds, setSeconds] = useState("0");
  const [entries, setEntries] = useState<DraftEntry[]>([]);
  const [editing, setEditing] = useState<number | null>(null);
  const [notice, setNotice] = useState("");
  const sequence = useRef(0);
  const editor = useRef<HTMLHeadingElement>(null);
  const durationSeconds = Number(minutes) * 60 + Number(seconds);
  const picked: LiveRound = kind === "game" ? { kind, slug, durationSeconds } : { kind, courseId, durationSeconds };
  const description = describeRound(picked);
  const total = entries.reduce((sum, entry) => sum + entry.round.durationSeconds, 0);

  function chooseKind(next: LiveRound["kind"]) {
    setKind(next);
    setNotice("");
  }

  function addOrUpdate() {
    if (!Number.isInteger(durationSeconds) || durationSeconds < 30 || durationSeconds > 1800) {
      setNotice("Choisissez une durée entre 30 secondes et 30 minutes.");
      return;
    }
    const previous = entries.find((entry) => entry.id === editing)?.round.durationSeconds ?? 0;
    if (total - previous + durationSeconds > 10800) {
      setNotice("La durée totale de la séance est limitée à trois heures.");
      return;
    }
    if (editing !== null) {
      setEntries(entries.map((entry) => entry.id === editing ? { ...entry, round: picked } : entry));
      setEditing(null);
      setNotice("Manche modifiée.");
    } else if (entries.length < 12) {
      sequence.current += 1;
      setEntries([...entries, { id: sequence.current, round: picked }]);
      setNotice(`Manche ${entries.length + 1} ajoutée.`);
    }
  }

  function edit(entry: DraftEntry) {
    const round = entry.round;
    setEditing(entry.id);
    setKind(round.kind);
    if (round.kind === "game") setSlug(round.slug);
    else setCourseId(round.courseId);
    setMinutes(String(Math.floor(round.durationSeconds / 60)));
    setSeconds(String(round.durationSeconds % 60));
    setNotice("");
    editor.current?.focus();
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    const moved = entries.slice();
    [moved[index], moved[target]] = [moved[target], moved[index]];
    setEntries(moved);
    setNotice(`${describeRound(moved[target].round).title} passe en position ${target + 1}.`);
  }

  return (
    <div className="live-teacher-planner">
      <form className="live-teacher-panel live-teacher-picker" onSubmit={(event) => { event.preventDefault(); addOrUpdate(); }}>
        <h2 className="eq-h3" ref={editor} tabIndex={-1}>{editing === null ? "Choisir une activité" : "Modifier la manche"}</h2>
        <div className="live-teacher-tabs" role="group" aria-label="Type d’activité">
          <button type="button" aria-pressed={kind === "game"} onClick={() => chooseKind("game")}>Jeux</button>
          <button type="button" aria-pressed={kind === "course"} onClick={() => chooseKind("course")}>Cours</button>
        </div>
        <div className="eq-class-field">
          <label htmlFor="live-picker-activity">{kind === "game" ? "Jeu" : "Mission du parcours"}</label>
          {kind === "game" ? (
            <select id="live-picker-activity" className="eq-class-input" value={slug} onChange={(e) => { if (isGameSessionSlug(e.target.value)) setSlug(e.target.value); }}>
              {games.map((game) => <option key={game.slug} value={game.slug}>{game.name}</option>)}
            </select>
          ) : (
            <select id="live-picker-activity" className="eq-class-input" value={courseId} onChange={(e) => setCourseId(Number(e.target.value))}>
              {courseChoices.map((chapter) => (
                <optgroup key={chapter.label} label={chapter.label}>
                  {chapter.courses.map((course) => <option key={course.id} value={course.id}>{course.id}. {course.title}</option>)}
                </optgroup>
              ))}
            </select>
          )}
        </div>
        <div className="live-teacher-preview">
          <Image src={description.image} alt="" width={192} height={128} sizes="110px" />
          <div><strong>{description.category}</strong><p>{description.detail}</p></div>
        </div>
        <fieldset className="live-teacher-duration">
          <legend>Durée de la manche</legend>
          <label><input className="eq-class-input" aria-label="Minutes" type="number" min="0" max="30" step="1" value={minutes} onChange={(e) => setMinutes(e.target.value)} /> min</label>
          <label><input className="eq-class-input" aria-label="Secondes" type="number" min="0" max="59" step="1" value={seconds} onChange={(e) => setSeconds(e.target.value)} /> s</label>
        </fieldset>
        <div className="eq-home-actions">
          <button className="eq-btn eq-btn-primary" type="submit" disabled={busy || (editing === null && entries.length >= 12)}>
            {editing === null ? "Ajouter la manche" : "Enregistrer la manche"}
          </button>
          {editing !== null && <button type="button" className="eq-btn eq-btn-ghost eq-btn-sm" onClick={() => { setEditing(null); setNotice(""); }}>Annuler</button>}
        </div>
        <p className="live-teacher-feedback" role="status">{notice}</p>
      </form>
      <section className="live-teacher-panel live-teacher-queue" aria-labelledby="live-programme">
        <div className="live-teacher-sectionhead">
          <h2 id="live-programme" className="eq-h3">Programme de la séance</h2>
          {entries.length > 0 && <span className="live-teacher-small-total">{durationLabel(total)}</span>}
        </div>
        {entries.length === 0 ? (
          <p className="live-teacher-empty">Ajoutez le premier jeu ou cours. Les manches s’enchaîneront dans l’ordre choisi.</p>
        ) : (
          <ol className="live-teacher-queue-list">
            {entries.map((entry, index) => {
              const activity = describeRound(entry.round);
              return (
                <li key={entry.id}>
                  <span className="live-teacher-seq" aria-hidden="true">{index + 1}</span>
                  <div className="live-teacher-entry">
                    <b>{activity.title}</b><small>{durationLabel(entry.round.durationSeconds)}</small>
                    <div className="live-teacher-entry-tools">
                      <button type="button" disabled={busy} onClick={() => edit(entry)} aria-label={`Modifier la manche ${index + 1}`}>Modifier</button>
                      <button type="button" disabled={index === 0 || busy} onClick={() => move(index, -1)} aria-label={`Avancer la manche ${index + 1}`}>↑</button>
                      <button type="button" disabled={index === entries.length - 1 || busy} onClick={() => move(index, 1)} aria-label={`Reculer la manche ${index + 1}`}>↓</button>
                      <button type="button" disabled={busy} onClick={() => {
                        setEntries(entries.filter((item) => item.id !== entry.id));
                        if (editing === entry.id) setEditing(null);
                        setNotice(`Manche ${index + 1} retirée.`);
                      }} aria-label={`Retirer la manche ${index + 1}`}>Retirer</button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
        {entries.length === 12 && <p className="eq-muted text-sm">Les douze manches de la séance sont prêtes.</p>}
        <div className="live-teacher-prepare">
          <button type="button" className="eq-btn eq-btn-gold" disabled={!entries.length || busy || editing !== null} onClick={() => onPrepare(entries.map((entry) => entry.round))}>
            {busy ? "Ouverture…" : "Ouvrir la salle d’attente"}
          </button>
          <p>Vous donnerez le départ quand la classe sera prête.</p>
        </div>
      </section>
    </div>
  );
}
