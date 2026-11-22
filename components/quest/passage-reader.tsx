"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { checkPassage } from "@/app/quest/atlas/actions";
import { culturalClues, passages, type Passage } from "@/lib/adventure/catalog";
import { recordingPath, type AccountDraft, type Activity, type GameAnswer, type QuizSubmission } from "@/lib/adventure/activities";
import { ActivitySheet, PassageStage } from "./passage-stage";
import { landscapeSizes, passageArt } from "./passage-art";
import { PassageQuiz, type QuizDraft } from "./passage-quiz";
import { useAdventureDraft } from "./use-adventure-draft";

const GrammarRush = dynamic(() => import("@/app/play/grammar-rush/grammar-rush-game").then(m => m.GrammarRushGame), { loading: () => <p role="status">La radio s’allume…</p> });
const EchoSignal = dynamic(() => import("@/app/play/echo-signal/echo-signal-game").then(m => m.EchoSignalGame), { loading: () => <p role="status">Connexion à la radio…</p> });
const confirmations: Record<Activity["mode"], string> = {
  choice: "Indice confirmé", order: "Phrase assemblée", write: "Message transmis", game: "Manche réussie", quiz: "Carnet validé",
};

function CulturalClue({ id }: { id: number }) {
  const clue = culturalClues[id];
  return <details className="atlas-clue"><summary><span aria-hidden="true">✧ </span>Dans le décor · {clue.object}</summary>
    <strong>{clue.source}</strong><p>{clue.note}</p></details>;
}

