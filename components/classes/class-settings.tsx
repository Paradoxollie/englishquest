"use client";

import { useState } from "react";
import { CLASS_NAME_MAX } from "@/lib/classes/classes";
import { archiveClass, regenerateCode, renameClass, restoreClass } from "@/lib/classes/classes-server";
import { ConfirmActionButton } from "./confirm-action-button";
import { ActionFeedback, useClassAction } from "./use-class-action";

type ClassSettingsProps = {
  classId: string;
  name: string;
  archived: boolean;
};

export function ClassSettings({ classId, name, archived }: ClassSettingsProps) {
  const [draft, setDraft] = useState(name);
  const rename = useClassAction();
  const restore = useClassAction();
  const unchanged = draft.trim() === name;

  return (
    <div className="eq-class-settings">
      <form
        className="eq-class-form"
        onSubmit={(event) => {
          event.preventDefault();
          rename.run(() => renameClass(classId, draft));
        }}
      >
        <label className="eq-class-field">
          <span>Nom de la classe</span>
          <input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={CLASS_NAME_MAX}
            required
            autoComplete="off"
            className="eq-class-input"
          />
        </label>
        <button type="submit" className="eq-btn eq-btn-ghost" disabled={rename.pending || unchanged || draft.trim().length === 0}>
          {rename.pending ? "Enregistrement…" : "Renommer"}
        </button>
        <ActionFeedback result={rename.result} />
      </form>

      <div className="eq-class-settings-row">
        <div>
          <p className="eq-class-settings-title">Changer le code</p>
          <p className="eq-muted text-sm">
            Utile si le code a circulé hors de la classe. Les élèves déjà inscrits restent dans la classe.
          </p>
        </div>
        <ConfirmActionButton
          label="Nouveau code"
          question="L'ancien code ne fonctionnera plus. Continuer ?"
          confirmLabel="Oui, changer le code"
          action={() => regenerateCode(classId)}
        />
      </div>

      <div className="eq-class-settings-row">
        <div>
          <p className="eq-class-settings-title">{archived ? "Réactiver la classe" : "Archiver la classe"}</p>
          <p className="eq-muted text-sm">
            {archived
              ? "Le code fonctionnera de nouveau et vous pourrez donner des devoirs."
              : "En fin d'année : plus personne ne peut la rejoindre, le suivi reste consultable. Réversible."}
          </p>
        </div>
        {archived ? (
          <div className="eq-class-confirm">
            <button
              type="button"
              className="eq-btn eq-btn-ghost eq-btn-sm"
              disabled={restore.pending}
              onClick={() => restore.run(() => restoreClass(classId))}
            >
              {restore.pending ? "Un instant…" : "Réactiver"}
            </button>
            <ActionFeedback result={restore.result} />
          </div>
        ) : (
          <ConfirmActionButton
            label="Archiver"
            question="Archiver la classe ? Son code ne permettra plus de la rejoindre."
            confirmLabel="Oui, archiver"
            action={() => archiveClass(classId)}
          />
        )}
      </div>
    </div>
  );
}
