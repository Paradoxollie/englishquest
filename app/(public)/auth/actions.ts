"use server";

import { applyPlacement } from "@/lib/placement/placement";
import { readPlacementToken } from "@/lib/placement/placement-token";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AuthFormState } from "@/types/auth";



function translateAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials")) return "Pseudo ou mot de passe incorrect.";
  if (lower.includes("already registered") || lower.includes("already been registered")) {
    return "Un compte existe déjà avec cette adresse e-mail.";
  }
  if (lower.includes("password") && lower.includes("at least")) {
    return "Le mot de passe doit faire au moins 8 caractères.";
  }
  if (lower.includes("rate limit") || lower.includes("too many")) {
    return "Trop de tentatives. Attends une minute et réessaie.";
  }
  if (lower.includes("email not confirmed")) {
    return "Confirme ton adresse e-mail depuis le message reçu, puis reconnecte-toi.";
  }
  return "Quelque chose n'a pas fonctionné. Réessaie dans un instant.";
}

function normalizeUsername(username: FormDataEntryValue | null): string {
  if (typeof username !== "string") return "";
  // Nettoie le username : lowercase, remplace les caractères invalides par _
  return username
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .substring(0, 50);
}

function normalizeEmail(email: FormDataEntryValue | null): string {
  if (typeof email !== "string") return "";
  return email.trim().toLowerCase();
}

/**
 * Génère un email "fantôme" pour les utilisateurs sans email.
 * Format: pseudo-{random}@noreply.englishquest.local
 * On utilise un identifiant aléatoire pour garantir l'unicité et éviter les collisions.
 * Si Supabase rejette ce format, on utilise l'API Admin pour créer l'utilisateur (bypass validation).
 */
function generateGhostEmail(username: string): string {
  // Génère un identifiant aléatoire court pour l'unicité
  const randomId = Math.random().toString(36).substring(2, 8);
  return `${username.toLowerCase()}-${randomId}@noreply.englishquest.local`;
}

async function getLoginEmailForUsername(username: string) {
  const adminClient = createSupabaseAdminClient();

  // Essayez d'abord via la table profiles (si elle contient l'email)
  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .select("email")
    .eq("username", username)
    .maybeSingle();

  if (profile?.email) {
    return profile.email.toLowerCase();
  }

  // PGRST116 = not found, 42703 = column missing
  if (profileError && !["PGRST116", "42703"].includes(profileError.code)) {
    throw new Error(
      `PROFILE_LOOKUP_FAILED:${profileError.code}:${profileError.message}`
    );
  }

  // Le répertoire Admin est paginé : les anciens profils sans email peuvent
  // correspondre à un compte situé bien après la première page.
  const perPage = 200;
  for (let page = 1; ; page += 1) {
    const { data: usersData, error: usersError } = await adminClient.auth.admin.listUsers({ page, perPage });
    if (usersError) {
      throw new Error(`AUTH_LOOKUP_FAILED:${usersError.message}`);
    }

    const matchedUser = usersData.users.find((user) =>
      typeof user.user_metadata?.username === "string" &&
      user.user_metadata.username.toLowerCase() === username.toLowerCase()
    );
    if (matchedUser) {
      return (
        matchedUser.user_metadata?.login_email?.toLowerCase() ??
        matchedUser.email?.toLowerCase() ??
        null
      );
    }
    if (usersData.users.length < perPage) return null;
  }
}

/**
 * Server action for sign up.
 * Expects form fields: username, email (optional), password.
 */
