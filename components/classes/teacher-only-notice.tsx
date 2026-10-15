import Link from "next/link";

/** Affiché à un compte élève qui ouvre une page de l'espace professeur. */
export function TeacherOnlyNotice() {
  return (
    <div className="eq-container eq-section">
      <div className="eq-card mx-auto grid max-w-2xl gap-3">
        <p className="eq-kicker">Espace professeur</p>
        <h1 className="eq-h2">Cet espace est réservé aux comptes professeur</h1>
        <p className="eq-muted">
          Vous enseignez l&apos;anglais ? La page Pour les profs explique ce que vous y trouverez et comment obtenir un
          compte professeur, gratuitement.
        </p>
        <p className="eq-muted">Élève : pour rejoindre ta classe, tape le code de ton professeur dans ton profil.</p>
        <div className="eq-home-actions">
          <Link href="/profs" className="eq-btn eq-btn-gold">
            Pour les profs
          </Link>
          <Link href="/profile#classe" className="eq-btn eq-btn-ghost">
            Rejoindre ma classe
          </Link>
        </div>
      </div>
    </div>
  );
}
