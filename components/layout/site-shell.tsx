import type { ReactNode } from "react";
import Link from "next/link";

export function SiteShell({
  header,
  children,
}: {
  header: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="eq-shell">
      {header}

      <main className="eq-main">{children}</main>

      <footer className="eq-footer">
        <div className="eq-container eq-footer-row">
          <div className="eq-footer-brand">
            <div>
              <p className="eq-footer-title">English Quest</p>
              <p className="eq-footer-sub">
                Un site de Pierre Marienne, professeur d&apos;anglais. Gratuit et sans publicité.
              </p>
            </div>
          </div>
          <nav className="eq-footer-links" aria-label="Pied de page">
            <Link href="/tous-les-cours">Cours</Link>
            <Link href="/play">Jeux</Link>
            <Link href="/collection">Collection</Link>
            <Link href="/leaderboard">Classements</Link>
            <Link href="/quest">Aventure</Link>
            <Link href="/about">À propos</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/mentions-legales">Mentions légales</Link>
            <Link href="/confidentialite">Confidentialité</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
