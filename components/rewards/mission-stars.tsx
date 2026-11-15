import { describeMissionStars, STARS_PER_MISSION, type MissionStars } from "@/lib/courses/stars";

/* Les trois étoiles d'une mission. Sans état : utilisable côté serveur et client. */

const STAR_PATH =
  "M12 2.8l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 16.8l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 2.8z";

function Star({ on }: { on: boolean }) {
  return (
    <svg className={`eq-star${on ? " is-on" : ""}`} viewBox="0 0 24 24" aria-hidden="true">
      <path d={STAR_PATH} />
    </svg>
  );
}

export function MissionStarsRow({
  stars,
  className = "",
  label,
}: {
  stars: MissionStars;
  className?: string;
  /** Texte lu par les lecteurs d'écran ; par défaut, la description des étoiles. */
  label?: string;
}) {
  const flags = [stars.validated, stars.perfectQuiz, stars.practice];
  return (
    <span className={`eq-stars ${className}`.trim()} role="img" aria-label={label ?? describeMissionStars(stars)}>
      {Array.from({ length: STARS_PER_MISSION }, (_, index) => (
        <Star key={index} on={flags[index]} />
      ))}
    </span>
  );
}

/** Étoiles avec ce qu'il faut faire pour chacune, pour une mission en cours. */
export function MissionStarsLegend({
  stars,
  practiceBest,
  practiceTarget,
}: {
  stars: MissionStars;
  practiceBest: number;
  practiceTarget: number;
}) {
  const items = [
    { on: stars.validated, text: "Mission validée" },
    { on: stars.perfectQuiz, text: "Quiz à 10 sur 10" },
    {
      on: stars.practice,
      text: stars.practice
        ? "Entraînement ciblé réussi"
        : `Entraînement ciblé : ${Math.min(practiceBest, practiceTarget)} / ${practiceTarget} bonnes réponses`,
    },
  ];
  return (
    <ul className="eq-stars-legend">
      {items.map((item) => (
        <li key={item.text} className={item.on ? "is-on" : ""}>
          <Star on={item.on} />
          <span>
            {item.text}
            <span className="sr-only">{item.on ? " : étoile obtenue" : " : étoile à gagner"}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
