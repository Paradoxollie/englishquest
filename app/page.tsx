import Link from "next/link";
import { MotionCard } from "@/components/ui/motion-card";
import {
  GameIcon,
  GiftIcon,
  GoldIcon,
  LevelIcon,
  QuestIcon,
  ScrollIcon,
  TeacherIcon,
  XPIcon,
} from "@/components/ui/icons";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const featureCards = [
  {
    label: "Pratique",
    title: "Jeux",
    Icon: GameIcon,
    iconBg: "bg-cyan-600",
    accentText: "text-cyan-300",
    cardStyle: "linear-gradient(135deg, rgba(8, 145, 178, 0.22) 0%, rgba(15, 23, 42, 0.97) 100%)",
    copy: "Jouez à des jeux utiles pour apprendre l'anglais. Chaque partie nourrit une progression claire et motivante.",
  },
  {
    label: "Parcours",
    title: "Chemin de cours",
    Icon: QuestIcon,
    iconBg: "bg-emerald-600",
    accentText: "text-emerald-300",
    cardStyle: "linear-gradient(135deg, rgba(5, 150, 105, 0.24) 0%, rgba(15, 23, 42, 0.97) 100%)",
    copy: "Suivez un parcours de 50 cours progressifs avec XP, récompenses et objectifs visibles à chaque étape.",
  },
  {
    label: "Encadrement",
    title: "Professeurs",
    Icon: TeacherIcon,
    iconBg: "bg-amber-600",
    accentText: "text-amber-300",
    cardStyle: "linear-gradient(135deg, rgba(217, 119, 6, 0.24) 0%, rgba(15, 23, 42, 0.97) 100%)",
    copy: "Un espace enseignants est prévu pour suivre une classe sans brouiller l'expérience des apprenants.",
  },
] as const;

const heroHighlights = [
  { label: "Parcours", value: "50 cours progressifs" },
  { label: "Jeux", value: "Formats courts et efficaces" },
  { label: "Récompenses", value: "XP, or et avatars" },
] as const;

const learningSteps = [
  {
    number: "1",
    title: "Créez un compte",
    copy: "Entrez rapidement dans une plateforme qui rend votre progression lisible dès le premier écran.",
  },
  {
    number: "2",
    title: "Travaillez le bon contenu",
    copy: "Alternez cours et jeux pour fixer les notions, sans perdre le fil de votre parcours.",
  },
  {
    number: "3",
    title: "Suivez vos acquis",
    copy: "Voyez ce qui est validé, ce qu'il faut reprendre et ce qui vient ensuite.",
  },
] as const;

