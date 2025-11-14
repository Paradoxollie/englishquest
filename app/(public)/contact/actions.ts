"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ContactFormState = {
  error?: string;
  success?: string;
};

export async function submitContactMessageAction(
  prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const subject = formData.get("subject")?.toString().trim();
  const message = formData.get("message")?.toString().trim();

  if (!name || !email || !subject || !message) {
    return { error: "Tous les champs sont requis." };
  }

  // Validation basique de l'email
  if (!email.includes("@") || !email.includes(".")) {
    return { error: "Veuillez entrer une adresse email valide." };
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("contact_messages")
    .insert({
      name,
      email,
      subject,
      message,
    });

  if (error) {
    console.error("Error submitting contact message:", error);
    return { error: "Erreur lors de l'envoi du message. Veuillez réessayer." };
  }

  return { success: "Votre message a été envoyé avec succès ! Nous vous répondrons bientôt." };
}


