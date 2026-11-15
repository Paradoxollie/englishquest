import type { ReactNode } from "react";

/** En-tête de page commun : étiquette, titre, introduction. Sobre et identique partout. */
export function PageHead({
  caption,
  title,
  children,
}: {
  caption: string;
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="eq-page-head">
      <div className="eq-container eq-page-head-row">
        <span className="eq-caption eq-slam">{caption}</span>
        <h1 className="eq-cover-title eq-page-title eq-slam eq-slam-2">{title}</h1>
        {children ? <div className="eq-lead eq-slam eq-slam-3">{children}</div> : null}
      </div>
    </section>
  );
}
