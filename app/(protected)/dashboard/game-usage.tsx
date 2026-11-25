import { games } from "@/lib/games/config";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type Activity = { play_date: string; game_slug: string; openings: number; started: number; finished: number };

export async function GameUsage() {
  const formatDay = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Paris" });
  const today = formatDay.format(new Date());
  const start = new Date(today + "T12:00:00Z");
  start.setUTCDate(start.getUTCDate() - 29);
  const { data, error } = await createSupabaseAdminClient().rpc("game_usage_between", { p_from: formatDay.format(start), p_until: today });
  const rows = (data ?? []) as Activity[];
  const days = [...new Set(rows.map(r => r.play_date))];
  const totals = (group: Activity[]) => group.reduce((sum, r) => ({
    pages: sum.pages + r.openings, starts: sum.starts + r.started, ends: sum.ends + r.finished,
  }), { pages: 0, starts: 0, ends: 0 });
  const labelDay = (day: string) => new Date(day + "T12:00:00Z").toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
  return <section className="eq-card p-5 sm:p-6" aria-labelledby="usage-jeux">
    <h2 id="usage-jeux" className="eq-h2">Les jeux sont-ils joués ?</h2>
    <p className="eq-muted mt-2 text-sm">30 derniers jours, heure de Paris. Les ouvertures incluent tous les visiteurs.
      Les débuts et fins comptent les parties libres sans compte depuis le 25 novembre 2026. Un joueur peut jouer plusieurs fois.</p>
    {error ? <p role="status">Les compteurs de jeu sont momentanément indisponibles.</p> : <>
      <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm">
        <thead><tr><th scope="col">Jeu</th><th scope="col">Pages ouvertes</th><th scope="col">Parties lancées</th><th scope="col">Terminées</th></tr></thead>
        <tbody>{games.map(game => {
          const counts = totals(rows.filter(r => r.game_slug === game.slug));
          return <tr key={game.slug} className="border-t"><th scope="row" className="py-2 pr-2">{game.name}</th>
            <td>{counts.pages}</td><td>{counts.starts}</td><td>{counts.ends}</td></tr>;
        })}</tbody>
      </table></div>
      {days.length > 0 && <details className="mt-4"><summary className="cursor-pointer font-semibold">Voir jour par jour</summary>
        <ul className="mt-3 grid gap-2 text-sm">{days.map(day => {
          const counts = totals(rows.filter(r => r.play_date === day));
          return <li key={day}><strong>{labelDay(day)}</strong> · {counts.pages} ouvertures
            {day >= "2026-11-25" ? ` · ${counts.starts} parties lancées · ${counts.ends} terminées` : " · ouvertures seules à cette date"}</li>;
        })}</ul></details>}
    </>}
  </section>;
}
