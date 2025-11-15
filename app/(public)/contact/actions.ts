"use server";

import { redirect } from "next/navigation";
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
  // Vérifier que l'utilisateur est authentifié
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/auth/login?redirect=/contact");
  }

  const subject = formData.get("subject")?.toString().trim();
  const message = formData.get("message")?.toString().trim();

  if (!subject || !message) {
    return { error: "Le sujet et le message sont requis." };
  }

  // Récupérer le profil de l'utilisateur pour obtenir le nom et l'email
  const adminClient = createSupabaseAdminClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("username, email")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return { error: "Profil utilisateur introuvable. Veuillez réessayer." };
  }

  // Insérer le message avec les données du profil
  const { error } = await adminClient
    .from("contact_messages")
    .insert({
      user_id: user.id,
      name: profile.username,
      email: profile.email || null,
      subject,
      message,
    });

  if (error) {
    console.error("Error submitting contact message:", error);
    return { error: "Erreur lors de l'envoi du message. Veuillez réessayer." };
  }

  return { success: "Votre message a été envoyé avec succès ! Vous recevrez une réponse ici même." };
}


