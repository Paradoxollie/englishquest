import type { ReactNode } from "react";
import { Bubble } from "@/components/comic/bubble";
import { Mascot, type MascotPose } from "@/components/comic/mascot";

/**
 * En-tête de page commun : bandeau tramé, cartouche, titre de couverture,
 * texte d'introduction dans un encadré lisible, et éventuellement une
 * mascotte qui commente dans une bulle.
 */
export function PageHead({
  caption,
  title,
  children,
  tone = "yellow",
  mascot,
  bubble,
}: {
  caption: string;
  title: ReactNode;
  children?: ReactNode;
  tone?: "yellow" | "blue" | "red" | "sky";
  mascot?: MascotPose;
  bubble?: ReactNode;
}) {
  return (
    <section className={`eq-page-head eq-band eq-band-${tone}`}>
      <div className="eq-container eq-page-head-row">
        <div className="grid justify-items-start gap-4">
          <span className="eq-caption eq-caption-white eq-slam eq-slam-1">{caption}</span>
          <h1 className="eq-cover-title eq-page-title eq-slam eq-slam-2">{title}</h1>
          {children ? <div className="eq-readbox eq-slam eq-slam-3 max-w-2xl">{children}</div> : null}
        </div>
        {mascot ? (
          <div className="eq-mascot-row eq-slam eq-slam-4">
            <Mascot pose={mascot} size={140} priority />
            {bubble ? (
              <Bubble tail="left" className="max-w-xs">
                {bubble}
              </Bubble>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
