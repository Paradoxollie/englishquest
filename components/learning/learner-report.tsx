import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getViewer } from "@/lib/classes/classes-data";
import { isUuid } from "@/lib/classes/classes";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { loginForCurrentPage } from "@/lib/navigation/login-return";
import { passages } from "@/lib/adventure/catalog";
import { scenes } from "@/lib/adventure/scenes";
import { getGameLeaderboardMeta } from "@/lib/games/leaderboard-config";
import {
  courseFacts,
  courseName,
  gameMode,
  gameName,
  gameScore,
  getReportPage,
  getHistoryKind,
  historyKinds,
  recommendations,
  type LearningReport,
  type ReportQuery,
} from "@/lib/learning/report";
import { CopySummary } from "./copy-summary";
import styles from "./report.module.css";

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  timeZone: "Europe/Paris",
  day: "numeric",
  month: "short",
  year: "numeric",
});
const timeFormat = new Intl.DateTimeFormat("fr-FR", {
  timeZone: "Europe/Paris",
  hour: "2-digit",
  minute: "2-digit",
});
const date = (iso: string) => dateFormat.format(new Date(iso));
const grade = (score: number, total: number) => `${score}/${total}`;
type Scope =
  | { kind: "self" }
  | { kind: "admin"; id: string }
  | { kind: "class"; id: string; classId: string };

