import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/types/profile";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

type ProtectedLayoutProps = {
  children: ReactNode;
};

async function ensureProfile(userId: string, email: string | null, usernameSeed: string | null) {
  const adminClient = createSupabaseAdminClient();
  const { data: profileData, error: profileError } = await adminClient
    .from("profiles")
    .select("id, username, role, xp, gold, level, avatar_id, created_at, updated_at, email")
    .eq("id", userId)
    .maybeSingle();

  if (profileError && profileError.code !== "PGRST116") {
    throw profileError;
  }

  if (profileData) {
    return profileData as Profile;
  }

  const baseUsername =
    usernameSeed || email?.split("@")[0] || `user_${userId.slice(0, 8)}`;
  const cleanUsername = baseUsername
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .substring(0, 50);

  const { data: createdProfile, error: createError } = await adminClient
    .from("profiles")
    .insert({
      id: userId,
      username: cleanUsername,
      email,
      role: "student",
      xp: 0,
      gold: 0,
      level: 1,
    })
    .select()
    .single();

  if (createError || !createdProfile) {
    throw createError ?? new Error("Unable to create profile");
  }

  return createdProfile as Profile;
}

export default async function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  try {
    await ensureProfile(
      user.id,
      user.email ?? null,
      (user.user_metadata?.username as string | undefined) ?? null
    );
  } catch {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 comic-dot-pattern">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-8 md:py-12">
        <main className="flex-1">
          <div className="comic-panel-dark w-full p-6 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
