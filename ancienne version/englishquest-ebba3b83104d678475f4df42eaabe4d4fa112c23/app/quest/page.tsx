import Link from "next/link";
import { MotionCard } from "@/components/ui/motion-card";
import { QuestIcon, XPIcon, BookIcon } from "@/components/ui/icons";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// TODO: Later, fetch real course data from Supabase courses table
// TODO: Check user's progress from user_course_progress table to show locked/unlocked status
// For now, using static data for the first 10 levels
const levelGradients = [
  "linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)", // Cyan/Blue
  "linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(34, 197, 94, 0.2) 100%)", // Emerald/Green
  "linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)", // Purple/Pink
  "linear-gradient(135deg, rgba(234, 179, 8, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%)", // Yellow/Amber
  "linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)", // Indigo/Blue
  "linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%)", // Red
  "linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(16, 185, 129, 0.2) 100%)", // Cyan/Emerald
  "linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(249, 115, 22, 0.2) 100%)", // Amber/Orange
  "linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)", // Purple/Indigo
  "linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)", // Green/Cyan
];

const levels = [
  {
    number: 1,
    title: "Greetings & Basic Verbs",
    description: "Apprenez les salutations et les verbes de base en anglais.",
    xpReward: 100,
    goldReward: 50,
    status: "preview" as const, // "locked" | "unlocked" | "completed" | "preview"
  },
  {
    number: 2,
    title: "Daily Routine",
    description: "Décrivez votre routine quotidienne en anglais.",
    xpReward: 150,
    goldReward: 75,
    status: "preview" as const,
  },
  {
    number: 3,
    title: "Family & Relationships",
    description: "Parlez de votre famille et de vos relations.",
    xpReward: 200,
    goldReward: 100,
    status: "preview" as const,
  },
  {
    number: 4,
    title: "Food & Cooking",
    description: "Apprenez le vocabulaire de la nourriture et de la cuisine.",
    xpReward: 250,
    goldReward: 125,
    status: "preview" as const,
  },
  {
    number: 5,
    title: "Hobbies & Interests",
    description: "Exprimez vos hobbies et centres d'intérêt.",
    xpReward: 300,
    goldReward: 150,
    status: "preview" as const,
  },
  {
    number: 6,
    title: "Travel & Transportation",
    description: "Parlez de vos voyages et des moyens de transport.",
    xpReward: 350,
    goldReward: 175,
    status: "preview" as const,
  },
  {
    number: 7,
    title: "Weather & Seasons",
    description: "Décrivez la météo et les saisons.",
    xpReward: 400,
    goldReward: 200,
    status: "preview" as const,
  },
  {
    number: 8,
    title: "Shopping & Clothes",
    description: "Apprenez à faire du shopping et parler de vêtements.",
    xpReward: 450,
    goldReward: 225,
    status: "preview" as const,
  },
  {
    number: 9,
    title: "Health & Body",
    description: "Parlez de la santé et du corps humain.",
    xpReward: 500,
    goldReward: 250,
    status: "preview" as const,
  },
  {
    number: 10,
    title: "Work & Professions",
    description: "Décrivez les professions et le monde du travail.",
    xpReward: 550,
    goldReward: 275,
    status: "preview" as const,
  },
];

const statusColors = {
  locked: "bg-slate-700",
  unlocked: "bg-cyan-600",
  completed: "bg-emerald-600",
  preview: "bg-amber-600",
};

const statusLabels = {
  locked: "Verrouillé",
  unlocked: "Débloqué",
  completed: "Terminé",
  preview: "Aperçu",
};