export async function LearnerReport({ scope, query }: { scope: Scope; query: ReportQuery }) {
  const base =
    scope.kind === "self"
      ? "/profile/suivi"
      : scope.kind === "admin"
        ? `/dashboard/suivi/${scope.id}`
        : `/teachers/classe/${scope.classId}/eleves/${scope.id}`;
  const viewer = await getViewer();
  if (!viewer) redirect(await loginForCurrentPage(base));
  if (scope.kind === "admin" && viewer.role !== "admin") notFound();
  if (scope.kind === "class" && (!isUuid(scope.classId) || !["teacher", "admin"].includes(viewer.role)))
    notFound();
  const learner = scope.kind === "self" ? viewer.id : scope.id;
  if (!isUuid(learner)) notFound();
  const page = getReportPage(query.page);
  const kind = getHistoryKind(query.type);
  const { data, error } = await createSupabaseAdminClient().rpc("learner_activity_report", {
    p_viewer: viewer.id,
    p_learner: learner,
    p_class: scope.kind === "class" ? scope.classId : null,
    p_page: page,
    p_kind: kind,
  });
  if (error) throw new Error("Le suivi est momentanément indisponible.");
  if (!data) notFound();
  const report = data as LearningReport;
  const pages = Math.max(1, Math.ceil(report.historyCount / 20));
  if (page > pages) redirect(`${base}?type=${kind}&page=${pages}#historique`);
  const advice = recommendations(report);
  const courses = report.courses.map((row) => ({ ...row, ...courseFacts(row) }));
  const played = report.games.reduce((sum, g) => sum + g.plays, 0);
  const quizzes = courses.reduce((sum, c) => sum + (c.tries ?? 0), 0);
  const completed = courses.filter((c) => c.passed).length;
  const placed = courses.filter((c) => c.placed).length;
  const atlas = report.atlas.map((a) => ({
    ...a,
    title: passages.find((p) => p.id === a.mission)?.title ?? `Escale ${a.mission}`,
    total: scenes[a.mission]?.length,
  }));
  const summary = [
    `${played} partie(s) enregistrée(s), ${completed} mission(s) validée(s) en jouant, ${quizzes} essai(s) de quiz daté(s).`,
    ...report.games.map(
      (g) =>
        `${gameName(g.slug)} ${gameMode(g.slug, g.difficulty)} · ${g.plays} partie(s), record ${gameScore(g.slug, getGameLeaderboardMeta(g.slug).scoreOrder === "asc" ? g.low : g.high)}`,
    ),
    ...courses.map(
      (c) =>
        `${courseName(c.course)} · ${c.passed ? "mission validée" : c.placed ? "acquis au positionnement" : c.read ? "repère de lecture atteint" : "commencé"}${c.best ? `, meilleur quiz ${grade(c.best.score, c.best.total)}` : ""}${c.total && c.score != null ? `, dernier ${grade(c.score, c.total)} sur ${c.tries} essai(s) daté(s)` : ""}`,
    ),
    ...atlas.map((a) => `Aventure · ${a.title} · ${a.stage}/${a.total ?? "?"} étapes`),
    ...advice.map((a) => `Conseil · ${a.label}. ${a.reason}`),
  ].join("\n");
  const back =
    scope.kind === "self"
      ? "/profile"
      : scope.kind === "admin"
        ? "/dashboard/suivi"
        : `/teachers/classe/${scope.classId}#class-pupils`;
  return (
    <div className={`eq-container eq-section ${styles.report}`}>
      <header>
        <Link href={back} prefetch={false} className="eq-teach-back">
          {scope.kind === "self"
            ? "Mon profil"
            : scope.kind === "admin"
              ? "Tous les joueurs"
              : report.className}
        </Link>
        <h1 className="eq-h1 mt-2">
          {scope.kind === "self" ? "Mon suivi" : `Parcours de ${report.username || "ce joueur"}`}
        </h1>
        <p className="eq-muted">
          {report.since
            ? `Activités enregistrées depuis l’entrée dans cette classe le ${date(report.since)}.`
            : "Résultats enregistrés sur le compte."}
        </p>
        <nav className="eq-home-actions mt-3" aria-label="Rubriques de la fiche">
          <a className="eq-text-link" href="#historique">
            Historique
          </a>
          <a className="eq-text-link" href="#cours">
            Cours et quiz
          </a>
          <a className="eq-text-link" href="#jeux">
            Jeux
          </a>
          <a className="eq-text-link" href="#aventure">
            Aventure BD
          </a>
        </nav>
      </header>
      <dl className={styles.numbers}>
        {[
          [played, "Parties enregistrées"],
          [completed, "Missions validées en jouant"],
          [quizzes, "Essais de quiz datés"],
        ].map(([n, label]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{n}</dd>
          </div>
        ))}
      </dl>
      <section className={styles.advice} aria-labelledby="advice">
        <h2 id="advice" className="eq-h2">
          À essayer ensuite
        </h2>
        {advice.map((a) => (
          <div key={a.href}>
            <h3 className="eq-h3">{a.title}</h3>
            <p>{a.reason}</p>
            <Link href={a.href} prefetch={false} className="eq-text-link">
              {a.label}
            </Link>
          </div>
        ))}
      </section>
      <section id="historique">
        <h2 className="eq-h2">Historique des résultats</h2>
        <nav aria-label="Filtrer les résultats" className="eq-home-actions my-3">
          {Object.entries(historyKinds).map(([k, label]) => (
            <Link
              prefetch={false}
              key={k}
              aria-current={kind === k ? "page" : undefined}
              className={`eq-btn eq-btn-sm ${kind === k ? "eq-btn-primary" : "eq-btn-ghost"}`}
              href={`${base}?type=${k}#historique`}
            >
              {label}
            </Link>
          ))}
        </nav>
        {report.history.length ? (
          <>
            <ul className={styles.list}>
              {report.history.map((h, i) => (
                <li key={i}>
                  <div>
                    <b>{h.kind === "jeu" ? gameName(h.slug!) : `Quiz · ${courseName(h.course!)}`}</b>
                    <small>
                      <time dateTime={h.happened}>
                        {date(h.happened)} à {timeFormat.format(new Date(h.happened))}
                      </time>
                      {h.slug && gameMode(h.slug, h.difficulty) && ` · ${gameMode(h.slug, h.difficulty)}`}
                    </small>
                  </div>
                  <strong>{h.kind === "jeu" ? gameScore(h.slug!, h.score) : grade(h.score, h.total!)}</strong>
                </li>
              ))}
            </ul>
            {pages > 1 && (
              <nav className="eq-home-actions mt-3" aria-label="Pages de l’historique">
                {page > 1 && (
                  <Link
                    prefetch={false}
                    className="eq-btn eq-btn-ghost eq-btn-sm"
                    href={`${base}?type=${kind}&page=${page - 1}#historique`}
                  >
                    Plus récents
                  </Link>
                )}
                <span>
                  Page {page} sur {pages}
                </span>
                {page < pages && (
                  <Link
                    prefetch={false}
                    className="eq-btn eq-btn-ghost eq-btn-sm"
                    href={`${base}?type=${kind}&page=${page + 1}#historique`}
                  >
                    Plus anciens
                  </Link>
                )}
              </nav>
            )}
          </>
        ) : (
          <p className="eq-muted">Aucun résultat daté pour cette sélection.</p>
        )}
      </section>
      <section id="cours">
        <h2 className="eq-h2">Cours et quiz</h2>
        <p className="eq-muted">
          Avant le suivi des essais, seule la meilleure note disponible était conservée.
          {placed > 0 && ` ${placed} cours acquis au test de niveau.`}
        </p>
        {courses.length ? (
          <ul className={styles.list}>
            {courses.map((c) => (
              <li key={c.course}>
                <div>
                  <Link href={`/cours/${c.course}`} prefetch={false}>{courseName(c.course)}</Link>
                  <small>
                    {c.passed
                      ? "Mission validée"
                      : c.placed
                        ? "Acquis au test de niveau"
                        : c.read
                          ? "Repère de lecture atteint"
                          : "Mission commencée"}
                    {c.passed && c.finished
                      ? ` · ${date(c.finished)}`
                      : c.reading
                        ? ` · ${date(c.reading)}`
                        : ""}
                  </small>
                </div>
                <div>
                  {c.best ? (
                    <b>Meilleur {grade(c.best.score, c.best.total)}</b>
                  ) : (
                    <small>Aucun quiz enregistré</small>
                  )}
                  {c.total && c.score != null && (
                    <small>
                      Dernier {grade(c.score, c.total)} · {c.tries} essai{c.tries === 1 ? "" : "s"} daté
                      {c.tries === 1 ? "" : "s"}
                    </small>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="eq-muted">Aucun cours enregistré.</p>
        )}
      </section>
      <section id="jeux">
        <h2 className="eq-h2">Jeux pratiqués</h2>
        {report.games.length ? (
          <ul className={styles.list}>
            {report.games.map((g) => (
              <li key={`${g.slug}-${g.difficulty}`}>
                <div>
                  <Link href={`/play/${g.slug}`} prefetch={false}>{gameName(g.slug)}</Link>
                  <small>
                    {[gameMode(g.slug, g.difficulty), `${g.plays} partie${g.plays === 1 ? "" : "s"}`]
                      .filter(Boolean)
                      .join(" · ")}
                  </small>
                </div>
                <div>
                  <b>
                    {getGameLeaderboardMeta(g.slug).scoreOrder === "asc" ? "Meilleur temps" : "Record"}{" "}
                    {gameScore(g.slug, getGameLeaderboardMeta(g.slug).scoreOrder === "asc" ? g.low : g.high)}
                  </b>
                  <small>Dernière partie le {date(g.latest)}</small>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="eq-muted">Aucune partie avec un score enregistré.</p>
        )}
      </section>
      <section id="aventure">
        <h2 className="eq-h2">Aventure BD</h2>
        {atlas.length ? (
          <ul className={styles.list}>
            {atlas.map((a) => (
              <li key={a.mission}>
                <div>
                  <b>{a.title}</b>
                  <small>Sauvegarde mise à jour le {date(a.updated)}</small>
                </div>
                <strong>
                  {a.stage}/{a.total} étapes
                </strong>
              </li>
            ))}
          </ul>
        ) : (
          <p className="eq-muted">Aucune étape validée dans cette vue.</p>
        )}
      </section>
      <CopySummary text={summary} />
    </div>
  );
}
