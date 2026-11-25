import Image from "next/image";
import { formatClassCode } from "@/lib/classes/classes";
import { liveClock, type LivePerson, type LiveSession, type TeacherLiveSnapshot } from "@/lib/classes/live-shared";
import { describeRound, durationLabel } from "./live-round-catalog";
import { LivePodium } from "./live-podium";

type Clock = ReturnType<typeof liveClock>;

function countdown(endsAt: number, now: number) {
  const seconds = Math.max(0, Math.ceil((endsAt - now) / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function Participants({ people }: { people: LivePerson[] }) {
  return (
    <div className="live-teacher-ready">
      <h3>{people.length} élève{people.length > 1 ? "s" : ""} en salle d’attente</h3>
      {people.length === 0 ? <p>Les pseudos apparaîtront au fur et à mesure.</p> : (
        <ul>{people.map((p) => <li key={p.name}>{p.name}</li>)}</ul>
      )}
    </div>
  );
}

type StageProps = {
  snapshot: TeacherLiveSnapshot; session: LiveSession; clock: Clock; now: number; joinAddress: string;
  firstName?: boolean; projectionTarget?: HTMLElement | null; onResultsVisibleChange?: (visible: boolean) => void;
};

export function LiveTeacherStage({ snapshot, session, clock, now, joinAddress, firstName, projectionTarget, onResultsVisibleChange }: StageProps) {
  if (clock.phase === "finished") {
    return <LivePodium session={session} people={snapshot.people} now={now} serverNow={snapshot.serverNow}
      projectionTarget={projectionTarget} onResultsVisibleChange={onResultsVisibleChange} />;
  }
  if (clock.phase === "lobby" || clock.phase === "countdown") {
    const slash = joinAddress.indexOf("/");
    return (
      <div className="live-teacher-lobby">
        <div>
          <h2>{clock.phase === "countdown" ? "Préparez-vous !" : "Rejoignez la séance"}</h2>
          <p className="live-teacher-address"><span>{joinAddress.slice(0, slash)}</span><wbr /><span>{joinAddress.slice(slash)}</span></p>
          {snapshot.code && <p className="live-teacher-code" aria-label={`Code de la classe ${snapshot.code.split("").join(" ")}`}>{formatClassCode(snapshot.code)}</p>}
          <p className="live-teacher-instruction">{firstName ? "Entrez le code, puis votre prénom." : "Entrez le code, puis choisissez un pseudo."}</p>
        </div>
        {clock.phase === "countdown" && clock.endsAt !== null ? (
          <div className="live-teacher-counter"><span>Départ dans</span><strong>{countdown(clock.endsAt, now)}</strong></div>
        ) : <Participants people={snapshot.people} />}
      </div>
    );
  }
  const round = session.rounds[clock.index];
  if (!round) return null;
  const activity = describeRound(round);
  return (
    <div className="live-teacher-round">
      <Image className="live-teacher-round-art" src={activity.image} alt="" width={460} height={300} sizes="(max-width: 600px) 110px, 200px" />
      <div className="live-teacher-round-name">
        <p>Manche {clock.index + 1} sur {session.rounds.length}</p>
        <h2>{activity.title}</h2>
      </div>
      {clock.endsAt !== null && <div className="live-teacher-counter"><span>Temps restant</span><strong>{countdown(clock.endsAt, now)}</strong></div>}
    </div>
  );
}

export function LiveProjectionStandings({ people }: { people: LivePerson[] }) {
  const leaders = people.filter((p) => p.rank !== null && p.points > 0).sort((a, b) => b.points - a.points).slice(0, 5);
  if (!leaders.length) return null;
  return (
    <section className="live-teacher-front-runners" aria-label="Classement provisoire">
      <h3>Classement provisoire</h3>
      <ol>{leaders.map((p) => (
        <li key={p.name}><span>{p.rank}.</span><b>{p.name}</b><small>{p.points} pts</small></li>
      ))}</ol>
    </section>
  );
}

export function LiveRoundProgram({ session, clock }: { session: LiveSession; clock: Clock }) {
  return (
    <details className="live-teacher-program-detail">
      <summary>Programme · {session.rounds.length} manche{session.rounds.length > 1 ? "s" : ""}</summary>
      <ol>
        {session.rounds.map((round, index) => (
          <li key={index} aria-current={clock.phase === "round" && index === clock.index ? "step" : undefined}>
            <span>{describeRound(round).title}</span><small>{durationLabel(round.durationSeconds)}</small>
          </li>
        ))}
      </ol>
    </details>
  );
}

function presenceLabel(p: LivePerson, now: number, index: number) {
  const age = Math.max(0, now - p.lastSeenAt);
  if (age > 60000) return `Vu il y a ${Math.floor(age / 60000)} min`;
  if (p.roundIndex === index && index >= 0) return "Dans la manche";
  return "Dans la séance";
}

export function LiveTeacherResults({ snapshot, session, clock, now }: Omit<StageProps, "joinAddress">) {
  const finished = clock.phase === "finished";
  const active = clock.phase === "round";
  const freshRound = active && liveClock(session, snapshot.serverNow).index === clock.index;
  return (
    <section className="live-teacher-panel live-teacher-results">
      <div className="live-teacher-sectionhead">
        <h2 className="eq-h3">{finished ? "Résultats des élèves" : "Suivi des élèves"}</h2>
        <span>{snapshot.people.length} participant{snapshot.people.length > 1 ? "s" : ""}</span>
      </div>
      {snapshot.people.length === 0 ? <p className="live-teacher-empty">{finished ? "Aucun élève n’a participé à cette séance." : "En attente du premier élève."}</p> : (
        <div className="live-teacher-table-scroll" role="region" aria-label="Tableau des participants" tabIndex={0}>
          <table className="live-teacher-table">
            <thead>
              <tr>
                <th scope="col">Élève</th>
                {active && <><th scope="col">Bonnes réponses / essais</th><th scope="col">Score de manche</th></>}
                {finished && <th scope="col">Manches jouées</th>}
                {(active || finished) && <th scope="col">Points de séance</th>}
              </tr>
            </thead>
            <tbody>
              {snapshot.people.map((p) => (
                <tr key={p.name}>
                  <th scope="row">{p.name}
                    {!finished && <small>{presenceLabel(p, now, clock.index)}</small>}
                    {finished && p.results && p.results.length > 0 && (
                      <details className="live-teacher-person-detail">
                        <summary>Détail par manche</summary>
                        <ul>{p.results.map((result) => {
                          const played = session.rounds[result.index];
                          return played && (
                            <li key={result.index}><b>{result.index + 1}. {describeRound(played).title}</b>
                              <span>{result.correct} / {result.answered} réponses justes · {result.points} pts</span>
                            </li>
                          );
                        })}</ul>
                      </details>
                    )}
                  </th>
                  {active && <><td>{freshRound ? `${p.correct} / ${p.answered}` : "…"}</td><td>{freshRound ? p.score : "…"}</td></>}
                  {finished && <td>{p.roundsPlayed} / {session.rounds.length}</td>}
                  {(active || finished) && <td><b>{p.points}</b></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {(active || finished) && snapshot.people.length > 0 && <p className="live-teacher-rule">Chaque manche rapporte jusqu’à 100 points, selon le nombre de bonnes réponses par rapport au meilleur résultat de la classe.</p>}
    </section>
  );
}
