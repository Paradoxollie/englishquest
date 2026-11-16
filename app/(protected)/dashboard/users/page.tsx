import { redirect } from "next/navigation";
import { PageHead } from "@/components/comic/page-head";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/auth/roles";
import type { Profile } from "@/types/profile";
import { DashboardNav } from "../dashboard-nav";
import { UserRoleForm } from "./user-role-form";
import { UserStatsForm } from "./user-stats-form";
import { DeleteUserButton } from "./delete-user-button";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const ROLE_CHIP: Record<string, string> = {
  admin: "eq-chip-coral",
  teacher: "eq-chip-cyan",
  student: "eq-chip-mint",
};

export default async function UsersManagementPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (!(await isAdmin())) {
    redirect("/");
  }

  const adminClient = createSupabaseAdminClient();
  const { data: profiles, error } = await adminClient
    .from("profiles")
    .select("id, username, email, role, xp, gold, level, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching users:", error);
  }

  const users = (profiles || []).map((profile: Record<string, unknown>) => ({
    ...profile,
    xp: (profile.xp as number | null) ?? 0,
    gold: (profile.gold as number | null) ?? 0,
    level: (profile.level as number | null) ?? 1,
  })) as Profile[];

  const currentUserId = user.id;

  return (
    <div>
      <PageHead caption="Administration" title="Gestion des utilisateurs">
        Gérez les rôles, statistiques (XP, Gold, Level) et supprimez des comptes utilisateurs.
      </PageHead>

      <div className="eq-container eq-section">
        <DashboardNav />

        <div className="eq-card p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--pro-border)] text-left">
                  <th className="pb-3 pr-4 font-bold">Username</th>
                  <th className="pb-3 pr-4 font-bold">Email</th>
                  <th className="pb-3 pr-4 font-bold">Rôle</th>
                  <th className="pb-3 pr-4 font-bold">Stats (XP / Gold / Level)</th>
                  <th className="pb-3 pr-4 font-bold">Modifier rôle</th>
                  <th className="pb-3 pr-4 font-bold">Supprimer</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="eq-muted py-8 text-center">
                      Aucun utilisateur trouvé
                    </td>
                  </tr>
                ) : (
                  users.map((userProfile) => {
                    const isCurrentUser = userProfile.id === currentUserId;
                    return (
                      <tr key={userProfile.id} className="border-b border-[var(--pro-border)] last:border-b-0">
                        <td className="py-3.5 pr-4">
                          <span className="font-bold">
                            {userProfile.username}
                            {isCurrentUser && (
                              <span className="eq-chip eq-chip-gold-soft ml-2">vous</span>
                            )}
                          </span>
                        </td>
                        <td className="eq-muted py-3.5 pr-4 font-medium">
                          {userProfile.email || "—"}
                        </td>
                        <td className="py-3.5 pr-4">
                          <span className={`eq-chip ${ROLE_CHIP[userProfile.role] ?? "eq-chip-muted"}`}>
                            {userProfile.role}
                          </span>
                        </td>
                        <td className="py-3.5 pr-4">
                          <div className="flex flex-col gap-1.5">
                            <div className="eq-muted text-xs font-medium">
                              XP : {userProfile.xp} · Or : {userProfile.gold} · Niveau : {userProfile.level}
                            </div>
                            <UserStatsForm
                              userId={userProfile.id}
                              currentXP={userProfile.xp}
                              currentGold={userProfile.gold}
                              currentLevel={userProfile.level}
                            />
                          </div>
                        </td>
                        <td className="py-3.5 pr-4">
                          <UserRoleForm userId={userProfile.id} currentRole={userProfile.role} />
                        </td>
                        <td className="py-3.5 pr-4">
                          <DeleteUserButton
                            userId={userProfile.id}
                            username={userProfile.username}
                            isCurrentUser={isCurrentUser}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
