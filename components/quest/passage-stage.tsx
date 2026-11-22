"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type Ref } from "react";
import type { Activity } from "@/lib/adventure/activities";
import type { Passage } from "@/lib/adventure/catalog";
import { storyPanel, type Hero } from "@/lib/adventure/panels";
import { landscapeSizes, passageArt, passagePicture } from "./passage-art";

const subject: Record<number, Record<Hero, string>> = {
  1: { Maya: "34% 59%", Sam: "76% 39%" }, 2: { Maya: "64% 61%", Sam: "36% 34%" },
  3: { Maya: "38% 42%", Sam: "76% 54%" }, 4: { Maya: "28% 50%", Sam: "73% 47%" },
  5: { Maya: "32% 61%", Sam: "72% 39%" },
  6: { Maya: "25% 47%", Sam: "76% 48%" }, 7: { Maya: "26% 45%", Sam: "74% 44%" },
  8: { Maya: "36% 48%", Sam: "64% 42%" }, 9: { Maya: "21% 43%", Sam: "37% 43%" },
  10: { Maya: "28% 49%", Sam: "75% 48%" },
  11: { Maya: "32% 45%", Sam: "79% 41%" }, 12: { Maya: "24% 38%", Sam: "79% 36%" },
  13: { Maya: "24% 45%", Sam: "84% 42%" }, 14: { Maya: "36% 43%", Sam: "63% 42%" },
  15: { Maya: "22% 44%", Sam: "80% 41%" },
};

function Caption({ text }: { text: string }) {
  return <p className="comic-caption"><span className="sr-only">{text}</span><span aria-hidden="true">
    {text.split(" ").map((word, i) => <span key={i} className="comic-word" style={{ animationDelay: `${Math.min(i, 18) * 22}ms` }}>{word} </span>)}
  </span></p>;
}

export function PassageStage({ episode, index, beat, turn, open, nextLabel }: {
  episode: Passage; index: number; beat: number; turn: (n: number) => void; open: () => void; nextLabel: string;
}) {
  const panel = storyPanel(episode.id, index);
  const length = panel.dialogue.length;
  const speech = panel.dialogue[beat - 1];
  const picture = passagePicture(episode, index);
  const heroesInView = picture.src === passageArt[episode.art];
  const title = useRef<HTMLHeadingElement>(null);
  const frame = useRef<HTMLElement>(null);
  useEffect(() => {
    frame.current?.scrollIntoView({ block: "start", behavior: "instant" });
    title.current?.focus({ preventScroll: true });
  }, [index]);
  function advance() { if (beat < length) turn(beat + 1); else open(); }

  return <section className="comic-panel" ref={frame} aria-label="Lecture de la BD" onKeyDown={e => {
    if (e.altKey || e.metaKey || e.ctrlKey || e.repeat) return;
    if (e.key === "ArrowRight") { e.preventDefault(); advance(); }
    if (e.key === "ArrowLeft" && beat > 0) { e.preventDefault(); turn(beat - 1); }
  }}>
    <h1 ref={title} tabIndex={-1} className="sr-only">{episode.title}</h1>
    <div className="comic-frame" data-speaker={speech?.speaker} data-view={speech ? "speech" : "wide"}
      data-cutaway={!heroesInView || undefined} style={{ "--comic-focus": speech && heroesInView ? subject[episode.id][speech.speaker] : "50% 50%" } as CSSProperties}>
      <div className="comic-picture"><Image src={picture.src} alt={picture.alt} placeholder="blur" priority sizes={landscapeSizes} /></div>
      <div className="comic-utterance" key={beat} aria-live="polite" aria-atomic="true">
        {speech ? <div className="comic-balloon">
          <Image className="comic-portrait" src={speech.speaker === "Maya" ? "/art/personnages/maya-visage.webp" : "/art/personnages/sam-visage.webp"} alt="" width={58} height={58} />
          <div><strong>{speech.speaker}</strong><p lang={speech.lang}>{speech.line}</p>{speech.french && <small className="comic-gloss">{speech.french}</small>}</div>
        </div> : <Caption text={panel.caption} />}
      </div>
    </div>
    <nav className="comic-controls" aria-label="Tourner les cases">
      <button type="button" className="comic-back" disabled={!beat} onClick={() => turn(beat - 1)} aria-label="Case précédente">←</button>
      <span className="comic-count" aria-live="polite">Case {beat + 1} sur {length + 1}</span>
      <button type="button" className="atlas-cta comic-next" onClick={advance}>{beat === 0 ? "Lire la bulle" : beat < length ? "Bulle suivante" : nextLabel} <span aria-hidden="true">→</span></button>
    </nav>
  </section>;
}

