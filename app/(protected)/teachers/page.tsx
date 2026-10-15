import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CreateClassForm } from "@/components/classes/create-class-form";
import { TeacherOnlyNotice } from "@/components/classes/teacher-only-notice";
import { formatClassCode, isTeacherRole } from "@/lib/classes/classes";
import { getTeacherClasses, getViewer, type TeacherClassSummary } from "@/lib/classes/classes-data";

export const metadata: Metadata = { title: "Espace professeur" };

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

function pupilCountLabel(count: number) {
  if (count === 0) return "Aucun élève";
  return `${count} élève${count > 1 ? "s" : ""}`;
}

function ClassCard({ item, showOwner }: { item: TeacherClassSummary; showOwner: boolean }) {
  return (
    <article className="eq-card eq-teach-class">
      <div className="eq-teach-class-head">
        <h3 className="eq-h3">
          <Link href={`/teachers/classe/${item.id}`}>{item.name}</Link>
        </h3>
        <span className={`eq-chip ${item.pupilCount > 0 ? "eq-chip-cyan" : "eq-chip-muted"}`}>{pupilCountLabel(item.pupilCount)}</span>
      </div>
      {showOwner && !item.isOwn ? <p className="eq-muted text-sm">Classe de {item.teacherName ?? "un autre professeur"}</p> : null}
      <div>
        <p className="eq-teach-code-label">Code de la classe</p>
        <p className="eq-teach-code" aria-label={`Code : ${item.code.split("").join(" ")}`}>
          {formatClassCode(item.code)}
        </p>
      </div>
      <div className="eq-home-actions mt-auto">
        <Link href={`/teachers/classe/${item.id}`} className="eq-btn eq-btn-primary eq-btn-sm">
          Ouvrir la classe
        </Link>
        <Link href={`/teachers/classe/${item.id}/code`} className="eq-btn eq-btn-ghost eq-btn-sm">
          Afficher le code en grand
        </Link>
      </div>
    </article>
  );
}

export default async function TeachersPage() {
  const viewer = await getViewer();
  if (!viewer) {
    redirect("/auth/login");
  }
  if (!isTeacherRole(viewer.role)) {
    return <TeacherOnlyNotice />;
  }

  let classes: TeacherClassSummary[] = [];
  let loadError = false;
  try {
    classes = await getTeacherClasses(viewer);
  } catch (error) {
    console.error("TeachersPage", error);
    loadError = true;
  }

  const isAdmin = viewer.role === "admin";
  const active = classes.filter((item) => !item.archivedAt);
  const archived = classes.filter((item) => item.archivedAt);
  const totalPupils = active.reduce((sum, item) => sum + item.pupilCount, 0);

  return (
    <div className="eq-container eq-section eq-teach">
      <header className="eq-page-head">
        <p className="eq-kicker">Espace professeur</p>
        <h1 className="eq-h1">Vos classes</h1>
        <p className="eq-lead">
          Créez une classe, projetez son code : vos élèves la rejoignent en quelques secondes. Vous suivez ensuite leurs
          missions et vous leur donnez des devoirs.
        </p>
      </header>

      <div className="eq-teach-top">
        <section className="eq-card eq-teach-panel" aria-labelledby="teach-create">
          <h2 id="teach-create" className="eq-h3">
            Créer une classe
          </h2>
          <p className="eq-muted text-sm">Le code à six caractères est créé tout de suite. Vous pourrez le changer plus tard.</p>
          <CreateClassForm />
        </section>

        <section className="eq-card eq-teach-panel" aria-labelledby="teach-how">
          <h2 id="teach-how" className="eq-h3">
            En classe, en trois étapes
          </h2>
          <ol className="eq-teach-steps">
            <li>
              <span>
                <b>Projetez le code</b> avec « Afficher le code en grand ».
              </span>
            </li>
            <li>
              <span>
                <b>Les élèves vont sur /rejoindre</b> (ou dans leur profil) et tapent le code. Pas besoin d&apos;adresse
                e-mail.
              </span>
            </li>
            <li>
              <span>
                <b>Ouvrez la classe</b> pour suivre les missions et donner des devoirs.
              </span>
            </li>
          </ol>
        </section>
      </div>

      <section className="eq-teach-block" aria-labelledby="teach-classes">
        <div className="eq-home-section-head">
          <h2 id="teach-classes" className="eq-h2">
            {isAdmin ? "Toutes les classes" : "Classes actives"}
          </h2>
          {active.length > 0 ? (
            <span className="eq-muted text-sm">
              {active.length} classe{active.length > 1 ? "s" : ""} · {pupilCountLabel(totalPupils).toLowerCase()}
            </span>
          ) : null}
        </div>

        {loadError ? (
          <p role="alert" className="eq-class-feedback is-error">
            Impossible de charger vos classes pour le moment. Actualisez la page dans un instant.
          </p>
        ) : active.length === 0 ? (
          <div className="eq-card eq-teach-empty">
            <p className="eq-h3">Aucune classe pour l&apos;instant</p>
            <p className="eq-muted">
              Donnez-lui le nom que vous utilisez déjà (« 4e B », « 1re spé AMC »). Le code apparaît ici dès sa
              création.
            </p>
          </div>
        ) : (
          <div className="eq-teach-grid">
            {active.map((item) => (
              <ClassCard key={item.id} item={item} showOwner={isAdmin} />
            ))}
          </div>
        )}
      </section>

      {archived.length > 0 ? (
        <details className="eq-class-details eq-teach-archived">
          <summary>
            Classes archivées ({archived.length})
          </summary>
          <ul className="eq-class-status-list">
            {archived.map((item) => (
              <li key={item.id}>
                <Link href={`/teachers/classe/${item.id}`}>{item.name}</Link>
                <span className="eq-muted text-sm">
                  {pupilCountLabel(item.pupilCount)}
                  {isAdmin && !item.isOwn && item.teacherName ? ` · ${item.teacherName}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}
