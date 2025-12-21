import { ReactNode } from "react";
import Link from "next/link";
import { BookIcon, ArrowLeftIcon } from "@/components/ui/icons";

/**
 * Composant réutilisable pour afficher les cours de grammaire
 * Style inspiré de "English Grammar in Use" mais avec explications en français
 */

export type CalloutType = "remember" | "warning" | "tip";

interface CalloutBoxProps {
  type: CalloutType;
  children: ReactNode;
}

function CalloutBox({ type, children }: CalloutBoxProps) {
  const styles = {
    remember: {
      bg: "linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(34, 197, 94, 0.15) 100%)",
      border: "border-emerald-500/60",
      iconBg: "bg-emerald-600",
      title: "À retenir",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
    warning: {
      bg: "linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(251, 191, 36, 0.15) 100%)",
      border: "border-amber-500/60",
      iconBg: "bg-amber-600",
      title: "Attention",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    tip: {
      bg: "linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(59, 130, 246, 0.15) 100%)",
      border: "border-cyan-500/60",
      iconBg: "bg-cyan-600",
      title: "Astuce",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
  };

  const style = styles[type];

  return (
    <div
      className={`comic-panel border-2 ${style.border} p-5 my-6 relative overflow-hidden`}
      style={{ background: style.bg }}
    >
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl ${type === 'remember' ? 'bg-emerald-500' :
          type === 'warning' ? 'bg-amber-500' :
            'bg-cyan-500'
          }`} />
      </div>
      <div className="relative z-10 flex items-start gap-4">
        <div className={`${style.iconBg} border-2 border-black p-2 rounded-lg flex-shrink-0 shadow-lg`}>
          <div className="text-white">
            {style.icon}
          </div>
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-white mb-3 text-lg text-outline">{style.title}</h4>
          <div className="text-slate-100 text-outline leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
}

interface LessonSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

function LessonSection({ title, children, className = "" }: LessonSectionProps) {
  return (
    <section className={`comic-panel-dark p-6 md:p-8 mb-8 relative overflow-hidden ${className}`}
      style={{
        background: "linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)",
      }}>
      {/* Subtle gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 opacity-60" />

      <div className="relative z-10">
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="h-1 w-24 bg-gradient-to-r from-cyan-400 to-indigo-400 rounded-full mb-4" />

          {(() => {
            const match = title.match(/^(.*?)\s*\((.*)\)\s*$/);
            const mainTitle = match ? match[1] : title;
            const subTitle = match ? match[2] : null;

            return (
              <>
                <h2 className="text-2xl md:text-3xl font-bold text-white text-center leading-tight"
                  style={{
                    textShadow: '3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
                  }}>
                  {mainTitle}
                </h2>
                {subTitle && (
                  <span className="text-lg md:text-xl text-cyan-400 font-bold tracking-wide uppercase text-center block mt-1"
                    style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.5)' }}>
                    {subTitle}
                  </span>
                )}
              </>
            );
          })()}
        </div>
        <div className="text-slate-200 text-outline leading-relaxed space-y-5">{children}</div>
      </div>
    </section>
  );
}

interface LessonLayoutProps {
  courseNumber: number;
  title: string;
  objective?: string;
  children: ReactNode;
  backUrl?: string;
}

export function LessonLayout({ courseNumber, title, objective, children, backUrl = "/tous-les-cours" }: LessonLayoutProps) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 comic-dot-pattern">
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-12">
        <div className="comic-panel-dark w-full p-6 md:p-8 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%)",
          }}>
          {/* Decorative background elements */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute top-10 right-10 w-64 h-64 bg-cyan-500 rounded-full blur-3xl" />
            <div className="absolute bottom-10 left-10 w-48 h-48 bg-indigo-500 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            {/* Back Button */}
            <div className="mb-6 md:mb-8">
              <Link
                href={backUrl}
                className="comic-button bg-slate-800 text-white px-3 py-1.5 md:px-5 md:py-2.5 text-xs md:text-base font-bold hover:bg-slate-700 inline-flex items-center gap-1.5 md:gap-2 transition-all hover:scale-105 border-2 md:border-4 border-black"
              >
                <ArrowLeftIcon className="w-3 h-3 md:w-4 md:h-4" />
                Retour aux cours
              </Link>
            </div>

            {/* Header */}
            <header className="mb-8 md:mb-12 flex flex-col items-center text-center">
              <div className="mb-4 md:mb-6">
                <span className="comic-panel bg-gradient-to-r from-indigo-600 to-purple-600 border-2 md:border-4 border-black px-4 py-2 text-sm md:text-base font-bold text-white text-outline inline-block shadow-lg transform rotate-[-2deg] hover:rotate-0 transition-transform duration-300">
                  Cours {courseNumber}
                </span>
              </div>

              {(() => {
                const match = title.match(/^(.*?)\s*\((.*)\)\s*$/);
                const main = match ? match[1] : title;
                const sub = match ? match[2] : null;

                return (
                  <div className="mb-6 flex flex-col items-center">
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight text-balance max-w-3xl mb-2"
                      style={{
                        textShadow: '4px 4px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
                      }}>
                      {main}
                    </h1>
                    {sub && (
                      <h2 className="text-xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 tracking-wide mt-2"
                        style={{ filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.5))' }}>
                        {sub}
                      </h2>
                    )}
                  </div>
                );
              })()}

              {objective && (
                <div className="comic-panel bg-slate-800/80 border-2 md:border-4 border-slate-700/50 p-4 md:p-6 rounded-xl max-w-2xl transform hover:scale-[1.02] transition-transform duration-300">
                  <p className="text-base md:text-xl text-slate-100 text-outline leading-tight md:leading-relaxed text-balance">
                    {objective}
                  </p>
                </div>
              )}
            </header>

            {/* Content */}
            <div className="space-y-8">{children}</div>
          </div>
        </div>
      </div>
    </main>
  );
}

// Export des composants pour utilisation dans les pages de cours
export { CalloutBox, LessonSection };

