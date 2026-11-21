import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function PracticeWeek({ classId, viewerId }: { classId: string; viewerId: string }) {
  const { data, error } = await createSupabaseAdminClient().rpc("class_practice_week", { p_user: viewerId, p_class: classId });
  return (
    <details className="eq-card py-4 px-5">
      <summary className="cursor-pointer font-semibold">Entraînement individuel des sept derniers jours</summary>
      <p className="eq-muted my-3 text-sm">Parties libres terminées et missions validées depuis l’inscription dans la classe. Les séances en direct et les missions acquises au test de niveau sont exclues.</p>
      {error ? <p>Le bilan est momentanément indisponible.</p> : (
        <div className="eq-class-table-wrap">
          <table className="eq-class-table">
            <thead><tr><th scope="col">Élève</th><th scope="col">Parties libres</th><th scope="col">Missions validées</th></tr></thead>
            <tbody>{(data ?? []).map((row: { pupil: string; games: number; missions: number }) => (
              <tr key={row.pupil}><th scope="row">{row.pupil}</th><td>{row.games}</td><td>{row.missions}</td></tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </details>
  );
}
