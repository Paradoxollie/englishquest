import Link from "next/link";
import { redirect } from "next/navigation";
import type { ComponentType } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isAdminOrTeacher } from "@/lib/auth/roles";
import {
  ArrowRightIcon,
  BookIcon,
  EnvelopeIcon,
  GameIcon,
  GiftIcon,
  GoldIcon,
  LevelIcon,
  TeacherIcon,
  TrophyIcon,
  UsersIcon,
  XPIcon,
} from "@/components/ui/icons";
import { getDashboardStats } from "./stats";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

type IconComponent = ComponentType<{ className?: string }>;
type StatTone = "cyan" | "emerald" | "amber" | "red" | "purple" | "slate";

const toneClasses: Record<StatTone, { panel: string; icon: string; text: string; rail: string }> = {
  cyan: {
    panel: "border-cyan-300/25 bg-cyan-950/28",
    icon: "bg-cyan-600 text-white",
    text: "text-cyan-200",
    rail: "bg-cyan-400",
  },
  emerald: {
    panel: "border-emerald-300/25 bg-emerald-950/28",
    icon: "bg-emerald-600 text-white",
    text: "text-emerald-200",
    rail: "bg-emerald-400",
  },
  amber: {
    panel: "border-amber-300/25 bg-amber-950/28",
    icon: "bg-amber-600 text-white",
    text: "text-amber-200",
    rail: "bg-amber-400",
  },
  red: {
    panel: "border-red-300/25 bg-red-950/28",
    icon: "bg-red-600 text-white",
    text: "text-red-200",
    rail: "bg-red-400",
  },
  purple: {
    panel: "border-purple-300/25 bg-purple-950/28",
    icon: "bg-purple-600 text-white",
    text: "text-purple-200",
    rail: "bg-purple-400",
  },
  slate: {
    panel: "border-white/10 bg-white/5",
    icon: "bg-slate-800 text-white",
    text: "text-slate-200",
    rail: "bg-slate-400",
  },
};

