"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type ContactFormState = {
  error?: string;
  success?: string;
};

export async function submitContactMessageAction(
  prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const subject = formData.get("subject")?.toString().trim();
  const message = formData.get("message")?.toString().trim();

  if (!subject || !message) {
    return { error: "Le sujet et le message sont requis." };
  }

  const adminClient = createSupabaseAdminClient();
  let name: string;
  let email: string | null;

  if (user) {
    // Utilisateur connecté : récupérer les données du profil
    const { data: profile } = await adminClient
      .from("profiles")
      .select("username, email")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) {
      return { error: "Profil utilisateur introuvable. Veuillez réessayer." };
    }

    name = profile.username;
    email = profile.email || null;
  } else {
    // Utilisateur non connecté : récupérer depuis le formulaire
    name = formData.get("name")?.toString().trim() || "";
    email = formData.get("email")?.toString().trim() || null;

    if (!name || !email) {
      return { error: "Le nom et l'email sont requis pour les utilisateurs non connectés." };
    }

    // Validation basique de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { error: "Veuillez fournir une adresse email valide." };
    }
  }

  // Insérer le message
  const { error } = await adminClient
    .from("contact_messages")
    .insert({
      user_id: user?.id || null,
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


