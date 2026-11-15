"use client";

import { useState } from "react";
import { CLASS_NAME_MAX } from "@/lib/classes/classes";
import { createClass } from "@/lib/classes/classes-server";
import { ActionFeedback, useClassAction } from "./use-class-action";

export function CreateClassForm() {
  const [name, setName] = useState("");
  const { pending, result, run } = useClassAction();

  return (
    <form
      className="eq-class-form"
      onSubmit={(event) => {
        event.preventDefault();
        run(() => createClass(name), () => setName(""));
      }}
    >
      <label className="eq-class-field">
        <span>Nom de la classe</span>
        <input
          type="text"
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={CLASS_NAME_MAX}
          required
          autoComplete="off"
          placeholder="4e B, Terminale AMC, Club anglais…"
          className="eq-class-input"
        />
      </label>
      <button type="submit" className="eq-btn eq-btn-gold" disabled={pending || name.trim().length === 0}>
        {pending ? "Création…" : "Créer la classe"}
      </button>
      <ActionFeedback result={result} />
    </form>
  );
}
