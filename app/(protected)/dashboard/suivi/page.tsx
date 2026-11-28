import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getViewer } from "@/lib/classes/classes-data";
import { getReportPage } from "@/lib/learning/report";
import { loginForCurrentPage } from "@/lib/navigation/login-return";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { DashboardNav } from "../dashboard-nav";

export const dynamic = "force-dynamic";
export const metadata = { title: "Suivi des joueurs", robots: { index: false } };
export default async function LearningDirectory({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const viewer = await getViewer();
  if (!viewer) redirect(await loginForCurrentPage("/dashboard/suivi"));
  if (viewer.role !== "admin") notFound();
  const params = await searchParams;
  const term = typeof params.q === "string" ? params.q.trim().slice(0, 64) : "";
  const page = getReportPage(params.page);
  const pageSize = 25;
  const directory = (p: number) =>
    `/dashboard/suivi?${new URLSearchParams({ ...(term ? { q: term } : {}), page: String(p) })}`;
  let query = createSupabaseAdminClient().from("profiles").select("id,username", { count: "exact" });
  if (term) query = query.ilike("username", "%" + term.replace(/[\\%_*]/g, (c) => "\\" + c) + "%");
  const { data, error, count } = await query
    .order("username")
    .order("id")
    .range((page - 1) * pageSize, page * pageSize - 1);
  if (error?.code === "PGRST103" && page > 1) redirect(directory(1));
  if (error) throw new Error("La liste des joueurs est momentanément indisponible.");
  const pages = Math.max(1, Math.ceil((count ?? 0) / pageSize));
  if (page > pages) redirect(directory(pages));
  return (
    <div className="eq-container eq-section">
      <h1 className="eq-h1 mb-4">Suivi des joueurs</h1>
      <DashboardNav />
      <form className="eq-class-field mb-4" action="/dashboard/suivi">
        <label htmlFor="player-search">Rechercher un pseudo</label>
        <div className="eq-home-actions">
          <input
            id="player-search"
            className="eq-class-input"
            name="q"
            maxLength={64}
            defaultValue={term}
            type="search"
          />
          <button className="eq-btn eq-btn-primary">Rechercher</button>
          {term && (
            <Link href="/dashboard/suivi" prefetch={false} className="eq-text-link">
              Tous les joueurs
            </Link>
          )}
        </div>
      </form>
      <p className="eq-muted mb-2">
        {count ?? 0} compte{count === 1 ? "" : "s"}{" "}
        {term ? "pour cette recherche" : "inscrit" + (count === 1 ? "" : "s")}
      </p>
      <ul className="eq-card divide-y divide-[var(--pro-border)] px-4">
        {data?.map((p) => (
          <li key={p.id}>
            <Link
              prefetch={false}
              className="flex items-center justify-between gap-2 py-3"
              href={`/dashboard/suivi/${p.id}`}
            >
              <b>{p.username || "Joueur"}</b>
              <span className="eq-text-link">Voir le parcours</span>
            </Link>
          </li>
        ))}
      </ul>
      {pages > 1 && (
        <nav aria-label="Pages de joueurs" className="eq-home-actions mt-4">
          {page > 1 && (
            <Link href={directory(page - 1)} prefetch={false} className="eq-btn eq-btn-ghost">
              Précédent
            </Link>
          )}
          <span>
            Page {page} sur {pages}
          </span>
          {page < pages && (
            <Link href={directory(page + 1)} prefetch={false} className="eq-btn eq-btn-ghost">
              Suivant
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
