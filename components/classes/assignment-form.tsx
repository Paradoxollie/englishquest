"use client";

import { useState } from "react";
import { ASSIGNMENT_NOTE_MAX } from "@/lib/classes/classes";
import { assignMission } from "@/lib/classes/classes-server";
import { ActionFeedback, useClassAction } from "./use-class-action";

export type MissionOptionGroup = {
  label: string;
  options: Array<{ value: number; label: string; assigned: boolean }>;
};

type AssignmentFormProps = {
  classId: string;
  groups: MissionOptionGroup[];
  today: string;
  defaultDueDate: string;
  maxDueDate: string;
  initialCourseId?: number | null;
  disabled?: boolean;
};

export function AssignmentForm({
  classId,
  groups,
  today,
  defaultDueDate,
  maxDueDate,
  initialCourseId = null,
  disabled = false,
}: AssignmentFormProps) {
  const [courseId, setCourseId] = useState(initialCourseId ? String(initialCourseId) : "");
  const [dueDate, setDueDate] = useState(defaultDueDate);
  const [note, setNote] = useState("");
  const { pending, result, run } = useClassAction();

  return (
    <form
      className="eq-class-form eq-class-assign"
      onSubmit={(event) => {
        event.preventDefault();
        run(
          () => assignMission(classId, Number(courseId), dueDate, note),
          () => {
            setCourseId("");
            setNote("");
          }
        );
      }}
    >
      <label className="eq-class-field">
        <span>Mission</span>
        <select
          value={courseId}
          onChange={(event) => setCourseId(event.target.value)}
          required
          disabled={disabled}
          className="eq-class-input"
        >
          <option value="" disabled>
            Choisir une mission
          </option>
          {groups.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.options.map((option) => (
                <option key={option.value} value={option.value} disabled={option.assigned}>
                  {option.label}
                  {option.assigned ? " (déjà en devoir)" : ""}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>

      <div className="eq-class-form-pair">
        <label className="eq-class-field">
          <span>Pour le</span>
          <input
            type="date"
            value={dueDate}
            min={today}
            max={maxDueDate}
            onChange={(event) => setDueDate(event.target.value)}
            disabled={disabled}
            className="eq-class-input"
          />
          <small className="eq-muted">Laissez vide pour un devoir sans date limite.</small>
        </label>

        <label className="eq-class-field">
          <span>
            Consigne <span className="eq-muted">(facultative)</span>
          </span>
          <input
            type="text"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={ASSIGNMENT_NOTE_MAX}
            autoComplete="off"
            disabled={disabled}
            placeholder="Faites le quiz jusqu'à 80 %."
            className="eq-class-input"
          />
          <small className="eq-muted">
            {note.length} / {ASSIGNMENT_NOTE_MAX}
          </small>
        </label>
      </div>

      <button type="submit" className="eq-btn eq-btn-gold" disabled={disabled || pending || courseId === ""}>
        {pending ? "Envoi…" : "Donner en devoir"}
      </button>
      <ActionFeedback result={result} />
    </form>
  );
}