const methodologyPoints = [
  "50 leçons progressives",
  "Exercices interactifs variés",
  "Suivi précis de la progression",
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
    username: "Invité",
    level: 1,
    xp: 0,
    gold: 0,
    isGuest: true,
  };

  const xpProgress = getXPProgress(displayData.xp, displayData.level);

  return (
    <div className="space-y-8 md:space-y-20">
      <section className="grid gap-6 md:gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-4 md:space-y-6">
          <span className="comic-panel inline-flex border-2 border-black bg-cyan-600 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white md:text-xs">
            La progression avant le bruit
          </span>

          <div className="space-y-3 md:space-y-4">
            <h1 className="text-balance text-3xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
              Progressez en anglais comme dans vos jeux favoris.
            </h1>
            <p className="text-balance text-sm leading-relaxed text-slate-200 md:text-xl">
              Suivez un parcours de 50 cours où chaque défi vous rapporte de l'XP, des pièces d'or et des récompenses.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {heroHighlights.map((highlight) => (
              <div key={highlight.label} className="comic-panel border-2 border-black bg-slate-900/75 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 md:text-[11px]">
                  {highlight.label}
                </p>
                <p className="mt-1 text-sm font-bold text-white md:text-base">{highlight.value}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/play"
              className="comic-button bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700 md:px-8 md:py-4 md:text-base"
            >
              Commencer à jouer
            </Link>
            <Link
              href="/auth/signup"
              className="comic-button bg-slate-800 px-5 py-3 text-sm font-bold text-white hover:bg-slate-700 md:px-8 md:py-4 md:text-base"
            >
              Créer mon compte
            </Link>
          </div>
        </div>

        <MotionCard>
          <div
            className="comic-card-dark p-5 md:p-7"
            style={{ background: "linear-gradient(135deg, rgba(5, 150, 105, 0.24) 0%, rgba(15, 23, 42, 0.98) 72%)" }}
          >
            <div className="relative z-10 space-y-4 md:space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-300 md:text-xs">
                    {displayData.isGuest ? "Profil invité" : "Profil joueur"}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-white md:text-3xl">{displayData.username}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-300">Un aperçu simple, clair et lisible de votre progression.</p>
                </div>
                <div className="comic-panel flex shrink-0 items-center gap-2 border-2 border-black bg-emerald-600 px-3 py-2 text-white">
                  <LevelIcon className="h-4 w-4" />
                  <span className="text-sm font-bold">Niveau {displayData.level}</span>
                </div>
              </div>

              <div className="comic-panel border-2 border-black bg-slate-950/70 p-4 md:p-5">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 font-semibold text-slate-300">
                    <XPIcon className="h-4 w-4 text-emerald-400" />
                    <span>Points d'expérience</span>
                  </div>
                  <span className="font-bold text-slate-400">
                    {xpProgress.current.toLocaleString("fr-FR")} / {xpProgress.required.toLocaleString("fr-FR")}
                  </span>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full border border-black bg-slate-950">
                  <div
                    className="relative h-full rounded-full bg-gradient-to-r from-emerald-700 via-emerald-500 to-emerald-400"
                    style={{ width: `${xpProgress.percentage}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                  </div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="comic-panel border-2 border-black bg-slate-900/80 p-4">
                  <div className="flex items-start gap-3">
                    <div className="comic-panel flex h-10 w-10 shrink-0 items-center justify-center border-2 border-black bg-emerald-600 p-2">
                      <ScrollIcon className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Objectif</p>
                      <p className="mt-1 font-bold text-white">Cours du jour</p>
                      <p className="mt-1 text-sm font-semibold text-slate-300">Jouer à 3 jeux</p>
                    </div>
                  </div>
                </div>

                <div className="comic-panel border-2 border-black bg-slate-900/80 p-4">
                  <div className="flex items-start gap-3">
                    <div className="comic-panel flex h-10 w-10 shrink-0 items-center justify-center border-2 border-black bg-amber-500 p-2">
                      <GiftIcon className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">Récompense</p>
                      <p className="mt-1 font-bold text-white">Prochaine récompense</p>
                      <p className="mt-1 text-sm font-semibold text-slate-300">Nouvel avatar</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="comic-panel border-2 border-black bg-slate-900/75 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <XPIcon className="h-4 w-4 text-emerald-400" />
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">XP</p>
                  </div>
                  <p className="text-2xl font-bold text-emerald-300">{displayData.xp.toLocaleString("fr-FR")}</p>
                </div>
                <div className="comic-panel border-2 border-black bg-slate-900/75 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <GoldIcon className="h-4 w-4 text-amber-400" />
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Or</p>
                  </div>
                  <p className="text-2xl font-bold text-amber-300">{displayData.gold.toLocaleString("fr-FR")}</p>
                </div>
              </div>
            </div>
          </div>
        </MotionCard>
      </section>

      <section className="grid gap-4 md:gap-6 md:grid-cols-3">
        {featureCards.map((card) => {
          const Icon = card.Icon;
          return (
            <MotionCard key={card.title} className="h-full">
              <div
                className="comic-card-dark flex h-full flex-col p-5 md:p-6"
                style={{ background: card.cardStyle }}
              >
                <div className="relative z-10 flex h-full flex-col">
                  <div className="flex items-start gap-4">
                    <div className={`comic-panel flex h-12 w-12 shrink-0 items-center justify-center border-2 border-black ${card.iconBg} p-2 md:h-14 md:w-14`}>
                      <Icon className="h-6 w-6 text-white md:h-7 md:w-7" />
                    </div>
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-[0.18em] ${card.accentText}`}>{card.label}</p>
                      <h3 className="mt-1 text-xl font-bold text-white md:text-2xl">{card.title}</h3>
                    </div>
                  </div>
                  <p className="mt-4 flex-grow text-sm leading-relaxed text-slate-200 md:text-base">{card.copy}</p>
                  <div className="mt-5 comic-panel border-2 border-black bg-slate-900/75 px-4 py-3">
                    <p className="text-sm font-bold text-white">Une carte claire, un objectif clair.</p>
                  </div>
                </div>
              </div>
            </MotionCard>
          );
        })}
      </section>

      <section className="space-y-6 md:space-y-12">
        <div className="text-center">
          <h2 className="break-words text-2xl font-bold text-white md:text-4xl lg:text-5xl">Comment ça marche</h2>
          <p className="mt-2 text-sm text-slate-300 md:mt-4 md:text-lg">Commencez en trois étapes simples</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {learningSteps.map((step) => (
            <div
              key={step.number}
              className="comic-card-dark h-full p-5 md:p-6"
              style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.96) 100%)" }}
            >
              <div className="comic-panel mb-4 inline-flex h-12 w-12 items-center justify-center border-2 border-black bg-cyan-600 text-xl font-bold text-white md:h-14 md:w-14 md:text-2xl">
                {step.number}
              </div>
              <h3 className="text-xl font-bold text-white md:text-2xl">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-200 md:text-base">{step.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid items-start gap-6 md:grid-cols-2 md:gap-8">
        <div className="comic-panel-dark p-6 md:p-8">
          <div className="relative z-10 space-y-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">Méthode</p>
              <h2 className="mt-2 text-2xl font-bold text-white md:text-4xl">Une méthode pédagogique éprouvée</h2>
            </div>
            <div className="space-y-4 text-sm leading-relaxed text-slate-200 md:text-base">
              <p>
                English Quest n'est pas seulement un jeu, c'est une méthode d'apprentissage complète conçue par des professeurs.
                Nous combinons les principes de la <strong>gamification</strong> avec une progression pédagogique rigoureuse.
              </p>
              <p>
                Chaque cours est structuré pour introduire progressivement de nouveaux concepts grammaticaux et lexicaux,
                renforcés immédiatement par des exercices ludiques. Cette approche active favorise la mémorisation à long terme
                et maintient la motivation intacte.
              </p>
            </div>
            <div className="grid gap-3">
              {methodologyPoints.map((point) => (
                <div key={point} className="comic-panel border-2 border-black bg-slate-900/80 px-4 py-3">
                  <span className="text-sm font-bold text-white">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <MotionCard className="h-full">
          <div
            className="comic-card-dark h-full p-6 md:p-8"
            style={{ background: "linear-gradient(135deg, rgba(79, 70, 229, 0.24) 0%, rgba(15, 23, 42, 0.97) 100%)" }}
          >
            <div className="relative z-10 space-y-5">
              <div className="flex items-center gap-3">
                <div className="comic-panel flex h-12 w-12 items-center justify-center border-2 border-black bg-indigo-600 text-lg font-bold text-white">
                  PM
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-300">Vision</p>
                  <h3 className="mt-1 text-2xl font-bold text-white">Pourquoi ça marche ?</h3>
                </div>
              </div>

              <div className="comic-panel border-2 border-black bg-slate-950/70 p-5">
                <p className="text-base leading-relaxed text-slate-100">
                  "L'apprentissage par le jeu permet de dédramatiser l'erreur. Dans un jeu, perdre une vie n'est pas un échec,
                  c'est une opportunité de recommencer et de s'améliorer. C'est exactement l'état d'esprit qu'il faut pour apprendre une langue."
                </p>
              </div>

              <div className="border-t border-slate-700/70 pt-4">
                <p className="font-bold text-white">Pierre Marienne</p>
                <p className="text-sm font-semibold text-slate-300">Créateur d'English Quest</p>
              </div>
            </div>
          </div>
        </MotionCard>
      </section>

      <section
        className="comic-panel-dark p-6 md:p-10"
        style={{ background: "linear-gradient(135deg, rgba(5, 150, 105, 0.22) 0%, rgba(15, 23, 42, 0.98) 80%)" }}
      >
        <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Prêt à commencer ?</p>
            <h2 className="mt-2 text-2xl font-bold text-white md:text-4xl">
              Prêt à commencer votre parcours en anglais ?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-200 md:text-base">
              Rejoignez des apprenants qui veulent une progression claire, visible et motivante.
            </p>
          </div>

          <Link
            href="/auth/signup"
            className="comic-button inline-flex items-center justify-center bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700 md:px-8 md:py-4 md:text-base"
          >
            Commencer maintenant
          </Link>
        </div>
      </section>
    </div>
  );
}
