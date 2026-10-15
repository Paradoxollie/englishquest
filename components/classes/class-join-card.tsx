import { MAX_CLASSES_PER_PUPIL } from "@/lib/classes/classes";
import { getPupilClassOverview, type PupilClassOverview } from "@/lib/classes/classes-data";
import { leaveClass } from "@/lib/classes/classes-server";
import { ConfirmActionButton } from "./confirm-action-button";
import { JoinClassForm } from "./join-class-form";

/**
 * Carte « Classe » du profil : rejoindre une classe avec le code du
 * professeur, voir ses classes, en quitter une. Ancre #classe.
 */
export async function ClassJoinCard({ userId }: { userId: string }) {
  let overview: PupilClassOverview | null = null;
  try {
    overview = await getPupilClassOverview(userId);
  } catch (error) {
    console.error("ClassJoinCard", error);
  }
  const classes = overview?.classes ?? [];
  const full = classes.length >= MAX_CLASSES_PER_PUPIL;

  return (
    <section id="classe" className="eq-card eq-class-join" aria-labelledby="profile-class">
      <div>
        <p className="eq-kicker">Classe</p>
        <h2 id="profile-class" className="eq-h3">
          {classes.length > 0 ? (classes.length > 1 ? "Tes classes" : "Ta classe") : "Rejoindre une classe"}
        </h2>
        <p className="eq-muted text-sm">
          Ton professeur te donne un code de six caractères. Il verra ton pseudo et ta progression, jamais ton adresse
          e-mail.
        </p>
      </div>

      {classes.length > 0 ? (
        <ul className="eq-class-mine">
          {classes.map((item) => (
            <li key={item.id}>
              <div>
                <b>{item.name}</b>
                <small className="eq-muted">avec {item.teacherName}</small>
              </div>
              <ConfirmActionButton
                label="Quitter"
                question={`Quitter « ${item.name} » ? Ton professeur ne verra plus ta progression.`}
                confirmLabel="Oui, quitter"
                action={leaveClass.bind(null, item.id)}
                networkError="La connexion a échoué. Réessaie."
                showSuccess={false}
              />
            </li>
          ))}
        </ul>
      ) : null}

      {full ? (
        <p className="eq-muted text-sm">
          Tu suis déjà {MAX_CLASSES_PER_PUPIL} classes, le maximum. Quitte-en une pour en rejoindre une autre.
        </p>
      ) : (
        <JoinClassForm />
      )}
    </section>
  );
}
