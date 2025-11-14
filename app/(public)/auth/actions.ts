"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AuthFormState } from "@/types/auth";


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

  // Fallback : chercher dans auth.users via l'API Admin
  const { data: usersData, error: usersError } = await adminClient.auth.admin.listUsers();
  if (usersError) {
    throw new Error(`AUTH_LOOKUP_FAILED:${usersError.message}`);
  }

  const matchedUser = usersData.users.find(
    (user) =>
      user.user_metadata?.username?.toLowerCase() === username.toLowerCase()
  );

  if (matchedUser) {
    return (
      matchedUser.user_metadata?.login_email?.toLowerCase() ??
      matchedUser.email?.toLowerCase() ??
      null
    );
  }

  return null;
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
    return { error: "Username and password are required." };
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
          return { error: "Unable to create account. Please provide an email address." };
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
              error: `Username "${normalizedUsername}" is already taken. Please choose a different username.` 
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
                error: `Username "${normalizedUsername}" is already taken. Please choose a different username.` 
              };
            }
            
            return { 
              error: `Database error saving new user: ${profileError.message}. Please try again.` 
            };
          }
        }

        return { success: "Account created. You can now log in." };
      } catch {
        return { error: "Unable to create account. Please provide an email address." };
      }
    }
    return { error: error.message };
  }

  const userId = data.user?.id;

  if (!userId) {
    return { error: "Account created but user ID is missing. Please try logging in." };
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
        error: `Username "${normalizedUsername}" is already taken. Please choose a different username.` 
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
          error: `Username "${normalizedUsername}" is already taken. Please choose a different username.` 
        };
      }

      if (profileError.code === "23503") {
        // Violation de clé étrangère (user n'existe pas dans auth.users)
        return { 
          error: "Database error: User account not found. Please try again or contact support." 
        };
      }

      // Autre erreur de base de données
      return { 
        error: `Database error saving new user: ${profileError.message}. Please try again or contact support.` 
      };
    }

    console.log("Profile created successfully for user:", userId, profileData);
  } catch (error) {
    console.error("Unexpected error creating profile:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { 
      error: `Database error saving new user: ${errorMessage}. Please try again or contact support.` 
    };
  }

  return { success: "Account created. You can now log in." };
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
    return { error: "Login and password are required." };
  }

  let emailToUse = loginValue;

  // Si l'input ne contient pas @, c'est un pseudo -> on cherche l'email réel
  if (!loginValue.includes("@")) {
    try {
      const foundEmail = await getLoginEmailForUsername(loginValue);
      if (!foundEmail) {
        return {
          error:
            "No account found with that username. Please check your username or try logging in with your email.",
        };
      }
      emailToUse = foundEmail;
    } catch (lookupError) {
      const errorMessage =
        lookupError instanceof Error ? lookupError.message : "UNKNOWN";
      if (errorMessage.startsWith("PROFILE_LOOKUP_FAILED")) {
        return {
          error: `Unable to verify account. ${errorMessage.replace(
            "PROFILE_LOOKUP_FAILED:",
            ""
          )}. Please try logging in with your email address instead.`,
        };
      }
      return {
        error: `Unable to verify account. ${errorMessage}. Please try logging in with your email address instead.`,
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
        error: "Invalid credentials. Make sure you're using the correct username and password." 
      };
    }
    return { error: signInError.message };
  }

  // Vérifier que la session est bien créée et synchroniser les cookies
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    console.error("Session error after login:", sessionError);
    return { 
      error: "Login successful but session could not be established. Please try again." 
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
