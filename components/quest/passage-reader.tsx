"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { checkPassage } from "@/app/quest/atlas/actions";
import { passages, type Passage } from "@/lib/adventure/catalog";
import { boardAnswer, recordingPath, type AccountDraft, type Activity, type ComicPhase, type GameAnswer, type QuizSubmission } from "@/lib/adventure/activities";
import { ComicLesson, PassageStage } from "./passage-stage";
import { storyPanel } from "@/lib/adventure/panels";
import { landscapeSizes, passagePicture } from "./passage-art";
import { PassageQuiz, type QuizDraft } from "./passage-quiz";
import { useAdventureDraft } from "./use-adventure-draft";
import { partForStage, partTitles } from "@/lib/adventure/parts";
import { RouteBoard } from "./route-board";
import { PassageBoard } from "./passage-boards";
import "./atlas-boards.css";

const GrammarRush = dynamic(() => import("@/app/play/grammar-rush/grammar-rush-game").then(m => m.GrammarRushGame), { loading: () => <p role="status">La radio s’allume…</p> });
const EchoSignal = dynamic(() => import("@/app/play/echo-signal/echo-signal-game").then(m => m.EchoSignalGame), { loading: () => <p role="status">Connexion à la radio…</p> });
const confirmations: Record<Activity["mode"], string> = {
  choice: "Indice confirmé", order: "Phrase assemblée", write: "Message transmis", route: "Itinéraire confirmé", game: "Manche réussie", quiz: "Carnet validé",
  spot: "Objet repéré", delivery: "Remise confirmée", evidence: "Enquête résolue",
};