export function PassageReader({ episode, steps, saved, savedOnAccount, draftKey, cloudDraft }: {
  episode: Passage; steps: Activity[]; saved: number; savedOnAccount: boolean; draftKey: string; cloudDraft: AccountDraft;
}) {
  const router = useRouter();
  const [initialCloud] = useState(cloudDraft);
  const { track, flush } = useAdventureDraft(episode.id, draftKey, saved, initialCloud);
  const [index, setIndex] = useState(saved);
  const [opened, setOpened] = useState(saved > 0);
  const [choice, setChoice] = useState("");
  const [tiles, setTiles] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string; retryIds?: string[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const [savedStage, setSavedStage] = useState(saved);
  const [onAccount, setOnAccount] = useState(savedOnAccount);
  const [sheet, setSheet] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [replaying, setReplaying] = useState(false);
  const [gameAnswers, setGameAnswers] = useState<GameAnswer[]>([]);
  const [quiz, setQuiz] = useState<QuizDraft>({ answers: [] });
  const [shuffle, setShuffle] = useState(0);
  const initialStage = useRef(saved);
  const pending = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const shouldFocus = useRef(false);
  const done = index >= steps.length;
  const step = steps[index];
  const clue = culturalClues[episode.id];
  const next = passages.find(p => p.id === episode.id + 1);

  useEffect(() => {
    let seed = crypto.getRandomValues(new Uint32Array(1))[0];
    try {
      let local;
      try { local = JSON.parse(localStorage.getItem(draftKey) ?? "null"); } catch { /* Read the account copy. */ }
      const useLocal = local && (local.index === initialStage.current || (local.replaying && initialStage.current === steps.length)) &&
        (!initialCloud.data || (local.cloudVersion ?? 0) >= initialCloud.version);
      const d = useLocal ? local : initialCloud.data;
      if (d && Number.isInteger(d.index) && d.index >= 0 && d.index < steps.length &&
          (d.index === initialStage.current || (d.replaying && initialStage.current === steps.length))) {
        setIndex(d.index); setOpened(Boolean(d.opened)); setSheet(Boolean(d.sheet)); setReplaying(Boolean(d.replaying));
        setChoice(typeof d.choice === "string" ? d.choice : "");
        setTiles(Array.isArray(d.tiles) ? d.tiles.filter((n: number) => Number.isInteger(n) && n >= 0 && n < (steps[d.index].options?.length ?? 0)) : []);
        setGameAnswers(Array.isArray(d.gameAnswers) ? d.gameAnswers : []);
        if (d.quiz && Array.isArray(d.quiz.answers)) setQuiz(d.quiz);
        if (Number.isSafeInteger(d.shuffle)) seed = d.shuffle;
      }
    } catch { /* Browsers with restricted storage still use the verified checkpoint. */ }
    setShuffle(seed); setInitialized(true);
  }, [draftKey, initialCloud, steps.length]); // A grading refresh must not replace the open scene.
  useEffect(() => {
    if (!initialized) return;
    if (done) { try { localStorage.removeItem(draftKey); } catch { /* Optional local copy. */ } return; }
    track({ index, opened, sheet, choice, tiles, gameAnswers, quiz, shuffle, replaying }, onAccount && index === savedStage);
    const timer = window.setTimeout(() => { void flush(); }, 1300);
    return () => window.clearTimeout(timer);
  }, [initialized, done, draftKey, index, opened, sheet, choice, tiles, gameAnswers, quiz, shuffle, replaying, onAccount, savedStage, track, flush]);

  function leave(event: { preventDefault: () => void }) {
    if (!onAccount) return;
    event.preventDefault();
    void flush().finally(() => router.push("/quest#atlas"));
  }

  useEffect(() => {
    if (shouldFocus.current) {
      heading.current?.focus({ preventScroll: true });
      heading.current?.scrollIntoView({ block: "nearest", behavior: "instant" });
      shouldFocus.current = false;
    }
  }, [opened, index]);

  useEffect(() => {
    const host = window as Window & { render_game_to_text?: () => string };
    const previous = host.render_game_to_text;
    host.render_game_to_text = () => JSON.stringify({ episode: episode.id, stage: index, mode: !opened ? "opening" : done ? "ending" : sheet ? step.mode : "exploration", saved: savedStage, feedback: feedback?.ok ?? null });
    return () => { host.render_game_to_text = previous; };
  }, [episode.id, index, opened, done, step, savedStage, feedback, sheet]);

  function move(to: number) {
    shouldFocus.current = true;
    if (done && to === 0) { setReplaying(true); setShuffle(crypto.getRandomValues(new Uint32Array(1))[0]); }
    setChoice(""); setTiles([]); setGameAnswers([]); setQuiz({ answers: [] }); setSheet(false);
    setFeedback(null); setIndex(to); setOpened(true);
  }
  async function submit(answer: string | GameAnswer[] | QuizSubmission) {
    if (pending.current || feedback?.ok) return;
    pending.current = true; setBusy(true);
    try {
      const result = await checkPassage(episode.id, index, answer);
      setFeedback(result);
      if (result.ok) { setSavedStage(previous => Math.max(previous, index + 1)); setOnAccount(result.synced); }
    } catch { setFeedback({ ok: false, message: "La connexion a été interrompue. Ta réponse est encore là, tu peux la renvoyer." }); }
    finally { pending.current = false; setBusy(false); }
  }
  const currentAnswer = step?.mode === "order" ? tiles.map(i => step.options![i]).join(" ") : choice;
  const answerReady = step?.mode === "order" ? tiles.length === step.options!.length : choice.trim().length > 0;
  const round = { busy, initialAnswers: gameAnswers, progress: setGameAnswers, submit: (answers: GameAnswer[]) => { void submit(answers); } };
  const choices = [...(step?.options ?? [])];
  if (step?.mode === "choice" && choices.length > 1) {
    const rotation = (shuffle + index) % choices.length;
    choices.push(...choices.splice(0, rotation));
  }

  return <article className="atlas-reader" data-story={episode.id} data-stage={index}>
    <nav className="atlas-reader-nav" aria-label="Navigation dans l’aventure">
      <Link href="/quest#atlas" onNavigate={leave}>← Carte des mondes</Link><span>{savedStage} / {steps.length} épreuves validées · Escale {episode.id}</span>
    </nav>
    {!opened || done ? <section className={`atlas-splash ${done ? "atlas-finale" : ""}`}>
      <div className="atlas-splash-art"><Image src={passageArt[episode.art]} alt={episode.alt} placeholder="blur" fill priority sizes={landscapeSizes} /></div>
      <div className="atlas-splash-copy">
        <span className="atlas-label">{done ? "Escale validée" : episode.place}</span>
        <h1 tabIndex={-1} ref={heading}>{done ? episode.keepsake : episode.title}</h1>
        <p>{done ? episode.ending : episode.opening}</p>
        <p className="atlas-skill">{done ? "Tu as réussi à " + episode.skill.charAt(0).toLowerCase() + episode.skill.slice(1) : episode.skill}</p>
        {done ? <>
          <p className="atlas-save">{steps.length} épreuves validées · {onAccount ? "Sur ton compte" : "Sur cet appareil"}</p>
          <CulturalClue id={episode.id} />
          <Link className="atlas-cta" href={next ? `/quest/atlas/${next.id}` : "/quest#atlas"}>{next ? "Découvrir le monde suivant" : "Retrouver mon Atlas"} →</Link>
          <button className="atlas-replay" onClick={() => move(0)}>Rejouer cette escale</button>
        </> : <>
          <p className="atlas-save">{episode.minutes} environ · Reprise après chaque épreuve réussie</p>
          <button className="atlas-cta" onClick={() => move(0)}>Entrer dans l’histoire <span aria-hidden="true">→</span></button>
        </>}
      </div>
    </section> : <>
      <PassageStage key={index} episode={episode} index={index} total={steps.length} saved={savedStage} open={() => setSheet(true)} />
      {sheet && <ActivitySheet back={() => setSheet(false)} leave={leave}>
      <section className="atlas-work" key={index} aria-labelledby="atlas-stage-title" aria-busy={busy}>
        <span className="atlas-label">Épreuve {index + 1} / {steps.length}</span>
        <h2 id="atlas-stage-title" tabIndex={-1} ref={heading}>{step.title}</h2>
        <p className="atlas-instruction">{step.englishCue && <span className="atlas-english-cue" lang="en">{step.englishCue} </span>}{step.prompt}</p>
        {step.lesson && <aside className="atlas-lesson"><strong>Un coup de main</strong><p>{step.lesson.rule}</p><p>{step.lesson.example}</p></aside>}
        {step.document && <div className="atlas-document"><strong>{step.document.label}</strong><p lang="en">{step.document.text}</p></div>}
        {step.radio && <div className="atlas-radio"><strong>Radio de l’équipe</strong>
          <audio aria-label="Écouter le message en anglais" controls preload="none" src={recordingPath(step.radio)} />
          <details><summary>Lire la transcription</summary><p lang="en">{step.radio.line}</p></details>
        </div>}
        {step.game && !feedback?.ok && <div className="atlas-game eq-game-main">
          {step.game.type === "rush" ? <GrammarRush isLoggedIn={false} missionTarget={null} levelLabel="Premiers pas" queue={step.game.questions} adventure={round} />
            : <EchoSignal isLoggedIn={false} missionTarget={null} suggestedLevel={1} audioMap={{ [step.game.scenario.id]: recordingPath(step.game.radio) }}
              adventure={{ ...round, scenario: step.game.scenario }} />}
        </div>}
        {step.mode === "quiz" && !feedback?.ok && <PassageQuiz id={episode.id} draft={quiz} update={setQuiz} submit={submit} busy={busy} retryIds={feedback?.retryIds} />}
        {step.mode !== "game" && step.mode !== "quiz" && <form onSubmit={e => { e.preventDefault(); if (answerReady) void submit(currentAnswer); }}>
          <fieldset disabled={busy || feedback?.ok} className="atlas-answer-group"><legend className="sr-only">{step.prompt}</legend>
            {step.mode === "choice" && <div className="atlas-choices">{choices.map((value, i) => <label key={value} className="atlas-answer">
              <input type="radio" name="answer" value={value} checked={choice === value} onChange={() => { setChoice(value); setFeedback(null); }} />
              <span className="atlas-letter" aria-hidden="true">{String.fromCharCode(65 + i)}</span><span>{value}</span>
            </label>)}</div>}
            {step.mode === "write" && <label className="atlas-write">Ton message en anglais
              <textarea maxLength={250} rows={2} lang="en" spellCheck={false} autoCapitalize="sentences" value={choice} onChange={e => { setChoice(e.target.value); setFeedback(null); }} />
            </label>}
            {step.mode === "order" && <>
              <div className="atlas-built" aria-label="Ta phrase" aria-live="polite">{tiles.length ? tiles.map((id, pos) =>
                <button key={id} type="button" onClick={() => { setTiles(tiles.filter((_, i) => i !== pos)); setFeedback(null); }}
                  aria-label={`Retirer ${step.options![id]}`}>{step.options![id]} <span aria-hidden="true">×</span></button>) : <span>Touche les mots dans l’ordre.</span>}</div>
              <div className="atlas-tiles">{step.options!.map((value, i) => <button lang="en" type="button" key={i} disabled={tiles.includes(i)}
                onClick={() => { setTiles([...tiles, i]); setFeedback(null); }}>{value}</button>)}</div>
            </>}
          </fieldset>
          {!feedback?.ok && <button className="atlas-cta atlas-check" type="submit" disabled={!answerReady || busy}>{busy ? "Vérification…" : "Vérifier ma réponse"}</button>}
        </form>}
        {feedback && <div className="atlas-feedback" data-right={feedback.ok} role="status">
          <strong>{feedback.ok ? confirmations[step.mode] : "Un indice pour réessayer"}</strong><p>{feedback.message}</p>
          {feedback.ok && <small className="atlas-save">Étape enregistrée {onAccount ? "sur ton compte" : "sur cet appareil"}.</small>}
        </div>}
        {feedback?.ok && <>
          {index + 1 === clue.after && <CulturalClue id={episode.id} />}
          <button className="atlas-cta" onClick={() => move(index + 1)}>{index + 1 === steps.length ? "Découvrir mon souvenir" : "Continuer l’histoire"} →</button>
        </>}
      </section></ActivitySheet>}
    </>}
  </article>;
}
