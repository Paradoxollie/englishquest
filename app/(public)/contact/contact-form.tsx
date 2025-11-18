"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { User } from "@supabase/supabase-js";
import { submitContactMessageAction } from "./actions";

type Profile = {
  username: string;
  email: string | null;
} | null;

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
      className="comic-button w-full bg-cyan-500 text-white px-6 py-3 font-bold hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "Envoi en cours..." : "Envoyer le message"}
    </button>
  );
}

export function ContactForm({ user, profile }: ContactFormProps) {
  const [state, formAction] = useActionState(submitContactMessageAction, {});
  const isAuthenticated = !!user;

  return (
    <form action={formAction} className="space-y-4">
      {!isAuthenticated && (
        <>
          <div>
            <label htmlFor="name" className="block text-sm font-bold text-slate-200 mb-2">
              Nom
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="comic-panel w-full border-2 border-black bg-slate-800 px-4 py-3 font-semibold text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
              placeholder="Votre nom"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-bold text-slate-200 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="comic-panel w-full border-2 border-black bg-slate-800 px-4 py-3 font-semibold text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
              placeholder="votre@email.com"
            />
          </div>
        </>
      )}

      <div>
        <label htmlFor="subject" className="block text-sm font-bold text-slate-200 mb-2">
          Sujet
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          required
          className="comic-panel w-full border-2 border-black bg-slate-800 px-4 py-3 font-semibold text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
          placeholder="Sujet de votre message"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-bold text-slate-200 mb-2">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          className="comic-panel w-full border-2 border-black bg-slate-800 px-4 py-3 font-semibold text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none resize-none"
          placeholder="Votre message..."
        />
      </div>

      {state.error && (
        <div className="comic-panel border-2 border-black bg-red-500 text-white px-4 py-3 text-sm font-bold">
          {state.error}
        </div>
      )}

      {state.success && (
        <div className="comic-panel border-2 border-black bg-green-500 text-white px-4 py-3 text-sm font-bold">
          {state.success}
        </div>
      )}

      <SubmitButton />
    </form>
  );
}