function formatNumber(value: number) {
  return value.toLocaleString("fr-FR");
}

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

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
  const maxDailyVisits = stats
    ? Math.max(...stats.visitors.dailyStats.map((day) => day.totalVisits), 1)
    : 1;

  return (
    <div className="-m-6 overflow-hidden bg-[#020617] text-white md:-m-8">
      <section className="relative overflow-hidden border-b-4 border-black bg-slate-950">
        <div className="absolute inset-0 comic-dot-pattern-light opacity-20" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(6,182,212,0.18),rgba(2,6,23,0.92)_42%,rgba(16,185,129,0.16))]" />

        <div className="relative mx-auto grid min-h-[360px] max-w-[1280px] gap-6 px-4 py-8 md:px-8 md:py-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div className="self-end">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200 text-outline">
              Pilotage English Quest
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-[1.02] text-white text-outline md:text-6xl">
              Dashboard clair, chiffres lisibles, actions rapides.
            </h1>
            <p className="mt-5 max-w-3xl text-base font-semibold leading-relaxed text-slate-200 md:text-lg">
              Vue operationnelle pour suivre les utilisateurs, les messages, les visites et les
              ressources de la plateforme sans perdre de temps.
            </p>
          </div>

          <aside className="self-end border-4 border-black bg-slate-950/90 p-5 shadow-[0_4px_0_#000] backdrop-blur-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
              Session
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white text-outline">
              {profile.username}
            </h2>
            <p className="mt-2 text-sm font-semibold text-slate-300">
              Role: <span className="text-amber-300">{profile.role}</span>
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <DashboardLink href="/teachers" label="Profs" Icon={TeacherIcon} />
              <DashboardLink href="/dashboard/messages" label="Messages" Icon={EnvelopeIcon} />
            </div>
          </aside>
        </div>
      </section>

      <main className="mx-auto max-w-[1280px] px-4 py-10 md:px-8 md:py-12">
        {isUserAdmin && stats ? (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Utilisateurs"
                value={formatNumber(stats.totalUsers)}
                detail="Comptes crees"
                tone="cyan"
                Icon={UsersIcon}
                href="/dashboard/users"
              />
              <StatCard
                title="Messages non lus"
                value={formatNumber(stats.unreadMessages)}
                detail={`${formatNumber(stats.totalMessages)} messages au total`}
                tone={stats.unreadMessages > 0 ? "red" : "emerald"}
                Icon={EnvelopeIcon}
                href="/dashboard/messages"
              />
              <StatCard
                title="XP distribuee"
                value={formatNumber(stats.totalXP)}
                detail={`Niveau moyen ${stats.averageLevel}`}
                tone="emerald"
                Icon={XPIcon}
              />
              <StatCard
                title="Or en circulation"
                value={formatNumber(stats.totalGold)}
                detail="Economie joueurs"
                tone="amber"
                Icon={GoldIcon}
                href="/dashboard/shop"
              />
            </section>

            <section className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
              <div className="border-4 border-black bg-slate-950 p-5 shadow-[0_4px_0_#000] md:p-6">
                <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300 text-outline">
                      Trafic
                    </p>
                    <h2 className="mt-2 text-3xl font-bold text-white text-outline">
                      Visiteurs et visites
                    </h2>
                  </div>
                  <p className="text-sm font-semibold text-slate-400">
                    30 derniers jours
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-4">
                  <MiniMetric label="Uniques total" value={stats.visitors.totalUniqueVisitors} tone="purple" />
                  <MiniMetric label="Visites total" value={stats.visitors.totalVisits} tone="cyan" />
                  <MiniMetric label="Uniques jour" value={stats.visitors.uniqueVisitorsToday} tone="emerald" />
                  <MiniMetric label="Visites jour" value={stats.visitors.visitsToday} tone="amber" />
                </div>

                <div className="mt-6 max-h-[420px] space-y-3 overflow-y-auto pr-1">
                  {stats.visitors.dailyStats.length > 0 ? (
                    stats.visitors.dailyStats.map((day) => {
                      const width = Math.max((day.totalVisits / maxDailyVisits) * 100, 4);

                      return (
                        <div key={day.date} className="border border-white/10 bg-white/5 p-3">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm font-bold text-white">
                              {new Date(day.date).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                            <p className="text-xs font-semibold text-slate-300">
                              {day.uniqueVisitors} uniques / {day.totalVisits} visites
                            </p>
                          </div>
                          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-900">
                            <div className="h-full rounded-full bg-cyan-400" style={{ width: `${width}%` }} />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="border border-white/10 bg-white/5 p-4 text-sm font-semibold text-slate-300">
                      Aucune statistique de visite disponible pour le moment.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-5">
                <div className="border-4 border-black bg-slate-950 p-5 shadow-[0_4px_0_#000] md:p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300 text-outline">
                    Roles
                  </p>
                  <h2 className="mt-2 text-3xl font-bold text-white text-outline">
                    Repartition
                  </h2>
                  <div className="mt-5 space-y-3">
                    <RoleStat label="Eleves" count={stats.usersByRole.students} tone="emerald" total={stats.totalUsers} />
                    <RoleStat label="Professeurs" count={stats.usersByRole.teachers} tone="cyan" total={stats.totalUsers} />
                    <RoleStat label="Admins" count={stats.usersByRole.admins} tone="red" total={stats.totalUsers} />
                  </div>
                </div>

                <div className="border-4 border-black bg-slate-950 p-5 shadow-[0_4px_0_#000] md:p-6">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-300 text-outline">
                        Recents
                      </p>
                      <h2 className="mt-2 text-3xl font-bold text-white text-outline">
                        Utilisateurs
                      </h2>
                    </div>
                    <Link
                      href="/dashboard/users"
                      className="inline-flex items-center gap-2 text-sm font-bold text-cyan-300 hover:underline"
                    >
                      Voir tout
                      <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="space-y-3">
                    {stats.recentUsers.length > 0 ? (
                      stats.recentUsers.map((recentUser) => (
                        <div
                          key={recentUser.id}
                          className="flex flex-wrap items-center justify-between gap-3 border border-white/10 bg-white/5 p-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-white">
                              {recentUser.username}
                            </p>
                            <p className="text-xs font-semibold text-slate-400">{recentUser.role}</p>
                          </div>
                          <p className="text-xs font-semibold text-slate-400">
                            {new Date(recentUser.created_at).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="border border-white/10 bg-white/5 p-4 text-sm font-semibold text-slate-300">
                        Aucun utilisateur recent.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="border-4 border-black bg-slate-950 p-6 shadow-[0_4px_0_#000]">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300 text-outline">
                Espace professeur
              </p>
              <h2 className="mt-2 text-3xl font-bold text-white text-outline">
                Acces limite aux outils pedagogiques.
              </h2>
              <p className="mt-4 max-w-2xl text-sm font-semibold leading-relaxed text-slate-300">
                Les statistiques globales sont reservees aux administrateurs. Tu peux
                continuer vers les ressources professeurs et les outils autorises.
              </p>
            </div>
            <div className="border-4 border-black bg-slate-950 p-6 shadow-[0_4px_0_#000]">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-300 text-outline">
                Acces
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <QuickAction href="/teachers" label="Espace professeurs" Icon={TeacherIcon} tone="cyan" />
                <QuickAction href="/dashboard/promote-admin" label="Promotion temporaire" Icon={TrophyIcon} tone="amber" />
              </div>
            </div>
          </section>
        )}

        <section className="mt-8 border-4 border-black bg-gradient-to-r from-slate-950 via-cyan-950/70 to-emerald-950/70 p-5 shadow-[0_4px_0_#000] md:p-6">
          <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300 text-outline">
                Actions rapides
              </p>
              <h2 className="mt-2 text-3xl font-bold text-white text-outline">
                Aller directement au bon outil.
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {isUserAdmin && (
                <>
                  <QuickAction href="/dashboard/users" label="Utilisateurs" Icon={UsersIcon} tone="cyan" />
                  <QuickAction href="/dashboard/messages" label="Messages" Icon={EnvelopeIcon} tone="purple" />
                  <QuickAction href="/dashboard/shop" label="Boutique" Icon={GiftIcon} tone="amber" />
                </>
              )}
              <QuickAction href="/tous-les-cours" label="Cours" Icon={BookIcon} tone="emerald" />
              <QuickAction href="/play" label="Jeux" Icon={GameIcon} tone="slate" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function DashboardLink({
  href,
  label,
  Icon,
}: {
  href: string;
  label: string;
  Icon: IconComponent;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-white hover:bg-white/10"
    >
      <Icon className="h-4 w-4 text-cyan-300" />
      {label}
    </Link>
  );
}

function StatCard({
  title,
  value,
  detail,
  tone,
  Icon,
  href,
}: {
  title: string;
  value: string | number;
  detail: string;
  tone: StatTone;
  Icon: IconComponent;
  href?: string;
}) {
  const classes = toneClasses[tone];
  const content = (
    <div className={`relative h-full overflow-hidden border-4 border-black bg-slate-950 p-5 shadow-[0_4px_0_#000] ${classes.panel}`}>
      <div className={`absolute inset-y-0 left-0 w-2 ${classes.rail}`} />
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            {title}
          </p>
          <p className={`mt-3 break-words text-3xl font-bold ${classes.text}`}>{value}</p>
          <p className="mt-2 text-sm font-semibold text-slate-300">{detail}</p>
        </div>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center border-4 border-black shadow-[0_3px_0_#000] ${classes.icon}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block transition-transform hover:-translate-y-0.5">
        {content}
      </Link>
    );
  }

  return content;
}

function MiniMetric({ label, value, tone }: { label: string; value: number; tone: StatTone }) {
  const classes = toneClasses[tone];

  return (
    <div className={`border border-white/10 p-4 ${classes.panel}`}>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-bold ${classes.text}`}>{formatNumber(value)}</p>
    </div>
  );
}

function RoleStat({
  label,
  count,
  tone,
  total,
}: {
  label: string;
  count: number;
  tone: StatTone;
  total: number;
}) {
  const classes = toneClasses[tone];
  const percent = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="border border-white/10 bg-white/5 p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-bold text-white">{label}</span>
        <span className={`text-sm font-black ${classes.text}`}>{formatNumber(count)}</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-900">
        <div className={`h-full rounded-full ${classes.rail}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function QuickAction({
  href,
  label,
  Icon,
  tone,
}: {
  href: string;
  label: string;
  Icon: IconComponent;
  tone: StatTone;
}) {
  const classes = toneClasses[tone];

  return (
    <Link
      href={href}
      className={`comic-button inline-flex items-center gap-2 px-4 py-3 text-sm font-bold text-white ${classes.icon}`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