export async function signUpAction(
  prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const supabase = await createSupabaseServerClient();

  const username = normalizeUsername(formData.get("username"));
  const emailRaw = formData.get("email");
  const email = normalizeEmail(emailRaw);
  const passwordRaw = formData.get("password");

  if (!username || !passwordRaw || typeof passwordRaw !== "string") {
    return { error: "Il faut un pseudo et un mot de passe." };
  }

  // Si l'utilisateur fournit un email valide (contient @), on l'utilise.
  // Sinon, on génère un email "fantôme" avec UUID pour l'unicité
  const effectiveEmail = email && email.includes("@") ? email : generateGhostEmail(username);

  const { data, error } = await supabase.auth.signUp({
    email: effectiveEmail,
    password: passwordRaw,
    options: {
      // Désactive la vérification d'email pour les emails fantômes
      emailRedirectTo:
        email && email.includes("@")
          ? `${
              process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
            }/auth/login`
          : undefined,
      data: {
        username,
        login_email: effectiveEmail,
        contact_email: email && email.includes("@") ? email : null,
      },
    },
  });

  if (error) {
    // Si Supabase rejette l'email fantôme, on essaie avec l'API Admin
    if (error.message.includes("invalid") && !email) {
      try {
        const adminClient = createSupabaseAdminClient();

        // Crée l'utilisateur directement avec l'API Admin (bypass la validation)
        const { data: adminData, error: adminError } =
          await adminClient.auth.admin.createUser({
            email: effectiveEmail,
            password: passwordRaw,
            email_confirm: true, // Confirme l'email automatiquement
            user_metadata: {
              username,
              login_email: effectiveEmail,
              contact_email: null,
            },
          });

        if (adminError) {
          return { error: "Impossible de créer le compte. Essaie en ajoutant une adresse e-mail." };
        }

        // Crée le profil
        if (adminData.user?.id) {
          const normalizedUsername = normalizeUsername(username);
          
          // Vérifie si le username existe déjà
          const { data: existingProfile } = await adminClient
            .from("profiles")
            .select("id")
            .eq("username", normalizedUsername)
            .maybeSingle();

          if (existingProfile && existingProfile.id !== adminData.user.id) {
            // Supprime l'utilisateur créé car le username est déjà pris
            await adminClient.auth.admin.deleteUser(adminData.user.id);
            return { 
              error: `Le pseudo « ${normalizedUsername} » est déjà pris. Choisis-en un autre.` 
            };
          }

          const { error: profileError } = await adminClient
            .from("profiles")
            .upsert({
              id: adminData.user.id,
              username: normalizedUsername,
              email: effectiveEmail, // Utilise l'email effectif (réel ou fantôme)
              role: "student",
              xp: 0,
              gold: 0,
              level: 1,
            });

          if (profileError) {
            console.error("Failed to create profile with admin API:", profileError);
            // Supprime l'utilisateur créé car le profil n'a pas pu être créé
            await adminClient.auth.admin.deleteUser(adminData.user.id);
            
            if (profileError.code === "23505") {
              return { 
                error: `Le pseudo « ${normalizedUsername} » est déjà pris. Choisis-en un autre.` 
              };
            }
            
            return { 
              error: `Le compte n'a pas pu être enregistré (${profileError.message}). Réessaie dans un instant.` 
            };
          }
        }

        return { success: "Compte créé. Tu peux te connecter." };
      } catch {
        return { error: "Impossible de créer le compte. Essaie en ajoutant une adresse e-mail." };
      }
    }
    return { error: translateAuthError(error.message) };
  }

  const userId = data.user?.id;

  if (!userId) {
    return { error: "Le compte a été créé mais la session n'a pas pu s'ouvrir. Essaie de te connecter." };
  }

  // Crée/maJ le profil lié avec l'email utilisé pour l'authentification (peut être réel ou fantôme)
  try {
    const adminClient = createSupabaseAdminClient();

    // Normalise le username pour correspondre au trigger SQL
    const normalizedUsername = normalizeUsername(username);

    // Vérifie d'abord si le username existe déjà (pour un autre utilisateur)
    const { data: existingProfile } = await adminClient
      .from("profiles")
      .select("id, username")
      .eq("username", normalizedUsername)
      .maybeSingle();

    if (existingProfile && existingProfile.id !== userId) {
      // Le username est déjà pris par un autre utilisateur
      // Supprime l'utilisateur créé dans auth.users
      try {
        await adminClient.auth.admin.deleteUser(userId);
      } catch (deleteError) {
        console.error("Failed to delete user after username conflict:", deleteError);
      }
      return { 
        error: `Le pseudo « ${normalizedUsername} » est déjà pris. Choisis-en un autre.` 
      };
    }

    // Si le profil existe déjà (créé par le trigger), on le met à jour
    // Sinon, on le crée
    const { data: profileData, error: profileError } = await adminClient
      .from("profiles")
      .upsert(
        {
          id: userId,
          username: normalizedUsername,
          email: effectiveEmail, // Utilise l'email effectif (réel ou fantôme)
          role: "student",
          xp: 0,
          gold: 0,
          level: 1,
        },
        {
          onConflict: "id",
        }
      )
      .select()
      .single();

    if (profileError) {
      console.error("Failed to create/update profile:", {
        code: profileError.code,
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint,
      });

      // Gestion spécifique des erreurs
      if (profileError.code === "23505") {
        // Violation de contrainte unique (username déjà pris)
        return { 
          error: `Le pseudo « ${normalizedUsername} » est déjà pris. Choisis-en un autre.` 
        };
      }

      if (profileError.code === "23503") {
        // Violation de clé étrangère (user n'existe pas dans auth.users)
        return { 
          error: "Le compte n'a pas été trouvé. Réessaie, ou écris-nous depuis la page Contact." 
        };
      }

      // Autre erreur de base de données
      return { 
        error: `Le compte n'a pas pu être enregistré (${profileError.message}). Réessaie, ou écris-nous depuis la page Contact.` 
      };
    }

    console.log("Profile created successfully for user:", userId, profileData);
  } catch (error) {
    console.error("Unexpected error creating profile:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { 
      error: `Le compte n'a pas pu être enregistré (${errorMessage}). Réessaie, ou écris-nous depuis la page Contact.` 
    };
  }

  // Test de niveau passé avant l'inscription : résultat signé, appliqué maintenant.
  const placementChapter = readPlacementToken(formData.get("placement"));
  if (placementChapter && placementChapter > 1) {
    try {
      await applyPlacement(userId, placementChapter);
      return { success: `Compte créé. Ta carte commence au chapitre ${placementChapter}, comme l'a montré ton test.` };
    } catch (error) {
      console.error("Placement after signup failed:", error);
    }
  }

  return { success: "Compte créé. Tu peux te connecter." };
}

