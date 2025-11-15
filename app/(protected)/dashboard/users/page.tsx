import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/auth/roles";
import { UserRoleForm } from "./user-role-form";
import { UserStatsForm } from "./user-stats-form";
import { DeleteUserButton } from "./delete-user-button";
import type { Profile } from "@/types/profile";

// Force dynamic rendering - this page requires authentication and admin role
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function UsersManagementPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Vérifier que l'utilisateur est admin
  if (!(await isAdmin())) {
    redirect("/");
  }

  // Récupérer tous les utilisateurs avec le client admin
  const adminClient = createSupabaseAdminClient();
  const { data: profiles, error } = await adminClient
    .from("profiles")
    .select("id, username, email, role, xp, gold, level, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching users:", error);
  }

  // S'assurer que les valeurs XP, Gold et Level ne sont pas null/undefined
  const users = (profiles || []).map((profile: any) => ({
    ...profile,
    xp: profile.xp ?? 0,
    gold: profile.gold ?? 0,
    level: profile.level ?? 1,
  })) as Profile[];

  // Récupérer l'ID de l'utilisateur actuel pour éviter qu'il se modifie/supprime lui-même
  const currentUserId = user.id;

  return (
    <section className="space-y-6 text-slate-200">
      <div>
        <h2 className="text-2xl font-semibold text-white">Gestion des Utilisateurs</h2>
        <p className="text-sm text-slate-400">
          Gérez les rôles, statistiques (XP, Gold, Level) et supprimez des comptes utilisateurs
        </p>
      </div>

      <div className="comic-panel-dark p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-black text-left">
                <th className="pb-3 pr-4 font-bold text-white">Username</th>
                <th className="pb-3 pr-4 font-bold text-white">Email</th>
                <th className="pb-3 pr-4 font-bold text-white">Rôle</th>
                <th className="pb-3 pr-4 font-bold text-white">Stats (XP/Gold/Level)</th>
                <th className="pb-3 pr-4 font-bold text-white">Modifier Rôle</th>
                <th className="pb-3 pr-4 font-bold text-white">Supprimer</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : (
                users.map((userProfile) => {
                  const isCurrentUser = userProfile.id === currentUserId;
                  return (
                    <tr key={userProfile.id} className="border-b-2 border-black">
                      <td className="py-3 pr-4">
                        <span className="font-bold text-white">
                          {userProfile.username}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs text-amber-300 font-bold">(vous)</span>
                          )}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-slate-300 font-semibold">
                        {userProfile.email || "—"}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`comic-panel inline-block border-2 border-black px-3 py-1 text-xs font-bold ${
                            userProfile.role === "admin"
                              ? "bg-red-500 text-white"
                              : userProfile.role === "teacher"
                              ? "bg-blue-500 text-white"
                              : "bg-green-500 text-white"
                          }`}
                        >
                          {userProfile.role}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-col gap-1">
                          <div className="text-xs text-slate-400">
                            XP: {userProfile.xp} | Gold: {userProfile.gold} | Level: {userProfile.level}
                          </div>
                          {!isCurrentUser && (
                            <UserStatsForm
                              userId={userProfile.id}
                              currentXP={userProfile.xp}
                              currentGold={userProfile.gold}
                              currentLevel={userProfile.level}
                            />
                          )}
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <UserRoleForm userId={userProfile.id} currentRole={userProfile.role} />
                      </td>
                      <td className="py-3 pr-4">
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
    </section>
  );
}

