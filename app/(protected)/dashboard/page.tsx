import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isAdminOrTeacher } from "@/lib/auth/roles";
import { getDashboardStats } from "./stats";

// Force dynamic rendering - this page requires authentication and admin/teacher role
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Utiliser le client admin pour contourner RLS et s'assurer de récupérer le profil
  const adminClient = createSupabaseAdminClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("role, username")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !(await isAdminOrTeacher())) {
    redirect("/");
  }

  const isUserAdmin = profile.role === "admin";
  const stats = isUserAdmin ? await getDashboardStats() : null;

  return (
    <section className="space-y-6 text-slate-200">
      <div>
        <h2 className="text-2xl font-semibold text-white">Dashboard</h2>
        <p className="text-sm text-slate-400">
          Vue d'ensemble de votre plateforme EnglishQuest
        </p>
      </div>

      {isUserAdmin && stats && (
        <>
          {/* Cartes de statistiques */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Utilisateurs totaux"
              value={stats.totalUsers}
              icon="👥"
              color="cyan"
            />
            <StatCard
              title="Messages non lus"
              value={stats.unreadMessages}
              icon="✉️"
              color={stats.unreadMessages > 0 ? "red" : "green"}
              link="/dashboard/messages"
            />
            <StatCard
              title="XP total"
              value={stats.totalXP.toLocaleString()}
              icon="⭐"
              color="amber"
            />
            <StatCard
              title="Gold total"
              value={stats.totalGold.toLocaleString()}
              icon="🪙"
              color="yellow"
            />
          </div>

          {/* Statistiques détaillées */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Utilisateurs par rôle */}
            <div className="comic-panel-dark p-6">
              <h3 className="mb-4 text-lg font-bold text-white">Utilisateurs par rôle</h3>
              <div className="space-y-3">
                <RoleStat label="Étudiants" count={stats.usersByRole.students} color="green" />
                <RoleStat label="Professeurs" count={stats.usersByRole.teachers} color="blue" />
                <RoleStat label="Admins" count={stats.usersByRole.admins} color="red" />
              </div>
            </div>

            {/* Statistiques globales */}
            <div className="comic-panel-dark p-6">
              <h3 className="mb-4 text-lg font-bold text-white">Statistiques globales</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Niveau moyen</span>
                  <span className="font-bold text-white">{stats.averageLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Messages totaux</span>
                  <span className="font-bold text-white">{stats.totalMessages}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Messages non lus</span>
                  <span className={`font-bold ${stats.unreadMessages > 0 ? "text-red-300" : "text-green-300"}`}>
                    {stats.unreadMessages}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Utilisateurs récents */}
          <div className="comic-panel-dark p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Utilisateurs récents</h3>
              <Link
                href="/dashboard/users"
                className="comic-button bg-cyan-500 text-white px-3 py-1.5 text-sm hover:bg-cyan-600"
              >
                Voir tout →
              </Link>
            </div>
            <div className="space-y-2">
              {stats.recentUsers.length === 0 ? (
                <p className="text-sm text-slate-400 font-semibold">Aucun utilisateur récent</p>
              ) : (
                stats.recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="comic-panel bg-slate-800/50 flex items-center justify-between px-4 py-2"
                  >
                    <div>
                      <span className="font-bold text-white">{user.username}</span>
                      <span
                        className={`ml-2 rounded-full border-2 border-black px-2 py-0.5 text-xs font-bold ${
                          user.role === "admin"
                            ? "bg-red-500 text-white"
                            : user.role === "teacher"
                            ? "bg-blue-500 text-white"
                            : "bg-green-500 text-white"
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-semibold">
                      {new Date(user.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Actions rapides */}
      <div className="comic-panel-dark p-6">
        <h3 className="mb-4 text-lg font-bold text-white">Actions rapides</h3>
        <div className="flex flex-wrap gap-4">
          {isUserAdmin ? (
            <>
              <Link
                href="/dashboard/users"
                className="comic-button bg-cyan-500 text-white px-6 py-3 font-bold hover:bg-cyan-600"
              >
                Gérer les Utilisateurs
              </Link>
              <Link
                href="/dashboard/messages"
                className="comic-button bg-purple-500 text-white px-6 py-3 font-bold hover:bg-purple-600 relative"
              >
                Messages
                {stats && stats.unreadMessages > 0 && (
                  <span className="ml-2 rounded-full border-2 border-black bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                    {stats.unreadMessages}
                  </span>
                )}
              </Link>
            </>
          ) : (
            <Link
              href="/dashboard/promote-admin"
              className="comic-button bg-amber-500 text-white px-6 py-3 font-bold hover:bg-amber-600"
            >
              Promouvoir en Admin (Temporaire)
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
  link,
}: {
  title: string;
  value: string | number;
  icon: string;
  color: "cyan" | "red" | "green" | "amber" | "yellow" | "purple";
  link?: string;
}) {
  const colorClasses = {
    cyan: "bg-cyan-500/20 text-cyan-300",
    red: "bg-red-500/20 text-red-300",
    green: "bg-green-500/20 text-green-300",
    amber: "bg-amber-500/20 text-amber-300",
    yellow: "bg-yellow-500/20 text-yellow-300",
    purple: "bg-purple-500/20 text-purple-300",
  };

  const content = (
    <div className={`comic-card-dark ${colorClasses[color]} p-6`}>
      <div className="relative z-10">
        <div className="mb-2 text-2xl">{icon}</div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="mt-1 text-sm opacity-80 font-semibold">{title}</div>
      </div>
    </div>
  );

  if (link) {
    return <Link href={link}>{content}</Link>;
  }

  return content;
}

function RoleStat({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: "green" | "blue" | "red";
}) {
  const colorClasses = {
    green: "bg-green-500 text-white",
    blue: "bg-blue-500 text-white",
    red: "bg-red-500 text-white",
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-300 font-semibold">{label}</span>
      <span className={`comic-panel border-2 border-black px-3 py-1 text-sm font-bold ${colorClasses[color]}`}>
        {count}
      </span>
    </div>
  );
}