/**
 * Server action for login.
 * Expects form fields: login (username or email), password.
 * 
 * Si l'utilisateur tape un email → on l'utilise tel quel.
 * Si l'utilisateur tape juste son pseudo → on cherche l'email dans le profil
 * (car l'email peut être réel ou fantôme selon comment le compte a été créé).
 */
export async function loginAction(
  prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const supabase = await createSupabaseServerClient();
  const adminClient = createSupabaseAdminClient();

  const loginValue = (formData.get("login")?.toString() ?? "")
    .trim()
    .toLowerCase();
  const passwordRaw = formData.get("password");

  if (!loginValue || !passwordRaw || typeof passwordRaw !== "string") {
    return { error: "Il faut un pseudo (ou un e-mail) et un mot de passe." };
  }

  let emailToUse = loginValue;

  // Si l'input ne contient pas @, c'est un pseudo -> on cherche l'email réel
  if (!loginValue.includes("@")) {
    try {
      const foundEmail = await getLoginEmailForUsername(loginValue);
      if (!foundEmail) {
        return {
          error:
            "Aucun compte avec ce pseudo. Vérifie l'orthographe, ou connecte-toi avec ton e-mail.",
        };
      }
      emailToUse = foundEmail;
    } catch (lookupError) {
      const errorMessage =
        lookupError instanceof Error ? lookupError.message : "UNKNOWN";
      if (errorMessage.startsWith("PROFILE_LOOKUP_FAILED")) {
        return {
          error: "Impossible de vérifier le compte pour le moment. Essaie avec ton adresse e-mail.",
        };
      }
      return {
        error: "Impossible de vérifier le compte pour le moment. Essaie avec ton adresse e-mail.",
      };
    }
  }

  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: emailToUse,
    password: passwordRaw,
  });

  if (signInError) {
    // Si la connexion échoue et qu'on avait utilisé un email fantôme,
    // peut-être que le profil n'existe pas et il faut le créer
    if (signInError.message.includes("Invalid login credentials") && !loginValue.includes("@")) {
      return { 
        error: "Pseudo ou mot de passe incorrect." 
      };
    }
    return { error: translateAuthError(signInError.message) };
  }

  // Vérifier que la session est bien créée et synchroniser les cookies
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    console.error("Session error after login:", sessionError);
    return { 
      error: "La connexion a réussi mais la session n'a pas pu s'ouvrir. Réessaie." 
    };
  }

  console.log("Session created successfully after login:", session.user.id);

  // Si la connexion réussit mais qu'il n'y a pas de profil, on le crée maintenant
  if (signInData.user?.id && !loginValue.includes("@")) {
    try {
      const { data: existingProfile } = await adminClient
        .from("profiles")
        .select("id")
        .eq("id", signInData.user.id)
        .maybeSingle();

      if (!existingProfile) {
        // Crée le profil manquant avec l'email utilisé pour la connexion
        const normalizedUsername = normalizeUsername(loginValue);
        await adminClient.from("profiles").upsert({
          id: signInData.user.id,
          username: normalizedUsername,
          email: emailToUse,
          role: "student",
          xp: 0,
          gold: 0,
          level: 1,
        });
      }
    } catch (profileCreateError) {
      // On continue même si la création du profil échoue
      console.error("Failed to create profile after login:", profileCreateError);
    }
  }

  // Revalide les pages pour s'assurer que les cookies sont synchronisés
  revalidatePath("/", "layout");
  revalidatePath("/profile", "layout");
  
  // Redirige vers la home protégée
  redirect("/");
}