function pauseWhenRemoved(player: HTMLAudioElement | null) {
  if (player) return () => player.pause();
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
  const [clue, setClue] = useState(0);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string; retryIds?: string[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const [savedStage, setSavedStage] = useState(saved);
  const [onAccount, setOnAccount] = useState(savedOnAccount);
  const [phase, setPhase] = useState<ComicPhase>("story");
  const [beat, setBeat] = useState(0);
  const [networkError, setNetworkError] = useState("");
  const [readRadio, setReadRadio] = useState(false);
  const [failedRadio, setFailedRadio] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [replaying, setReplaying] = useState(false);
  const [gameAnswers, setGameAnswers] = useState<GameAnswer[]>([]);
  const [quiz, setQuiz] = useState<QuizDraft>({ answers: [] });
  const [shuffle, setShuffle] = useState(0);
  const initialStage = useRef(saved);
  const initialSteps = useRef(steps);
  const pending = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const shouldFocus = useRef(false);
  const done = index >= steps.length;
  const currentPart = partForStage(index, steps.length);
  const step = steps[index];
  const picture = passagePicture(episode, done ? "ending" : opened ? index : -1);
  const next = passages.find(p => p.id === episode.id + 1);

  useEffect(() => {
    let seed = crypto.getRandomValues(new Uint32Array(1))[0];
    try { setReadRadio(sessionStorage.getItem("eq-atlas-radio-text") === "yes"); } catch { /* The switch also works without storage. */ }
    try {
      let local;
      try { local = JSON.parse(localStorage.getItem(draftKey) ?? "null"); } catch { /* Read the account copy. */ }
      const useLocal = local && (local.index === initialStage.current || (local.replaying && initialStage.current === steps.length)) &&
        (!initialCloud.data || (local.cloudVersion ?? 0) >= initialCloud.version);
      const d = useLocal ? local : initialCloud.data;
      if (d && Number.isInteger(d.index) && d.index >= 0 && d.index < steps.length &&
          (d.index === initialStage.current || (d.replaying && initialStage.current === steps.length))) {
        setIndex(d.index); setOpened(Boolean(d.opened)); setReplaying(Boolean(d.replaying));
        const restored: ComicPhase = d.phase ?? (d.sheet ? "question" : "story");
        setPhase(["story", "lesson", "question", "help"].includes(restored) ? restored : "story");
        if (restored === "help" && typeof d.retryHint === "string") setFeedback({ ok: false, message: d.retryHint });
        const lastBeat = storyPanel(episode.id, d.index).dialogue.length;
        setBeat(Number.isInteger(d.beat) ? Math.max(0, Math.min(lastBeat, d.beat)) : 0);
        const restoredStep = initialSteps.current[d.index];
        const previousRecipient = restoredStep.mode === "delivery" && restoredStep.delivery?.destinations.includes(d.choice);
        const validChoice = typeof d.choice === "string" && (restoredStep.mode !== "spot" || restoredStep.options?.includes(d.choice));
        setChoice(validChoice ? d.choice : "");
        const tileCount = restoredStep.clues?.length ?? restoredStep.options?.length ?? 0;
        const restoredTiles = Array.isArray(d.tiles) ? d.tiles.filter((n: number) => Number.isInteger(n) && n >= 0 && n < tileCount) : [];
        setTiles(previousRecipient && episode.id === 7 && d.index === 1 && !restoredTiles.length ? [0] : restoredTiles);
        setClue(Number.isInteger(d.clue) && restoredStep.clues?.[d.clue] ? d.clue : 0);
        setGameAnswers(Array.isArray(d.gameAnswers) ? d.gameAnswers : []);
        if (d.quiz && Array.isArray(d.quiz.answers)) setQuiz(d.quiz);
        if (Number.isSafeInteger(d.shuffle)) seed = d.shuffle;
      }
    } catch { /* Browsers with restricted storage still use the verified checkpoint. */ }
    setShuffle(seed); setInitialized(true);
  }, [draftKey, initialCloud, steps.length, episode.id]); // A grading refresh must not replace the open scene.
  const retryHint = phase === "help" && feedback && !feedback.ok ? feedback.message : undefined;
  useEffect(() => {
    if (!initialized) return;
    if (done) { try { localStorage.removeItem(draftKey); } catch { /* Optional local copy. */ } return; }
    track({ index, opened, sheet: phase === "question", phase, beat, retryHint, choice, tiles, clue, gameAnswers, quiz, shuffle, replaying }, onAccount && index === savedStage);
    const timer = window.setTimeout(() => { void flush(); }, 1300);
    return () => window.clearTimeout(timer);
  }, [initialized, done, draftKey, index, opened, phase, beat, retryHint, choice, tiles, clue, gameAnswers, quiz, shuffle, replaying, onAccount, savedStage, track, flush]);

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
  }, [opened, index, phase, feedback?.ok]);

  useEffect(() => {
    const host = window as Window & { render_game_to_text?: () => string };
    const previous = host.render_game_to_text;
    host.render_game_to_text = () => JSON.stringify({ episode: episode.id, stage: index, mode: !opened ? "opening" : done ? "ending" : feedback?.ok ? "success" : phase === "question" ? step.mode : phase, beat, saved: savedStage, choice, tiles, clue, feedback: feedback?.ok ?? null });
    return () => { host.render_game_to_text = previous; };
  }, [episode.id, index, opened, done, step, savedStage, feedback, phase, beat, choice, tiles, clue]);

  function move(to: number) {
    shouldFocus.current = true;
    if (done && to === 0) { setReplaying(true); setShuffle(crypto.getRandomValues(new Uint32Array(1))[0]); }
    setChoice(""); setTiles([]); setClue(0); setGameAnswers([]); setQuiz({ answers: [] }); setPhase("story"); setBeat(0); setNetworkError("");
    setFeedback(null); setFailedRadio(""); setIndex(to); setOpened(true);
  }
  function show(nextPhase: ComicPhase) {
    shouldFocus.current = true;
    setNetworkError("");
    setPhase(nextPhase);
  }
  async function submit(answer: string | GameAnswer[] | QuizSubmission) {
    if (pending.current || feedback?.ok) return;
    pending.current = true; setBusy(true); setNetworkError("");
    try {
      const result = await checkPassage(episode.id, index, answer);
      setFeedback(result);
      shouldFocus.current = true;
      if (result.ok) {
        setSavedStage(previous => Math.max(previous, index + 1)); setOnAccount(result.synced);
      } else {
        if (result.retryIds?.length) setQuiz(q => ({ ...q, page: 0, retryIds: result.retryIds }));
        if (step.game) setGameAnswers([]);
        setPhase("help");
      }
    } catch { setNetworkError("Connexion interrompue. Ta réponse est conservée. Tu peux la renvoyer."); }
    finally { pending.current = false; setBusy(false); }
  }
  const currentAnswer = step?.mode === "order" ? tiles.map(i => step.options![i]).join(" ") : step ? boardAnswer(step, choice, tiles) : "";
  const answerReady = step?.mode === "order" ? tiles.length === step.options!.length
    : step?.mode === "route" ? /^(left|right) (left|right)$/.test(choice) : currentAnswer.trim().length > 0;
  const isQuiz = step?.mode === "quiz" || (step?.legacyQuiz && Boolean(quiz.ticket));
  const illustratedQuestion = phase === "question" && !feedback?.ok && !isQuiz && (step?.spots || step?.delivery || step?.mode === "route");
  const round = { busy, initialAnswers: gameAnswers, progress: setGameAnswers, submit: (answers: GameAnswer[]) => { void submit(answers); } };
  const soundSwitch = <button type="button" className="comic-sound-mode" aria-pressed={readRadio} onClick={() => {
    setReadRadio(!readRadio);
    try { sessionStorage.setItem("eq-atlas-radio-text", readRadio ? "no" : "yes"); } catch { /* Keep this choice for the open episode. */ }
  }}>Sans son</button>;
  const choices = [...(step?.options ?? [])];
  if (step?.mode === "choice" && choices.length > 1) {
    const rotation = (shuffle + index) % choices.length;
    choices.push(...choices.splice(0, rotation));
  }

  return <article className="atlas-reader" data-story={episode.id} data-chapter={Math.ceil(episode.id / 5)} data-stage={index} data-phase={feedback?.ok ? "success" : phase} data-beat={beat}>
    <div className="atlas-reader-progress"><nav className="atlas-reader-nav" aria-label="Navigation dans l’aventure">
      <Link href="/quest#atlas" onNavigate={leave}>← Carte des mondes</Link><span>Escale {episode.id} · {savedStage}/{steps.length} validées</span>
    </nav>
    {opened && !done && <ol className="atlas-part-meter" aria-label="Les trois parties de l’escale">
      {partTitles.map((title, i) => {
        return <li key={title} aria-current={i === currentPart ? "step" : undefined} data-past={i < currentPart || undefined}>
          <span>Partie {i + 1}</span> <strong>{title}</strong>
        </li>;
      })}
    </ol>}</div>
    {!opened || done ? <section className={`atlas-splash ${done ? "atlas-finale" : ""}`}>
      <div className="atlas-splash-art"><Image src={picture.src} alt={picture.alt} placeholder="blur" fill priority sizes={landscapeSizes} /></div>
      <div className="atlas-splash-copy">
        <span className="atlas-label">{done ? "Escale validée" : episode.place}</span>
        <h1 tabIndex={-1} ref={heading}>{done ? episode.keepsake : episode.title}</h1>
        <p>{done ? episode.ending : episode.opening}</p>
        {done ? <>
          <p className="atlas-skill">Tu as réussi à {episode.skill.charAt(0).toLowerCase() + episode.skill.slice(1)}</p>
          <p className="atlas-save">{steps.length} épreuves validées · {onAccount ? "Sur ton compte" : "Sur cet appareil"}</p>
          <Link className="atlas-cta" href={next ? `/quest/atlas/${next.id}` : "/quest#atlas"}>{next ? "Découvrir le monde suivant" : "Retrouver mon Atlas"} →</Link>
          <button className="atlas-replay" onClick={() => move(0)}>Rejouer cette escale</button>
        </> : <>
          <p className="atlas-save">{episode.minutes} environ</p>
          <button className="atlas-cta" onClick={() => move(0)}>Ouvrir la BD <span aria-hidden="true">→</span></button>
        </>}
      </div>
    </section> : phase === "story" ? <PassageStage key={index} episode={episode} index={index} beat={beat} turn={setBeat}
      nextLabel={step.lesson ? "Ouvrir le carnet" : "À toi de jouer"} open={() => show(step.lesson ? "lesson" : "question")} />
      : <section className="comic-paper" aria-label={step.title} aria-busy={busy}>
        <div className="comic-banner" data-compact={illustratedQuestion ? true : undefined}>{!illustratedQuestion && <Image src={picture.src} alt="" fill sizes={landscapeSizes} placeholder="blur" />}
          <span>{episode.place} <i aria-hidden="true">/</i> {step.title}</span>
        </div>
        {phase === "lesson" || phase === "help" ? <div className="comic-page-content">
          {phase === "help" && <h2 className="comic-help-title" tabIndex={-1} ref={heading}>Reprenons ensemble.</h2>}
          <div>
            <ComicLesson focusRef={phase === "lesson" ? heading : undefined} episode={episode.id} index={index} step={step} hint={retryHint} />
          </div>
          <div className="comic-controls">
            <button type="button" className="comic-secondary" onClick={() => show("story")}>← Revoir la scène</button>
            <button type="button" className="atlas-cta comic-next" onClick={() => show("question")}>{phase === "help" ? "Réessayer" : "À moi de jouer"} <span aria-hidden="true">→</span></button>
          </div>
        </div> : feedback?.ok ? <div className="comic-page-content comic-result">
          <div className="atlas-feedback" data-right="true" role="status">
            <h2 ref={heading} tabIndex={-1}>{confirmations[isQuiz ? "quiz" : step.mode]}</h2>
            {step.reply && <div className="atlas-spoken-reply"><Image src={step.reply.speaker === "Sam" ? "/art/personnages/sam-visage.webp" : "/art/personnages/maya-visage.webp"} alt={step.reply.speaker} width={55} height={55} /><q lang="en">{step.reply.line}</q></div>}
            <p>{feedback.message}</p>
            <small className="atlas-save">Étape enregistrée {onAccount ? "sur ton compte" : "sur cet appareil"}.</small>
          </div>
          <button className="atlas-cta comic-next" onClick={() => move(index + 1)}>{index + 1 === steps.length ? "Découvrir mon souvenir" : "Continuer l’histoire"} →</button>
        </div> : <div className="atlas-work">
          {step.englishCue && <span className="atlas-english-cue" lang="en">{step.englishCue}</span>}
          <h2 className="comic-question" ref={heading} id="atlas-stage-title" tabIndex={-1}>{isQuiz && step.legacyQuiz ? "Reprends les trois questions de ton carnet." : step.prompt}</h2>
        {step.document && !isQuiz && <div className="atlas-document"><strong>{step.document.label}</strong><p lang="en">{step.document.text}</p></div>}
        {step.radio && <div className="atlas-radio"><div className="comic-radio-head"><strong>Radio de l’équipe</strong>{soundSwitch}</div>
          {readRadio ? <p lang="en" className="comic-radio-text">{step.radio.line}</p> : <>
            <audio ref={pauseWhenRemoved} aria-label="Écouter le message en anglais" controls preload="none" src={recordingPath(step.radio)}
              onError={() => setFailedRadio(step.radio!.file)} onPlaying={() => setFailedRadio("")} />
            {failedRadio === step.radio.file && <p className="atlas-audio-help" role="status">Tu peux lire le message avec « Sans son » ou <a href={recordingPath(step.radio)} download>télécharger le MP3</a>.</p>}
          </>}
        </div>}
        {step.game && <div className="atlas-game eq-game-main">
          {step.game.type === "rush" ? <GrammarRush isLoggedIn={false} missionTarget={null} levelLabel="Premiers pas" queue={step.game.questions} adventure={round} />
            : <>{soundSwitch}<EchoSignal isLoggedIn={false} missionTarget={null} suggestedLevel={1} audioMap={{ [step.game.scenario.id]: recordingPath(step.game.radio) }}
              adventure={{ ...round, scenario: step.game.scenario, readRadio }} /></>}
        </div>}
        {isQuiz && <PassageQuiz id={episode.id} draft={quiz} update={setQuiz} submit={submit} busy={busy} />}
        {step.mode !== "game" && !isQuiz && <form onSubmit={e => { e.preventDefault(); if (answerReady) void submit(currentAnswer); }}>
          <fieldset disabled={busy} className="atlas-answer-group"><legend className="sr-only">{step.prompt}</legend>
            {step.mode === "choice" && <div className={step.reply ? "atlas-choices atlas-utterances" : "atlas-choices"}>{choices.map((value, i) => <label key={value} className="atlas-answer">
              <input type="radio" name="answer" value={value} checked={choice === value} onChange={() => { setChoice(value); setFeedback(null); }} />
              <span className="atlas-letter" aria-hidden="true">{String.fromCharCode(65 + i)}</span><span>{value}</span>
            </label>)}</div>}
            {step.mode === "write" && <label className="atlas-write">Ton message en anglais
              <textarea maxLength={250} rows={2} lang="en" spellCheck={false} autoCapitalize="sentences" value={choice} onChange={e => { setChoice(e.target.value); setFeedback(null); }} />
            </label>}
            {step.mode === "route" && <RouteBoard vehicle={episode.id === 9 ? "rail" : "boat"} value={choice} change={setChoice} />}
            {(step.spots || step.delivery || step.clues) && <PassageBoard step={step} choice={choice} tiles={tiles} clue={clue} seed={shuffle + index} select={setChoice} pin={setTiles} examine={setClue} />}
            {step.mode === "order" && <>
              <div className="atlas-built" aria-label="Ta phrase" aria-live="polite">{tiles.length ? tiles.map((id, pos) =>
                <button key={id} type="button" onClick={() => { setTiles(tiles.filter((_, i) => i !== pos)); setFeedback(null); }}
                  aria-label={`Retirer ${step.options![id]}`}>{step.options![id]} <span aria-hidden="true">×</span></button>) : <span>Touche les mots dans l’ordre.</span>}</div>
              <div className="atlas-tiles">{step.options!.map((value, i) => <button lang="en" type="button" key={i} disabled={tiles.includes(i)}
                onClick={() => { setTiles([...tiles, i]); setFeedback(null); }}>{value}</button>)}</div>
            </>}
          </fieldset>
          <button className="atlas-cta atlas-check" type="submit" disabled={!answerReady || busy}>{busy ? "Vérification…" : "Vérifier ma réponse"}</button>
        </form>}
          {networkError && <p role="alert" className="comic-hint">{networkError}</p>}
          <button className="comic-secondary comic-recall" type="button" disabled={busy} onClick={() => show("lesson")}>Revoir le cours</button>
        </div>}
    </section>}
  </article>;
}
