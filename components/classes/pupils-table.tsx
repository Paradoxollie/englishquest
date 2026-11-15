"use client";

import { useMemo, useState } from "react";
import {
  defaultSortDirection,
  formatLastActivity,
  formatShortDate,
  sortPupilRows,
  type PupilRow,
  type PupilSortKey,
  type SortDirection,
} from "@/lib/classes/classes";
import { removePupil } from "@/lib/classes/classes-server";
import { ConfirmActionButton } from "./confirm-action-button";

type PupilsTableProps = {
  classId: string;
  pupils: PupilRow[];
  today: string;
};

const COLUMNS: Array<{ key: PupilSortKey; label: string; numeric?: boolean }> = [
  { key: "username", label: "Élève" },
  { key: "completedCount", label: "Missions validées", numeric: true },
  { key: "currentCourseId", label: "Mission en cours" },
  { key: "lastActivity", label: "Dernière activité" },
  { key: "xp", label: "XP", numeric: true },
  { key: "quizAverage", label: "Moyenne aux quiz", numeric: true },
];

function quizTone(average: number) {
  if (average < 50) return "is-low";
  if (average < 80) return "is-mid";
  return "is-high";
}

export function PupilsTable({ classId, pupils, today }: PupilsTableProps) {
  const [sortKey, setSortKey] = useState<PupilSortKey>("username");
  const [direction, setDirection] = useState<SortDirection>("asc");
  const rows = useMemo(() => sortPupilRows(pupils, sortKey, direction), [pupils, sortKey, direction]);

  function sortBy(key: PupilSortKey) {
    if (key === sortKey) {
      setDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setDirection(defaultSortDirection(key));
  }

  return (
    <div className="eq-class-table-wrap" role="region" aria-label="Tableau des élèves" tabIndex={0}>
      <table className="eq-class-table">
        <caption className="sr-only">
          Progression des élèves. Cliquez sur un titre de colonne pour trier.
        </caption>
        <thead>
          <tr>
            {COLUMNS.map((column) => {
              const active = column.key === sortKey;
              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={active ? (direction === "asc" ? "ascending" : "descending") : "none"}
                  className={column.numeric ? "is-num" : undefined}
                >
                  <button type="button" className={`eq-class-sort${active ? " is-active" : ""}`} onClick={() => sortBy(column.key)}>
                    {column.label}
                    <span aria-hidden="true" className="eq-class-sort-mark">
                      {active ? (direction === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </button>
                </th>
              );
            })}
            <th scope="col">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((pupil) => (
            <tr key={pupil.userId}>
              <th scope="row" className="eq-class-pupil">
                {pupil.username}
              </th>
              <td className="is-num">
                <b>{pupil.completedCount}</b>
                <span className="eq-muted"> / 50</span>
              </td>
              <td>
                <span className={pupil.currentCourseId ? undefined : "eq-muted"}>{pupil.currentCourseLabel ?? "Pas commencé"}</span>
              </td>
              <td title={pupil.lastActivity ? formatShortDate(pupil.lastActivity, true) : undefined}>
                <span className={pupil.lastActivity ? undefined : "eq-muted"}>{formatLastActivity(pupil.lastActivity, today)}</span>
              </td>
              <td className="is-num">{pupil.xp.toLocaleString("fr-FR")}</td>
              <td className="is-num">
                {pupil.quizAverage === null ? (
                  <span className="eq-muted">Aucun quiz</span>
                ) : (
                  <>
                    <b className={`eq-class-score ${quizTone(pupil.quizAverage)}`}>{pupil.quizAverage} %</b>
                    <small className="eq-muted">
                      {" "}
                      sur {pupil.quizCount} quiz
                    </small>
                  </>
                )}
              </td>
              <td className="eq-class-row-actions">
                <ConfirmActionButton
                  label="Retirer"
                  question={`Retirer ${pupil.username} de la classe ?`}
                  confirmLabel="Oui, retirer"
                  action={() => removePupil(classId, pupil.userId)}
                  showSuccess={false}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
