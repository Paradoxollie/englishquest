import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHead } from "@/components/comic/page-head";
import { JoinClassForm } from "@/components/classes/join-class-form";
import { CLASS_CODE_LENGTH, normalizeClassCode } from "@/lib/classes/classes";
import { getViewer } from "@/lib/classes/classes-data";
import { withNextParam } from "@/lib/navigation/safe-next";

export const metadata: Metadata = {
  title: "Rejoindre une classe",
  description: "Tape le code donné par ton professeur pour rejoindre ta classe sur English Quest.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

/**
 * Lien direct à partager : /rejoindre?code=KM47RT. Sans compte, l'élève passe
 * par l'inscription (ou la connexion) puis revient ici, code déjà rempli.
 */
export default async function JoinClassPage({ searchParams }: { searchParams: Promise<{ code?: string | string[] }> }) {
  const params = await searchParams;
  const raw = Array.isArray(params.code) ? params.code[0] : params.code;
  const prefill = normalizeClassCode(raw ?? "")
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, CLASS_CODE_LENGTH);

  const viewer = await getViewer();
  if (!viewer) {
    redirect(withNextParam("/auth/signup", prefill ? `/rejoindre?code=${prefill}` : "/rejoindre"));
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
          <JoinClassForm initialCode={prefill} showNextSteps />
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
