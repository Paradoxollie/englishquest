import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  BookIcon,
  CheckIcon,
  GameIcon,
  GoldIcon,
  LevelIcon,
  QuestIcon,
  TeacherIcon,
  TrophyIcon,
  XPIcon,
} from "@/components/ui/icons";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const heroStats = [
  { label: "Parcours", value: "50 cours", detail: "du niveau A1 vers C1" },
  { label: "Jeux", value: "6 modes", detail: "pour ancrer les reflexes" },
  { label: "Progression", value: "XP + or", detail: "visible a chaque etape" },
] as const;

const entryCards = [
  {
    label: "Cours",
    title: "Apprendre dans l'ordre",
    copy: "Ouvre le catalogue, choisis une notion et avance avec des lecons courtes, structurees et faciles a reprendre.",
    href: "/tous-les-cours",
    cta: "Voir les cours",
    Icon: BookIcon,
    accent: "#22d3ee",
    background: "linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(15, 23, 42, 0.98) 72%)",
  },
  {
    label: "Jeux",
    title: "Reviser en action",
    copy: "Transforme une notion en partie rapide: vocabulaire, conjugaison, traduction, memoire ou vitesse clavier.",
    href: "/play",
    cta: "Entrer dans l'arene",
    Icon: GameIcon,
    accent: "#facc15",
    background: "linear-gradient(135deg, rgba(245, 158, 11, 0.22) 0%, rgba(15, 23, 42, 0.98) 72%)",
  },
  {
    label: "Aventure",
    title: "Suivre la campagne",
    copy: "Garde le cap avec une route conseillee, des objectifs lisibles et des missions qui se debloquent progressivement.",
    href: "/quest",
    cta: "Ouvrir l'aventure",
    Icon: QuestIcon,
    accent: "#34d399",
    background: "linear-gradient(135deg, rgba(16, 185, 129, 0.22) 0%, rgba(15, 23, 42, 0.98) 72%)",
  },
] as const;

const methodPoints = [
  "Une notion claire par cours",
  "Des exercices courts pour verifier",
  "Des jeux pour automatiser",
  "Une progression visible sans surcharge",
] as const;

const rhythmSteps = [
  {
    number: "01",
    title: "Comprendre",
    copy: "Chaque cours pose la notion avec des exemples directs et un objectif precis.",
  },
  {
    number: "02",
    title: "S'entrainer",
    copy: "Les questions et les jeux renforcent la notion pendant qu'elle est encore fraiche.",
  },
  {
    number: "03",
    title: "Rejouer",
    copy: "Les formats courts aident a revenir souvent, sans transformer l'apprentissage en tunnel.",
  },
] as const;

function getXPForNextLevel(level: number): number {
  return level * 1000;
}

function getXPProgress(currentXP: number, level: number): { current: number; required: number; percentage: number } {
  const required = getXPForNextLevel(level);
  const percentage = required > 0 ? Math.min((currentXP / required) * 100, 100) : 0;

  return {
    current: currentXP,
    required,
    percentage: Math.round(percentage),
  };
}

