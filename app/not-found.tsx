import Link from "next/link";
import { BookIcon } from "@/components/ui/icons";

export default function GlobalNotFound() {
  return (
    <section className="eq-container eq-section flex min-h-[60vh] items-center justify-center">
      <div className="eq-card w-full max-w-2xl p-6 md:p-10 text-center">
        <div className="mb-6 flex justify-center">
          <div className="eq-inset flex h-20 w-20 items-center justify-center rounded-xl">
            <BookIcon className="w-10 h-10 text-[var(--gold)]" />
          </div>
        </div>
        <p className="eq-kicker">Erreur 404</p>
        <h1 className="eq-h1 mt-2 mb-4">Page introuvable</h1>
        <p className="eq-lead mx-auto mb-8">
          Cette page n&apos;existe pas ou a été déplacée. Retrouve l&apos;aventure, les cours ou les jeux ci-dessous.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/" className="eq-btn eq-btn-primary">
            Accueil
          </Link>
          <Link href="/play" className="eq-btn eq-btn-gold">
            Tous les jeux
          </Link>
          <Link href="/quest" className="eq-btn eq-btn-ghost">
            Carte d&apos;aventure
          </Link>
        </div>
      </div>
    </section>
  );
}
