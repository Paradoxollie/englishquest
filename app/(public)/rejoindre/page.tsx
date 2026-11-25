import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHead } from "@/components/comic/page-head";
import { JoinClassForm } from "@/components/classes/join-class-form";
import { CLASS_CODE_LENGTH, normalizeClassCode } from "@/lib/classes/classes";
import { getViewer } from "@/lib/classes/classes-data";
import { withNextParam } from "@/lib/navigation/safe-next";
import { randomUUID } from "node:crypto";
import { GuestEntryForm } from "@/components/classes/guest-entry-form";
import { currentClassGuest, guestAssignments } from "@/lib/classes/guests";
import { leaveGuestClass } from "./actions";

export const metadata: Metadata = {
  title: "Rejoindre une classe",
  description: "Tape le code donné par ton professeur pour rejoindre ta classe sur English Quest.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function JoinClassPage({ searchParams }: { searchParams: Promise<{ code?: string | string[]; acces?: string; prenom?: string }> }) {
  const params = await searchParams;
  const raw = Array.isArray(params.code) ? params.code[0] : params.code;
  const prefill = normalizeClassCode(raw ?? "")
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, CLASS_CODE_LENGTH);

  const viewer = await getViewer();
  if (!viewer) {
    const guest = await currentClassGuest();
    const resume = guest && (!prefill || guest.code === prefill) ? guest : null;
    const nextCode = prefill || resume?.code;
    const next = nextCode ? `/rejoindre?code=${nextCode}` : "/rejoindre";
    const work = resume ? await guestAssignments(resume.classId) : [];
    return <div>
      <PageHead caption="En classe" title={resume ? resume.className : "Rejoindre ma classe"}>
        {resume ? `Tu participes sous le nom de ${resume.name}.` : "Entre le code de ton professeur et choisis comment apparaître pendant l’activité."}
      </PageHead>
      <div className="eq-container eq-section">
        <div className="eq-card eq-class-join-page mx-auto grid max-w-xl gap-4 p-6">
          {!resume && params.acces === "expire" && <p role="status">Entre ton code pour ouvrir ta participation sur cet appareil. Autorise les cookies du site pour pouvoir reprendre.</p>}
          {resume ? <>
            <Link href={`/direct/${resume.classId}`} className="eq-btn eq-btn-gold">Reprendre le direct</Link>
            <h2 className="eq-h3">Travail donné par le professeur</h2>
            {work.length ? <ul className="grid gap-3">{work.map(a => <li key={a.id}>
              <Link href={`/rejoindre/devoir/${a.id}`} className="eq-text-link">{a.title}</Link>
              {a.note && <p>{a.note}</p>}{a.due && <small>Pour le {new Date(a.due + "T12:00:00Z").toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" })}</small>}
            </li>)}</ul> : <p className="eq-muted">Aucun devoir pour le moment.</p>}
            <form action={leaveGuestClass}><button className="eq-btn eq-btn-ghost">Quitter cet appareil ou changer de joueur</button></form>
          </> : <GuestEntryForm code={prefill} attempt={randomUUID()} firstName={Boolean(prefill && params.prenom === "1")} />}
          <p className="eq-muted text-sm">Tu peux reprendre sur cet appareil pendant quatre heures. Ton prof peut revoir ta participation pendant dix jours.
            Ton pseudo peut apparaître sur le podium de la classe.
            {" "}<Link href="/confidentialite#classe-invite" className="eq-text-link">Tes données en classe</Link></p>
          <p className="text-sm"><Link className="eq-text-link" href={withNextParam("/auth/login",next)}>Utiliser mon compte</Link>
            {" · "}<Link className="eq-text-link" href={withNextParam("/auth/signup",next)}>Créer un compte</Link></p>
        </div>
      </div>
    </div>;
  }
  if (viewer.role === "teacher") redirect("/teachers");

  return (
    <div>
      <PageHead caption="Classe" title="Rejoindre une classe">
        Tape le code donné par ton professeur. Il verra ton pseudo et ta progression, jamais ton adresse e-mail.
      </PageHead>

      <div className="eq-container eq-section">
        <div className="eq-card eq-class-join-page mx-auto grid max-w-xl gap-4 p-6">
          <p className="eq-muted text-sm">Tu pourras quitter la classe à tout moment depuis ton profil.</p>
          <JoinClassForm initialCode={prefill} showNextSteps studentLive={viewer.role === "student"} />
          <p className="text-sm">
            <Link href="/profile#classe" className="eq-text-link">
              Voir mes classes
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