export default async function PublicHomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { redirect } = await import("next/navigation");
    redirect("/home");
  }

  const displayData = {
    username: "Invite",
    level: 1,
    xp: 0,
    gold: 0,
  };

  const xpProgress = getXPProgress(displayData.xp, displayData.level);

  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2 overflow-x-clip bg-[#020617] text-white">
      <section className="relative min-h-[680px] overflow-hidden border-b-4 border-black md:min-h-[700px]">
        <Image
          src="/page-art/home-hero.png"
          alt="Illustration comic book d'une academie English Quest."
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/86 to-[#020617]/18" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-black/38" />
        <div className="absolute inset-0 comic-dot-pattern-light opacity-20" />

        <div className="relative mx-auto flex min-h-[680px] max-w-[1460px] flex-col justify-end px-4 py-10 md:min-h-[700px] md:px-6 md:py-14 xl:px-10">
          <div className="max-w-4xl">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200 text-outline">
              English Quest
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-[1.02] text-white text-outline md:text-6xl xl:text-7xl">
              Apprendre l'anglais avec un parcours clair et des jeux utiles.
            </h1>
            <p className="mt-5 max-w-3xl text-base font-semibold leading-relaxed text-slate-100 text-outline md:text-xl">
              English Quest garde l'energie du jeu, mais remet la progression au centre:
              cours structures, entrainements courts, missions lisibles et recompenses.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/tous-les-cours"
                className="comic-button inline-flex items-center gap-2 bg-cyan-600 px-5 py-3 text-sm font-bold text-white hover:bg-cyan-700 md:px-6 md:py-4 md:text-base"
              >
                Commencer par les cours
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link
                href="/play"
                className="comic-button inline-flex items-center gap-2 bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800 md:px-6 md:py-4 md:text-base"
              >
                Voir les jeux
              </Link>
              <Link
                href="/auth/signup"
                className="comic-button inline-flex items-center gap-2 bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700 md:px-6 md:py-4 md:text-base"
              >
                Creer mon compte
              </Link>
            </div>

            <div className="mt-8 grid max-w-4xl gap-3 sm:grid-cols-3">
              {heroStats.map((stat) => (
                <div key={stat.label} className="border-l-4 border-cyan-300 bg-black/52 p-4 backdrop-blur-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-white">{stat.value}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-300">{stat.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-[1460px] px-4 py-10 md:px-6 md:py-16 xl:px-10">
        <section className="grid gap-5 md:grid-cols-3">
          {entryCards.map((card) => {
            const Icon = card.Icon;

            return (
              <Link
                key={card.title}
                href={card.href}
                className="group comic-card-dark flex min-h-[290px] flex-col p-5 md:p-6"
                style={{ background: card.background }}
              >
                <div className="relative z-10 flex h-full flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center border-4 border-black bg-slate-950 shadow-[0_3px_0_#000]"
                      style={{ color: card.accent }}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: card.accent }}>
                      {card.label}
                    </p>
                  </div>

                  <h2 className="mt-5 text-2xl font-bold leading-tight text-white text-outline">
                    {card.title}
                  </h2>
                  <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-200 md:text-base">
                    {card.copy}
                  </p>

                  <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-bold" style={{ color: card.accent }}>
                    {card.cta}
                    <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            );
          })}
        </section>

        <section className="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start md:mt-16">
          <div className="relative overflow-hidden border-4 border-black bg-slate-950 p-6 shadow-[0_4px_0_#000] md:p-8">
            <div className="absolute inset-0 comic-dot-pattern-light opacity-20" />
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300 text-outline">
                Apercu de progression
              </p>
              <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-3xl font-bold text-white">{displayData.username}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-300">Profil de depart</p>
                </div>
                <div className="inline-flex w-fit items-center gap-2 border-4 border-black bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-[0_3px_0_#000]">
                  <LevelIcon className="h-4 w-4" />
                  Niveau {displayData.level}
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 font-semibold text-slate-300">
                    <XPIcon className="h-4 w-4 text-emerald-400" />
                    <span>Experience</span>
                  </div>
                  <span className="font-bold text-slate-400">
                    {xpProgress.current.toLocaleString("fr-FR")} / {xpProgress.required.toLocaleString("fr-FR")}
                  </span>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full border border-black bg-slate-900">
                  <div
                    className="relative h-full rounded-full bg-gradient-to-r from-emerald-700 via-emerald-500 to-emerald-300"
                    style={{ width: `${xpProgress.percentage}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer" />
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="border border-white/10 bg-white/5 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <XPIcon className="h-4 w-4 text-emerald-400" />
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">XP</p>
                  </div>
                  <p className="text-2xl font-bold text-emerald-300">{displayData.xp.toLocaleString("fr-FR")}</p>
                </div>
                <div className="border border-white/10 bg-white/5 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <GoldIcon className="h-4 w-4 text-amber-400" />
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Or</p>
                  </div>
                  <p className="text-2xl font-bold text-amber-300">{displayData.gold.toLocaleString("fr-FR")}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300 text-outline">
              Methode
            </p>
            <h2 className="mt-2 text-3xl font-bold leading-tight text-white text-outline md:text-4xl">
              Une interface de jeu, une logique de cours.
            </h2>
            <p className="mt-4 max-w-3xl text-sm font-semibold leading-relaxed text-slate-300 md:text-base">
              Le style reste bande dessinee, mais chaque ecran doit aider l'apprenant a
              comprendre ou il est, quoi faire ensuite et pourquoi la session est utile.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {methodPoints.map((point) => (
                <div key={point} className="flex items-center gap-3 border border-white/10 bg-slate-950/70 p-4">
                  <CheckIcon className="h-5 w-5 shrink-0 text-emerald-300" />
                  <span className="text-sm font-bold text-white">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-12 md:mt-16">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-300 text-outline">
                Rythme
              </p>
              <h2 className="mt-2 text-3xl font-bold text-white text-outline md:text-4xl">
                Une session courte, un resultat visible.
              </h2>
            </div>
            <p className="max-w-2xl text-sm font-semibold leading-relaxed text-slate-300 md:text-base">
              Le parcours alterne explication, entrainement et jeu pour eviter les longues
              pages passives.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {rhythmSteps.map((step) => (
              <div key={step.number} className="border-4 border-black bg-slate-950 p-5 shadow-[0_4px_0_#000] md:p-6">
                <p className="text-sm font-black text-cyan-300">{step.number}</p>
                <h3 className="mt-3 text-2xl font-bold text-white text-outline">{step.title}</h3>
                <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-300">{step.copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 overflow-hidden border-4 border-black bg-gradient-to-r from-emerald-950 via-slate-950 to-cyan-950 p-6 shadow-[0_4px_0_#000] md:mt-16 md:p-8">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300 text-outline">
                Pret a demarrer
              </p>
              <h2 className="mt-2 text-3xl font-bold text-white text-outline md:text-4xl">
                Commence par un cours, puis verrouille la notion en jeu.
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/tous-les-cours"
                className="comic-button inline-flex items-center gap-2 bg-cyan-600 px-5 py-3 text-sm font-bold text-white hover:bg-cyan-700"
              >
                Explorer les cours
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link
                href="/auth/signup"
                className="comic-button inline-flex items-center gap-2 bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700"
              >
                Creer mon compte
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-12 grid gap-5 md:grid-cols-2 md:mt-16">
          <div className="border border-white/10 bg-slate-950/70 p-5 md:p-6">
            <div className="flex items-center gap-3">
              <TeacherIcon className="h-6 w-6 text-amber-300" />
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-300">Pour les enseignants</p>
            </div>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-300">
              L'espace professeur reste separe pour accompagner une classe sans alourdir
              le parcours des apprenants.
            </p>
          </div>
          <div className="border border-white/10 bg-slate-950/70 p-5 md:p-6">
            <div className="flex items-center gap-3">
              <TrophyIcon className="h-6 w-6 text-cyan-300" />
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">Pour les apprenants</p>
            </div>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-300">
              Les recompenses donnent du rythme, mais le centre reste toujours le contenu:
              comprendre, pratiquer et revenir au bon moment.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
