"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { User } from "@supabase/supabase-js";
import { submitContactMessageAction } from "./actions";

type Profile = {
  username: string;
  email: string | null;
} | null;

const inputClass =
  "w-full rounded-[var(--radius)] border border-[var(--line-strong)] bg-[var(--ink)] px-4 py-3 text-[0.95rem] text-[var(--fg)] outline-none placeholder:text-[var(--muted-2)] focus:border-[var(--cyan)]";

type ContactFormProps = {
  user: User | null;
  profile: Profile;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="eq-btn eq-btn-primary eq-btn-lg w-full"
    >
      {pending ? "Envoi…" : "Envoyer le message"}
    </button>
  );
}

export function ContactForm({ user, profile }: ContactFormProps) {
  const [state, formAction] = useActionState(submitContactMessageAction, {});
  const isAuthenticated = !!user;

  return (
    <form action={formAction} className="grid gap-4">
      {!isAuthenticated && (
        <>
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-bold">
              Nom
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              maxLength={80}
              className={inputClass}
              placeholder="Ton nom ou ton pseudo"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-bold">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              maxLength={160}
              className={inputClass}
              placeholder="toi@exemple.fr"
            />
          </div>
        </>
      )}

      <div>
        <label htmlFor="subject" className="mb-1.5 block text-sm font-bold">
          Sujet
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          required
          maxLength={120}
          className={inputClass}
          placeholder="Par exemple : mot de passe oublié"
        />
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-bold">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          maxLength={3000}
          rows={6}
          className={`${inputClass} resize-y`}
          placeholder="Ton message"
        />
      </div>

      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="website">Ne pas remplir</label>
        <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {state.error && (
        <div role="alert" className="rounded-[var(--radius)] bg-[var(--coral-soft)] px-4 py-3 text-sm font-bold text-[var(--coral)]">
          {state.error}
        </div>
      )}

      {state.success && (
        <div role="status" className="rounded-[var(--radius)] bg-[var(--mint-soft)] px-4 py-3 text-sm font-bold text-[var(--mint)]">
          {state.success}
        </div>
      )}

      <SubmitButton />
    </form>
  );
}