/**
 * Server action for logout.
 */
export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}

/* ---------- mot de passe oublié ---------- */

function isGhostEmail(email: string | null | undefined) {
  return !email || email.endsWith("@noreply.englishquest.local");
}

/**
 * Envoie le lien de réinitialisation à l'adresse du compte. La réponse est la
 * même que le compte existe ou non, pour ne pas révéler les pseudos inscrits.
 */
export async function requestPasswordResetAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const raw = formData.get("login");
  const login = typeof raw === "string" ? raw.trim() : "";
  if (!login) {
    return { error: "Indique ton pseudo ou ton adresse e-mail." };
  }

  const genericSuccess =
    "Si un compte avec une adresse e-mail correspond, un message vient de partir. Regarde aussi les indésirables.";

  try {
    const email = login.includes("@")
      ? normalizeEmail(login)
      : await getLoginEmailForUsername(normalizeUsername(login));

    if (isGhostEmail(email)) {
      return {
        error:
          "Ce compte n'a pas d'adresse e-mail (ou n'existe pas). Écris-nous depuis la page Contact avec ton pseudo, on réinitialise le mot de passe à la main.",
      };
    }

    const { SITE_URL } = await import("@/lib/site/config");
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email as string, {
      redirectTo: `${SITE_URL}/auth/callback?next=/auth/reset`,
    });
    if (error) {
      console.error("resetPasswordForEmail", error);
      if (error.message.toLowerCase().includes("rate limit")) {
        return { error: "Trop de demandes. Attends quelques minutes et réessaie." };
      }
    }
    return { success: genericSuccess };
  } catch (error) {
    console.error("requestPasswordResetAction", error);
    return { success: genericSuccess };
  }
}

/**
 * Nouveau mot de passe, une fois la session de récupération ouverte par /auth/callback.
 */
export async function updatePasswordAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const password = formData.get("password");
  const confirm = formData.get("confirm");
  if (typeof password !== "string" || password.length < 8) {
    return { error: "Le mot de passe doit faire au moins 8 caractères." };
  }
  if (password !== confirm) {
    return { error: "Les deux mots de passe ne sont pas identiques." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Le lien a expiré. Demande un nouveau lien de réinitialisation." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: translateAuthError(error.message) };
  }

  revalidatePath("/", "layout");
  redirect("/profile?motdepasse=ok");
}
