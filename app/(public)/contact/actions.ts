"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type ContactFormState = {
  error?: string;
  success?: string;
};

const LIMITS = { name: 80, email: 160, subject: 120, message: 3000 } as const;
const MAX_MESSAGES_PER_HOUR = 3;
const SUCCESS = "Ton message est bien parti. Je te réponds dès que possible.";

export async function submitContactMessageAction(
  prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const subject = formData.get("subject")?.toString().trim();
  const message = formData.get("message")?.toString().trim();

  // Champ piège invisible : un humain le laisse vide, un robot le remplit.
  if (formData.get("website")?.toString().trim()) {
    return { success: SUCCESS };
  }

  if (!subject || !message) {
    return { error: "Le sujet et le message sont requis." };
  }
  if (subject.length > LIMITS.subject || message.length > LIMITS.message) {
    return { error: `Sujet : ${LIMITS.subject} caractères au plus. Message : ${LIMITS.message} caractères au plus.` };
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
    if (name.length > LIMITS.name || email.length > LIMITS.email) {
      return { error: "Le nom ou l'adresse e-mail est trop long." };
    }

    // Validation basique de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { error: "Veuillez fournir une adresse email valide." };
    }
  }

  // Trois messages par heure au plus, par compte ou par adresse e-mail.
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const recentQuery = adminClient
    .from("contact_messages")
    .select("id", { count: "exact", head: true })
    .gte("created_at", since);
  const { count: recentCount } = user
    ? await recentQuery.eq("user_id", user.id)
    : await recentQuery.eq("email", email ?? "");
  if ((recentCount ?? 0) >= MAX_MESSAGES_PER_HOUR) {
    return { error: "Tu as déjà envoyé plusieurs messages cette heure-ci. Réessaie un peu plus tard." };
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
    return { error: "Le message n'a pas pu être envoyé. Réessaie dans un instant." };
  }

  return { success: SUCCESS };
}


