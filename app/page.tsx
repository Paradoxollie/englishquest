import Link from "next/link";
import { MotionCard } from "@/components/ui/motion-card";
import { GameIcon, QuestIcon, TeacherIcon, XPIcon, GoldIcon, ScrollIcon, GiftIcon, LevelIcon, AvatarIcon } from "@/components/ui/icons";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/profile";

const featureCards = [
  {
    title: "Jeux",
    Icon: GameIcon,
    copy: "Jouez à des jeux ludiques pour apprendre l'anglais. Chaque jeu vous donne un score et vous pouvez voir qui est le meilleur au classement général.",
  },
  {
    title: "Chemin de cours",
    Icon: QuestIcon,
    copy: "Suivez un parcours de 50 cours progressifs avec XP, pièces d'or et récompenses pour suivre votre apprentissage.",
  },
  {
    title: "Professeurs",
    Icon: TeacherIcon,
    copy: "Accédez à des cours et activités ludiques clés en main, prêts à utiliser en classe avec vos élèves.",
  },
];

/**
 * Calcule l'XP nécessaire pour passer au niveau suivant
 * Formule : XP_required = level * 1000
 */
function getXPForNextLevel(level: number): number {
  return level * 1000;
}

/**
 * Calcule le pourcentage de progression vers le prochain niveau
 */
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
  // Récupérer les données de l'utilisateur connecté (si connecté)
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Si l'utilisateur est connecté, rediriger vers la page d'accueil connectée
  if (user) {
    const { redirect } = await import("next/navigation");
    redirect("/home");
  }
  
  // Données à afficher pour les invités
  const displayData = {
    username: "Invité",
    level: 1,
    xp: 0,
    gold: 0,
    isGuest: true,
  };
  
  const xpProgress = getXPProgress(displayData.xp, displayData.level);
  return (
    <div className="space-y-16 md:space-y-24">
      {/* Hero Section */}
      <section className="grid gap-10 md:grid-cols-2 md:items-center">
        {/* Left Column */}
        <div className="space-y-6">
          {/* 
            Main hero text - to tweak, modify the h1 below
          */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
              Progressez en anglais comme dans vos jeux favoris.
            </h1>
            <p className="text-lg leading-relaxed text-slate-300 md:text-xl">
              Suivez un parcours de 50 cours où chaque défi vous rapporte de l'XP, des pièces d'or et des récompenses.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
             <Link
               href="/play"
               className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-800 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-950/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-emerald-950/40"
             >
               <span className="relative z-10">Commencer à jouer</span>
               <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
             </Link>
             <Link
               href="/auth/signup"
               className="rounded-xl border-2 border-emerald-900/30 bg-slate-950/40 px-8 py-4 text-sm font-semibold text-slate-200 transition-all duration-300 hover:border-emerald-800/40 hover:bg-slate-950/60 hover:text-emerald-300"
             >
              Créer mon compte
            </Link>
          </div>
        </div>

        {/* Right Column - Player Panel Card */}
        <MotionCard className="relative">
           <div className="relative overflow-hidden rounded-2xl border border-emerald-950/30 bg-gradient-to-br from-slate-950/95 via-slate-950/90 to-slate-900/95 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
             {/* Decorative gradient overlay */}
             <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/3 via-transparent to-emerald-900/3" />
             
             <div className="relative z-10 space-y-6">
               {/* Player Header */}
               <div className="flex items-center justify-between border-b border-slate-700/50 pb-4">
                 <div>
                   <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                     {displayData.isGuest ? "Profil invité" : "Profil joueur"}
                   </p>
                   <p className="mt-1 text-2xl font-bold text-white">{displayData.username}</p>
                   {!displayData.isGuest && (
                     <p className="mt-1 text-xs text-emerald-400/80">✓ Données liées à votre compte</p>
                   )}
                 </div>
                 <div className="flex items-center gap-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 px-4 py-2 border-2 border-black">
                   <LevelIcon className="w-4 h-4 text-white" />
                   <span className="text-sm font-bold text-white">Niveau {displayData.level}</span>
                 </div>
               </div>
               
               {/* XP Progress Bar */}
               <div className="space-y-2">
                 <div className="flex items-center justify-between text-xs">
                   <div className="flex items-center gap-1.5 font-medium text-slate-400">
                     <XPIcon className="w-4 h-4 text-emerald-500" />
                     <span>Points d'expérience</span>
                   </div>
                   <span className="font-semibold text-slate-400">{xpProgress.current.toLocaleString('fr-FR')} / {xpProgress.required.toLocaleString('fr-FR')}</span>
                 </div>
                 <div className="relative h-3 overflow-hidden rounded-full bg-slate-900/60">
                   <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/20 to-emerald-900/20" />
                   <div 
                     className="relative h-full rounded-full bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-500 shadow-lg shadow-emerald-950/40"
                     style={{ width: `${xpProgress.percentage}%` }}
                   >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                  </div>
                </div>
              </div>

              {/* Quest & Reward Cards */}
              <div className="grid gap-3">
                 <div className="group relative overflow-hidden rounded-xl border border-emerald-950/30 bg-slate-900/30 p-4 transition-all duration-300 hover:border-emerald-900/30 hover:bg-slate-900/50">
                   <div className="flex items-start gap-3">
                     <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 border-2 border-black">
                       <ScrollIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white">Cours du jour</p>
                      <p className="mt-0.5 text-xs text-slate-400">Jouer à 3 jeux</p>
                    </div>
                  </div>
                </div>
                <div className="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/40 p-4 transition-all duration-300 hover:border-amber-500/30 hover:bg-slate-800/60">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500 border-2 border-black">
                      <GiftIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white">Prochaine récompense</p>
                      <p className="mt-0.5 text-xs text-slate-400">Nouvel avatar</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                 <div className="rounded-xl border border-emerald-950/30 bg-slate-900/30 p-4">
                   <div className="flex items-center gap-2 mb-2">
                     <XPIcon className="w-4 h-4 text-emerald-500" />
                     <p className="text-xs font-medium uppercase tracking-wider text-slate-500">XP</p>
                   </div>
                   <p className="text-2xl font-bold text-emerald-400">{displayData.xp.toLocaleString('fr-FR')}</p>
                 </div>
                <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <GoldIcon className="w-4 h-4 text-amber-400" />
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Or</p>
                  </div>
                  <p className="text-2xl font-bold text-amber-300">{displayData.gold.toLocaleString('fr-FR')}</p>
                </div>
              </div>
            </div>
          </div>
        </MotionCard>
      </section>

      {/* Feature Cards Section */}
      <section className="grid gap-6 md:grid-cols-3">
        {featureCards.map((card) => {
          const Icon = card.Icon;
          return (
            <MotionCard key={card.title}>
               <div className="group relative h-full overflow-hidden rounded-2xl border border-emerald-950/30 bg-gradient-to-br from-slate-950/90 to-slate-900/90 p-8 shadow-[0_12px_40px_rgba(0,0,0,0.7)] transition-all duration-300 hover:border-emerald-900/30 hover:shadow-[0_20px_60px_rgba(6,78,59,0.2)]">
                 {/* Decorative gradient on hover */}
                 <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/3 via-transparent to-emerald-900/3 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                 
                 <div className="relative z-10">
                   <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 border-2 border-black shadow-lg transition-transform duration-300 group-hover:scale-110">
                     <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="mb-3 text-2xl font-bold text-white">{card.title}</h3>
                  <p className="leading-relaxed text-slate-300">{card.copy}</p>
                </div>
              </div>
            </MotionCard>
          );
        })}
      </section>

      {/* How it Works Section */}
      <section className="space-y-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">Comment ça marche</h2>
          <p className="mt-4 text-lg text-slate-400">Commencez en trois étapes simples</p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="group relative text-center">
             <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-950/30 to-emerald-900/30 border border-emerald-900/30 text-3xl font-bold text-emerald-400 shadow-lg shadow-emerald-950/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-emerald-950/30">
              1
            </div>
            <h3 className="mb-3 text-xl font-bold text-white">Créez un compte</h3>
            <p className="leading-relaxed text-slate-300">
              Inscrivez-vous en quelques secondes et commencez votre parcours d'apprentissage de l'anglais.
            </p>
          </div>
          <div className="group relative text-center">
             <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-950/30 to-emerald-900/30 border border-emerald-900/30 text-3xl font-bold text-emerald-400 shadow-lg shadow-emerald-950/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-emerald-950/30">
              2
            </div>
            <h3 className="mb-3 text-xl font-bold text-white">Jouez aux jeux et suivez les cours</h3>
            <p className="leading-relaxed text-slate-300">
              Gagnez de l'XP et des pièces d'or en jouant aux jeux ludiques et en progressant à travers 50 cours de difficulté croissante.
            </p>
          </div>
          <div className="group relative text-center">
             <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-950/30 to-emerald-900/30 border border-emerald-900/30 text-3xl font-bold text-emerald-400 shadow-lg shadow-emerald-950/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-emerald-950/30">
              3
            </div>
            <h3 className="mb-3 text-xl font-bold text-white">Débloquez des avatars et grimpez au classement</h3>
            <p className="leading-relaxed text-slate-300">
              Personnalisez votre profil et rivalisez avec les autres apprenants.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA Band */}
       <section className="relative overflow-hidden rounded-3xl border border-emerald-950/30 bg-gradient-to-br from-slate-950/95 via-slate-900/95 to-slate-950/95 p-12 text-center shadow-[0_20px_60px_rgba(0,0,0,0.8)] md:p-16">
         <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/3 via-transparent to-emerald-900/3" />
         <div className="relative z-10">
           <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
             Prêt à commencer votre parcours en anglais ?
           </h2>
           <p className="mb-8 text-lg text-slate-400">
             Rejoignez des milliers d'apprenants qui progressent en anglais
           </p>
           <Link
             href="/auth/signup"
             className="group relative inline-block overflow-hidden rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-800 px-10 py-5 text-base font-bold text-white shadow-lg shadow-emerald-950/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-emerald-950/40"
           >
             <span className="relative z-10">Commencer maintenant</span>
             <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </Link>
        </div>
      </section>
    </div>
  );
}