export default async function QuestPage() {
  // Vérifier si l'utilisateur est connecté
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 comic-dot-pattern">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        <div className="comic-panel-dark w-full p-6 md:p-8">
        {/* Hero Section */}
        <div className="comic-panel-dark mb-12 p-8" style={{ background: "linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(34, 197, 94, 0.2) 100%)" }}>
          <div className="relative z-10">
            <div className="mb-6 flex items-center gap-4">
              <div className="comic-panel bg-emerald-600 border-2 border-black p-4">
                <QuestIcon className="w-8 h-8 text-white text-outline" />
              </div>
              <h1 className="text-4xl font-bold text-white md:text-5xl text-outline">
                Chemin de cours
              </h1>
            </div>
            <p className="mb-4 text-lg text-slate-200 font-semibold text-outline">
              Suivez un parcours de 50 cours progressifs. Chaque niveau vous rapporte de l'XP et de l'or.
            </p>
            {!isLoggedIn && (
              <p className="text-sm text-amber-300 font-bold text-outline">
                💡 Connectez-vous pour débloquer les cours et suivre votre progression.
              </p>
            )}
          </div>
        </div>

        {/* Call to Action for non-logged users */}
        {!isLoggedIn && (
          <div className="mb-8 flex flex-wrap gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="comic-button bg-emerald-600 text-white px-6 py-3 font-bold hover:bg-emerald-700"
            >
              Créer mon compte
            </Link>
            <Link
              href="/auth/login"
              className="comic-button bg-slate-800 text-white px-6 py-3 font-bold hover:bg-slate-700"
            >
              Se connecter
            </Link>
          </div>
        )}

        {/* Quest Map - Mobile: Vertical Timeline, Desktop: Zigzag */}
        <div className="space-y-8">
          {/* Mobile: Vertical Timeline */}
          <div className="md:hidden">
            {levels.map((level, index) => (
              <MotionCard key={level.number}>
                <div className="relative">
                      {/* Connection Line (except last) */}
                  {index < levels.length - 1 && (
                    <div className="absolute left-8 top-16 h-8 w-1 bg-gradient-to-b from-cyan-500 to-emerald-500" />
                  )}
                  
                  <div className="comic-card-dark p-6" style={{ background: levelGradients[(level.number - 1) % levelGradients.length] }}>
                    <div className="relative z-10">
                      {/* Level Number Badge */}
                      <div className="mb-4 flex items-center gap-4">
                        <div className="comic-panel bg-cyan-600 border-2 border-black px-4 py-2">
                          <span className="text-2xl font-bold text-white text-outline">
                            {level.number}
                          </span>
                        </div>
                        <span
                          className={`comic-panel ${statusColors[level.status]} border-2 border-black px-3 py-1 text-xs font-bold text-white text-outline`}
                        >
                          {statusLabels[level.status]}
                        </span>
                      </div>

                      {/* Title and Description */}
                      <h2 className="text-xl font-bold text-white mb-2 text-outline">
                        {level.title}
                      </h2>
                      <p className="text-slate-200 font-semibold mb-4 text-outline">
                        {level.description}
                      </p>

                      {/* Rewards */}
                      <div className="flex gap-4">
                        <div className="comic-panel bg-amber-600 border-2 border-black px-3 py-1">
                          <div className="flex items-center gap-2">
                            <XPIcon className="w-4 h-4 text-white text-outline" />
                            <span className="text-xs font-bold text-white text-outline">{level.xpReward} XP</span>
                          </div>
                        </div>
                        <div className="comic-panel bg-yellow-600 border-2 border-black px-3 py-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs">🪙</span>
                            <span className="text-xs font-bold text-white text-outline">{level.goldReward}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </MotionCard>
            ))}
          </div>

          {/* Desktop: Zigzag Timeline */}
          <div className="hidden md:block">
            <div className="relative">
              {/* Central Path Line */}
              <div className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 bg-gradient-to-b from-cyan-500 via-purple-500 to-emerald-500" />

              {levels.map((level, index) => {
                const isLeft = index % 2 === 0;
                return (
                  <MotionCard key={level.number}>
                    <div className={`relative mb-8 flex ${isLeft ? "justify-start" : "justify-end"}`}>
                      {/* Connection Dot */}
                      <div className="absolute left-1/2 top-8 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-black bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg" />

                      {/* Level Card */}
                      <div className={`w-5/12 ${isLeft ? "pr-8" : "pl-8"}`}>
                        <div className="comic-card-dark p-6" style={{ background: levelGradients[(level.number - 1) % levelGradients.length] }}>
                          <div className="relative z-10">
                            {/* Level Number Badge */}
                            <div className="mb-4 flex items-center gap-4">
                              <div className="comic-panel bg-cyan-600 border-2 border-black px-4 py-2">
                                <span className="text-2xl font-bold text-white text-outline">
                                  {level.number}
                                </span>
                              </div>
                              <span
                                className={`comic-panel ${statusColors[level.status]} border-2 border-black px-3 py-1 text-xs font-bold text-white text-outline`}
                              >
                                {statusLabels[level.status]}
                              </span>
                            </div>

                            {/* Title and Description */}
                            <h2 className="text-xl font-bold text-white mb-2 text-outline">
                              {level.title}
                            </h2>
                            <p className="text-slate-200 font-semibold mb-4 text-outline">
                              {level.description}
                            </p>

                            {/* Rewards */}
                            <div className="flex gap-4">
                              <div className="comic-panel bg-amber-600 border-2 border-black px-3 py-1">
                                <div className="flex items-center gap-2">
                                  <XPIcon className="w-4 h-4 text-white text-outline" />
                                  <span className="text-xs font-bold text-white text-outline">{level.xpReward} XP</span>
                                </div>
                              </div>
                              <div className="comic-panel bg-yellow-600 border-2 border-black px-3 py-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs">🪙</span>
                                  <span className="text-xs font-bold text-white text-outline">{level.goldReward}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </MotionCard>
                );
              })}
            </div>
          </div>
        </div>

        {/* TODO: Replace static levels with dynamic data from Supabase:
        
        const { data: courses } = await supabase
          .from('courses')
          .select('*')
          .order('course_number', { ascending: true });
        
        const { data: progress } = await supabase
          .from('user_course_progress')
          .select('*')
          .eq('user_id', user?.id);
        
        // Map courses with progress status
        const levelsWithStatus = courses.map(course => ({
          ...course,
          status: getCourseStatus(course, progress)
        }));
        
        */}
        </div>
      </div>
    </div>
  );
}

