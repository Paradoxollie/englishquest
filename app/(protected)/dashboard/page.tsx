import Link from "next/link";
import { redirect } from "next/navigation";
import { loginForCurrentPage } from "@/lib/navigation/login-return";
import type { ComponentType } from "react";
import { PageHead } from "@/components/comic/page-head";
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
  TeacherIcon,
  TrophyIcon,
  UsersIcon,
  XPIcon,
} from "@/components/ui/icons";
import { DashboardNav } from "./dashboard-nav";
import { getDashboardStats } from "./stats";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

type IconComponent = ComponentType<{ className?: string }>;
type StatTone = "primary" | "success" | "gold" | "error" | "neutral";

const toneStyles: Record<
  StatTone,
  { border: string; iconBg: string; valueColor: string; barColor: string }
> = {
  primary: {
    border: "border-l-4 border-l-[var(--pro-primary)]",
    iconBg: "bg-[var(--pro-primary-soft)] text-[var(--pro-primary)] border border-[var(--pro-border)]",
    valueColor: "text-[var(--pro-primary)]",
    barColor: "bg-[var(--pro-primary)]",
  },
  success: {
    border: "border-l-4 border-l-[var(--pro-success)]",
    iconBg: "bg-[var(--pro-success-soft)] text-[var(--pro-success)] border border-[var(--pro-border)]",
    valueColor: "text-[var(--pro-success)]",
    barColor: "bg-[var(--pro-success)]",
  },
  gold: {
    border: "border-l-4 border-l-[var(--pro-gold-edge)]",
    iconBg: "bg-[var(--pro-gold-soft)] text-[var(--pro-gold-text)] border border-[var(--pro-gold-edge)]",
    valueColor: "text-[var(--pro-gold-text)]",
    barColor: "bg-[var(--pro-gold-fill)]",
  },
  error: {
    border: "border-l-4 border-l-[var(--pro-error)]",
    iconBg: "bg-[var(--pro-error-soft)] text-[var(--pro-error)] border border-[var(--pro-border)]",
    valueColor: "text-[var(--pro-error)]",
    barColor: "bg-[var(--pro-error)]",
  },
  neutral: {
    border: "border-l-4 border-l-[var(--pro-border-strong)]",
    iconBg: "bg-[var(--pro-surface-2)] text-[var(--pro-text)] border border-[var(--pro-border)]",
    valueColor: "text-[var(--pro-text)]",
    barColor: "bg-[var(--pro-border-strong)]",
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
    redirect(await loginForCurrentPage("/dashboard"));
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
    <div>
      <PageHead caption="Pilotage" title="Administration">
        Vue opérationnelle pour suivre les utilisateurs, les messages, les visites et les ressources de la plateforme.
        Session connectée : <b>{profile.username}</b> ({profile.role}).
      </PageHead>

      <div className="eq-container eq-section">
        <DashboardNav isAdmin={isUserAdmin} />

        {isUserAdmin && stats ? (
          <div className="space-y-8">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Indicateurs clés">
              <StatCard
                title="Utilisateurs"
                value={formatNumber(stats.totalUsers)}
                detail="Comptes créés"
                tone="primary"
                Icon={UsersIcon}
                href="/dashboard/users"
              />
              <StatCard
                title="Messages non lus"
                value={formatNumber(stats.unreadMessages)}
                detail={`${formatNumber(stats.totalMessages)} messages au total`}
                tone={stats.unreadMessages > 0 ? "error" : "success"}
                Icon={EnvelopeIcon}
                href="/dashboard/messages"
              />
              <StatCard
                title="XP distribuée"
                value={formatNumber(stats.totalXP)}
                detail={`Niveau moyen ${stats.averageLevel}`}
                tone="success"
                Icon={XPIcon}
              />
              <StatCard
                title="Or en circulation"
                value={formatNumber(stats.totalGold)}
                detail="Économie joueurs"
                tone="gold"
                Icon={GoldIcon}
                href="/dashboard/shop"
              />
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
              <div className="eq-card p-6">
                <div className="mb-5 flex flex-col gap-2 border-b border-[var(--pro-border)] pb-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <span className="eq-caption">Trafic</span>
                    <h2 className="eq-h2 mt-1">Visiteurs et visites</h2>
                  </div>
                  <p className="eq-muted text-sm font-semibold">30 derniers jours</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                  <MiniMetric label="Uniques total" value={stats.visitors.totalUniqueVisitors} tone="primary" />
                  <MiniMetric label="Visites total" value={stats.visitors.totalVisits} tone="primary" />
                  <MiniMetric label="Uniques jour" value={stats.visitors.uniqueVisitorsToday} tone="success" />
                  <MiniMetric label="Visites jour" value={stats.visitors.visitsToday} tone="gold" />
                </div>

                <div className="mt-6 max-h-[420px] space-y-2.5 overflow-y-auto pr-1">
                  {stats.visitors.dailyStats.length > 0 ? (
                    stats.visitors.dailyStats.map((day) => {
                      const width = Math.max((day.totalVisits / maxDailyVisits) * 100, 4);

                      return (
                        <div key={day.date} className="eq-inset p-3.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-bold">
                              {new Date(day.date).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                            <p className="eq-muted text-xs font-semibold">
                              {day.uniqueVisitors} uniques / {day.totalVisits} visites
                            </p>
                          </div>
                          <div className="eq-bar mt-2.5">
                            <div
                              className="h-full rounded-full bg-[var(--pro-primary)]"
                              style={{ width: `${width}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="eq-inset eq-muted p-4 text-sm font-semibold">
                      Aucune statistique de visite disponible pour le moment.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="eq-card p-6">
                  <span className="eq-caption">Rôles</span>
                  <h2 className="eq-h2 mt-1">Répartition</h2>
                  <div className="mt-5 space-y-3">
                    <RoleStat label="Élèves" count={stats.usersByRole.students} tone="success" total={stats.totalUsers} />
                    <RoleStat label="Professeurs" count={stats.usersByRole.teachers} tone="primary" total={stats.totalUsers} />
                    <RoleStat label="Admins" count={stats.usersByRole.admins} tone="error" total={stats.totalUsers} />
                  </div>
                </div>

                <div className="eq-card p-6">
                  <div className="mb-4 flex items-center justify-between gap-4 border-b border-[var(--pro-border)] pb-3">
                    <div>
                      <span className="eq-caption">Récents</span>
                      <h2 className="eq-h2 mt-1">Utilisateurs</h2>
                    </div>
                    <Link href="/dashboard/users" className="eq-text-link inline-flex items-center gap-1.5 text-sm">
                      Voir tout
                      <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="space-y-2.5">
                    {stats.recentUsers.length > 0 ? (
                      stats.recentUsers.map((recentUser) => (
                        <div
                          key={recentUser.id}
                          className="eq-inset flex flex-wrap items-center justify-between gap-3 px-3.5 py-2.5"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold">{recentUser.username}</p>
                            <p className="eq-muted text-xs font-semibold">{recentUser.role}</p>
                          </div>
                          <p className="eq-muted text-xs font-semibold">
                            {new Date(recentUser.created_at).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="eq-inset eq-muted p-4 text-sm font-semibold">
                        Aucun utilisateur récent.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="eq-card p-6">
              <span className="eq-caption">Espace professeur</span>
              <h2 className="eq-h2 mt-2">Accès limité aux outils pédagogiques.</h2>
              <p className="eq-muted mt-3 max-w-2xl text-sm leading-relaxed">
                Les statistiques globales sont réservées aux administrateurs. Tu peux continuer vers les ressources
                professeurs et les outils autorisés.
              </p>
            </div>
            <div className="eq-card p-6">
              <span className="eq-caption">Accès</span>
              <div className="mt-4 flex flex-col gap-3">
                <Link href="/teachers" className="eq-btn eq-btn-primary">
                  <TeacherIcon className="h-4 w-4" />
                  Espace professeurs
                </Link>
                <Link href="/dashboard/promote-admin" className="eq-btn eq-btn-ghost">
                  <TrophyIcon className="h-4 w-4" />
                  Promotion admin
                </Link>
              </div>
            </div>
          </section>
        )}

        <section className="eq-card mt-8 p-6">
          <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <span className="eq-caption">Actions rapides</span>
              <h2 className="eq-h2 mt-1">Aller directement au bon outil.</h2>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {isUserAdmin && (
                <>
                  <QuickAction href="/dashboard/users" label="Utilisateurs" Icon={UsersIcon} variant="eq-btn-primary" />
                  <QuickAction href="/dashboard/messages" label="Messages" Icon={EnvelopeIcon} variant="eq-btn-ghost" />
                  <QuickAction href="/dashboard/shop" label="Boutique" Icon={GiftIcon} variant="eq-btn-gold" />
                </>
              )}
              <QuickAction href="/tous-les-cours" label="Cours" Icon={BookIcon} variant="eq-btn-ghost" />
              <QuickAction href="/play" label="Jeux" Icon={GameIcon} variant="eq-btn-ghost" />
            </div>
          </div>
        </section>
      </div>
    </div>
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
  const styles = toneStyles[tone];
  const content = (
    <div className={`eq-card ${href ? "eq-card-link" : ""} h-full p-5`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="eq-muted text-xs font-bold uppercase tracking-wider">{title}</p>
          <p className={`mt-2.5 break-words font-[var(--font-display)] text-3xl font-bold ${styles.valueColor}`}>
            {value}
          </p>
          <p className="eq-muted mt-1.5 text-sm font-medium">{detail}</p>
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--pro-radius)] ${styles.iconBg}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className="block h-full">
      {content}
    </Link>
  ) : (
    content
  );
}

function MiniMetric({ label, value, tone }: { label: string; value: number; tone: StatTone }) {
  const styles = toneStyles[tone];

  return (
    <div className="eq-inset p-3.5">
      <p className="eq-muted text-[11px] font-bold uppercase tracking-wider">{label}</p>
      <p className={`mt-1.5 font-[var(--font-display)] text-2xl font-bold ${styles.valueColor}`}>
        {formatNumber(value)}
      </p>
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
  const styles = toneStyles[tone];
  const percent = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="eq-inset p-3.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-bold">{label}</span>
        <span className={`text-sm font-bold ${styles.valueColor}`}>{formatNumber(count)}</span>
      </div>
      <div className="eq-bar mt-2.5">
        <div className={`h-full rounded-full ${styles.barColor}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function QuickAction({
  href,
  label,
  Icon,
  variant,
}: {
  href: string;
  label: string;
  Icon: IconComponent;
  variant: string;
}) {
  return (
    <Link href={href} className={`eq-btn eq-btn-sm ${variant}`}>
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