const reminders: Record<number, NonNullable<Activity["lesson"]>> = {
  1: { rule: "Saluer, puis se présenter", example: "Hello! · Bonjour !\nI’m Maya. · Je m’appelle Maya." },
  2: { rule: "La couleur vient avant l’objet.", example: "a blue bag · un sac bleu\na red key · une clé rouge" },
  3: { rule: "Le verbe change avec la personne.", example: "I have a bag. · J’ai un sac.\nSam has a map. · Sam a une carte." },
  4: { rule: "Indiquer une position", example: "in · dans\non · sur\nunder · sous" },
  5: { rule: "Croiser les indices", example: "I have a key. · J’ai une clé.\nThe map is on the bag. · La carte est sur le sac." },
  6: { rule: "Parler d’une autre personne", example: "I am Sam. · Je suis Sam.\nShe is a pilot. · Elle est pilote.\nHe is a singer. · Il est chanteur." },
  7: { rule: "Demander et répondre", example: "Are you the singer? · Es-tu la chanteuse ?\nYes, I am. · Oui.\nNo, I’m not. · Non." },
  8: { rule: "Demander et compter", example: "How many keys? · Combien de clés ?\none, two, three, four, five · un, deux, trois, quatre, cinq\ntwo blue keys · deux clés bleues" },
  9: { rule: "Suivre un itinéraire", example: "Turn left. · Tourne à gauche.\nTurn right. · Tourne à droite.\nGo straight. · Va tout droit.\nThen stop. · Ensuite, arrête-toi." },
  10: { rule: "Écrire pour son équipe", example: "We are ready. · Nous sommes prêts.\nWe have a map. · Nous avons une carte.\nWe need a key. · Nous avons besoin d’une clé." },
  11: { rule: "À qui est l’objet ?", example: "This is my bag. · C’est mon sac.\nThis is your map. · C’est ta carte." },
  12: { rule: "Parler d’Iris et de Noé", example: "her key · sa clé à elle\nhis key · sa clé à lui" },
  13: { rule: "Ce que sait faire l’automate", example: "I can open the door. · Je peux ouvrir la porte.\nI can’t carry the bag. · Je ne peux pas porter le sac." },
  14: { rule: "Demander et donner une position", example: "Where is the key? · Où est la clé ?\nWhere are the stars? · Où sont les étoiles ?\non the map · sur la carte\nunder the table · sous la table" },
  15: { rule: "Parler au nom d’Iris", example: "This is my key. · C’est ma clé.\nI can open the door. · Je peux ouvrir la porte." },
};

const greetings = [
  // Dvortygirl's public-domain US recording, https://commons.wikimedia.org/wiki/File:En-us-hello.ogg
  { word: "Hello!", translation: "Bonjour !", clip: "hello-us" },
  { word: "Goodbye!", translation: "Au revoir !", clip: "maya-goodbye" },
];

type AudioFile = { src: string; label: string };

export function AudioOptions({ files, unavailable = false }: { files: AudioFile[]; unavailable?: boolean }) {
  return <details className="atlas-audio-help" open={unavailable || undefined}>
    <summary>Options d’écoute</summary>
    {unavailable && <p role="status">Tu peux écouter le fichier dans ton lecteur habituel.</p>}
    <div>{files.map(file => <a key={file.src} href={file.src} download>{file.label}</a>)}</div>
  </details>;
}

const greetingFiles = greetings.map(({ clip, word }) => ({
  src: `/audio/passage/${clip}.mp3`, label: `Télécharger « ${word} » en MP3`,
}));

function SpokenGreetings() {
  const audio = useRef<HTMLAudioElement>(null);
  const [failed, setFailed] = useState("");
  useEffect(() => { const el = audio.current; return () => el?.pause(); }, []);
  function listen(clip: string) {
    const el = audio.current;
    if (!el) return;
    el.pause();
    el.src = `/audio/passage/${clip}.mp3`;
    setFailed("");
    const src = el.src;
    void el.play().catch((e: Error) => { if (e.name !== "AbortError" && el.src === src) setFailed(clip); });
  }
  return <div className="comic-words">{greetings.map(g => <div className="comic-word-row" key={g.clip}>
    <div><b lang="en">{g.word}</b><span>{g.translation}</span></div>
    <button type="button" className="comic-listen" aria-label={`Écouter « ${g.word} » en anglais américain`} onClick={() => listen(g.clip)}>
      <span aria-hidden="true">▶</span> Écouter</button>
  </div>)}<audio preload="none" ref={audio} />
    <AudioOptions files={greetingFiles} unavailable={Boolean(failed)} />
  </div>;
}

function SentencePieces({ parts }: { parts: NonNullable<NonNullable<Activity["lesson"]>["parts"]> }) {
  const [selected, setSelected] = useState<number | null>(null);
  return <div className="comic-sentence">
    <div className="comic-pieces" role="group" aria-label="Les mots de la phrase">{parts.map(([word], i) =>
      <button type="button" lang="en" key={word} aria-pressed={selected === i} onClick={() => setSelected(i)}>{word}</button>
    )}</div>
    <p role="status">{selected === null ? "Touche un mot pour le comprendre." : parts[selected][1]}</p>
  </div>;
}

export function ComicLesson({ episode, index, step, hint, focusRef }: { episode: number; index: number; step: Activity; hint?: string; focusRef?: Ref<HTMLHeadingElement> }) {
  const entry = step.lesson ?? reminders[episode];
  return <aside className="comic-notebook" aria-label="Petit cours">
    <div className="comic-notebook-tab">Carnet de bord</div>
    <h2 tabIndex={-1} ref={focusRef}>{entry.rule}</h2>
    {episode === 1 && index === 0 ? <SpokenGreetings /> : <div className="comic-examples">{entry.example.split("\n").map(line => {
      const [en, fr] = line.split(/ · | = /, 2);
      return <p key={line}><b lang="en">{en}</b>{fr && <span>{fr}</span>}</p>;
    })}</div>}
    {entry.parts && <SentencePieces parts={entry.parts} />}
    {entry.say && <p className="comic-say">{entry.say}</p>}
    {hint && <p className="comic-hint">{hint}</p>}
  </aside>;
}
