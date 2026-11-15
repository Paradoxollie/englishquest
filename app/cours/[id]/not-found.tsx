import Link from "next/link";
import { BookIcon } from "@/components/ui/icons";

export default function CourseNotFound() {
  return (
    <main className="eq-container eq-section flex min-h-[60vh] items-center justify-center">
      <div className="eq-card w-full max-w-2xl p-6 md:p-10 text-center">
        <div className="mb-6 flex justify-center">
          <div className="eq-inset flex h-20 w-20 items-center justify-center rounded-xl">
            <BookIcon className="w-10 h-10 text-[var(--gold)]" />
          </div>
        </div>
        <p className="eq-kicker">Cours</p>
        <h1 className="eq-h1 mt-2 mb-4">
          Cours introuvable
        </h1>
        <p className="eq-lead mx-auto mb-8">
          Ce cours n&apos;existe pas encore ou n&apos;est pas disponible.
        </p>
        <Link
          href="/tous-les-cours"
          className="eq-btn eq-btn-primary"
        >
          <BookIcon className="w-5 h-5" />
          Retour aux cours
        </Link>
      </div>
    </main>
  );
}

