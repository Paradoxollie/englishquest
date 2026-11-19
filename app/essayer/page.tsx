import Image from "next/image";
import Link from "next/link";
import course23 from "@/lib/courses/exercises/course23.json";
import { resolveAudioAsset } from "@/lib/games/audio-manifest-server";
import { ECHO_SIGNAL_SCENARIOS } from "@/lib/games/echoSignal";
import { getGamePresentation } from "@/lib/games/presentation";
import { VERBS } from "@/lib/games/speed-verb-challenge";
import { SITE_URL } from "@/lib/site/config";
import { publicPageMetadata } from "@/lib/site/metadata";
import { TrialQuestion, CopyTrialLink, type Trial } from "./trial";
import styles from "./trial.module.css";

const tabs = [
  { id: "ecoute", label: "Écoute", href: "/essayer", game: "echo-signal", title: "Comprends une annonce en gare" },
  { id: "verbes", label: "Verbes", href: "/essayer?defi=verbes", game: "speed-verb-challenge", title: "Retrouve le verbe au passé" },
  { id: "grammaire", label: "Grammaire", href: "/essayer?defi=grammaire", game: "grammar-rush", title: "Choisis entre for et since" },
] as const;

type Tab = typeof tabs[number];
type PageProps = { searchParams: Promise<{ defi?: string | string[] }> };

async function selectedTab({ searchParams }: PageProps) {
  const { defi } = await searchParams;
  return tabs.find((tab) => tab.id === defi) ?? tabs[0];
}

export async function generateMetadata(props: PageProps) {
  const tab = await selectedTab(props);
  const art = getGamePresentation({ slug: tab.game, name: tab.label });
  const metadata = publicPageMetadata({
    path: tab.href,
    title: `${tab.title} · Un défi d’anglais sans compte`,
    description: "Essaie gratuitement un défi d’anglais en une minute. Écoute une annonce, conjugue un verbe ou complète une phrase et découvre l’explication de ta réponse.",
    image: art.artworkSrc,
    imageAlt: art.imageAlt,
  });
  return { ...metadata, alternates: { canonical: "/essayer" } };
}

function questionFor(id: Tab["id"]): Trial {
  if (id === "ecoute") {
    const scenario = ECHO_SIGNAL_SCENARIOS.find((item) => item.id === "l1-kings-cross-train");
    if (!scenario) throw new Error("Annonce pour Brighton introuvable");
    const question = scenario.questions[1];
    const audioUrl = resolveAudioAsset(`/audio/echo-signal/${scenario.id}.mp3`);
    if (!audioUrl) throw new Error("Enregistrement pour Brighton introuvable");
    return {
      instructions: "Écoute l’annonce du train pour Brighton.",
      audio: { url: audioUrl, transcript: scenario.lines.map((line) => line.text).join(" ") },
      prompt: question.prompt, choices: question.options, answers: [question.options[question.correctIndex]],
      hint: "Réécoute la fin. Quel numéro entends-tu juste avant « not » ?",
      explanation: question.explanation, nextLabel: "Jouer à Echo Signal", nextUrl: "/play/echo-signal",
    };
  }
  if (id === "verbes") {
    const verb = VERBS.find((item) => item.base === "leave");
    if (!verb) throw new Error("Verbe leave introuvable");
    return {
      instructions: "Complète la phrase avec le prétérit de leave (partir).",
      prompt: "Yesterday, the train ___ at ten.", englishPrompt: true, answers: verb.pastSimple,
      hint: "Leave est irrégulier. Sa forme au prétérit commence par l et compte quatre lettres.",
      explanation: "Yesterday situe l’action dans le passé. Leave devient left. Le train est parti à dix heures.",
      nextLabel: "Jouer à Speed Verb Challenge", nextUrl: "/play/speed-verb-challenge",
    };
  }
  const gap = course23.items.find((item) => item.id === "x7");
  if (!gap?.prompt || !gap.answers) throw new Error("Exercice for et since introuvable");
  return {
    instructions: "En anglais, « depuis » peut se dire de deux façons. Complète la phrase.",
    prompt: gap.prompt, englishPrompt: true, choices: ["for", "since"], answers: gap.answers,
    hint: "Two years indique une durée. Quel mot anglais introduit une durée ?",
    explanation: gap.explanation, nextLabel: "Découvrir la leçon sur for et since", nextUrl: "/cours/23",
  };
}

export default async function TryPage(props: PageProps) {
  const tab = await selectedTab(props);
  const art = getGamePresentation({ slug: tab.game, name: tab.label });
  return (
    <div className={`eq-container ${styles.page}`}>
      <header className={styles.header}>
        <h1>Un défi d’anglais en une minute</h1>
        <p>Trois activités gratuites, sans compte.</p>
      </header>
      <nav className={styles.tabs} aria-label="Choisir un défi">
        {tabs.map((item) => (
          <Link key={item.id} href={item.href} scroll={false} aria-current={item.id === tab.id ? "page" : undefined}>
            {item.label}
          </Link>
        ))}
      </nav>
      <section className={styles.panel} aria-labelledby="trial-heading">
        <div className={styles.activity}>
          <h2 id="trial-heading">{tab.title}</h2>
          <TrialQuestion key={tab.id} trial={questionFor(tab.id)} />
        </div>
        <div className={styles.illustration}>
          <Image src={art.artworkSrc} alt={art.imageAlt} width={780} height={520} sizes="(max-width: 699px) 92vw, 42vw" />
        </div>
      </section>
      <footer className={styles.footer}>
        <CopyTrialLink key={tab.id} url={new URL(tab.href, SITE_URL).href} />
        <Link href="/play" className="eq-text-link">Découvrir les neuf jeux</Link>
      </footer>
    </div>
  );
}
