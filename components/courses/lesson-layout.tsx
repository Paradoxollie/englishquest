import { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "@/components/ui/icons";

export type CalloutType = "remember" | "warning" | "tip";

interface CalloutBoxProps {
  type: CalloutType;
  children: ReactNode;
}

type ParsedLessonTitle = {
  badgeLabel: string;
  mainTitle: string;
  subTitle: string | null;
  numericIndex: number | null;
};

export function createLessonSectionId(title: string, index: number) {
  const normalized = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized ? `section-${normalized}` : `section-${index + 1}`;
}

export function parseLessonSectionTitle(title: string, index: number): ParsedLessonTitle {
  let remainingTitle = title.trim();
  let numericIndex: number | null = null;

  const numberedMatch = remainingTitle.match(/^(\d+)\.\s*(.*)$/);
  if (numberedMatch) {
    numericIndex = Number.parseInt(numberedMatch[1], 10);
    remainingTitle = numberedMatch[2].trim();
  }

  const titleMatch = remainingTitle.match(/^(.*?)\s*\((.*)\)\s*$/);
  const mainTitle = titleMatch ? titleMatch[1].trim() : remainingTitle;
  const subTitle = titleMatch ? titleMatch[2].trim() : null;

  let badgeLabel = `Bloc ${index + 1}`;

  if (numericIndex !== null) {
    badgeLabel = `Etape ${numericIndex}`;
  } else if (/quiz|validation/i.test(remainingTitle)) {
    badgeLabel = "Validation";
  } else if (/introduction|ouverture/i.test(remainingTitle)) {
    badgeLabel = "Ouverture";
  }

  return {
    badgeLabel,
    mainTitle,
    subTitle,
    numericIndex,
  };
}

function CalloutBox({ type, children }: CalloutBoxProps) {
  const styles = {
    remember: {
      bg: "linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(34, 197, 94, 0.15) 100%)",
      border: "border-emerald-500/60",
      iconBg: "bg-emerald-600",
      title: "A retenir",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
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
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
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
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
    },
  };

  const style = styles[type];

  return (
    <div
      className={`comic-panel relative my-6 overflow-hidden border-2 p-5 ${style.border}`}
      style={{ background: style.bg }}
    >
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div
          className={`absolute top-0 right-0 h-32 w-32 rounded-full blur-3xl ${
            type === "remember" ? "bg-emerald-500" : type === "warning" ? "bg-amber-500" : "bg-cyan-500"
          }`}
        />
      </div>
      <div className="relative z-10 flex items-start gap-4">
        <div className={`${style.iconBg} rounded-lg border-2 border-black p-2 shadow-lg`}>
          <div className="text-white">{style.icon}</div>
        </div>
        <div className="flex-1">
          <h4 className="mb-3 text-lg font-bold text-white text-outline">{style.title}</h4>
          <div className="leading-relaxed text-slate-100 text-outline">{children}</div>
        </div>
      </div>
    </div>
  );
}

interface LessonSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
  sectionIndex?: number;
  id?: string;
}

function LessonSection({
  title,
  children,
  className = "",
  sectionIndex = 0,
  id,
}: LessonSectionProps) {
  const parsed = parseLessonSectionTitle(title, sectionIndex);
  const anchorId = id ?? createLessonSectionId(title, sectionIndex);

  return (
    <section
      id={anchorId}
      className={`comic-panel-dark relative mb-8 scroll-mt-28 overflow-hidden p-6 md:p-8 ${className}`}
      style={{
        background: "linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)",
      }}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 opacity-60" />

      <div className="relative z-10">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          {parsed.numericIndex !== null && (
            <span className="comic-panel border-2 border-black bg-slate-900 px-4 py-1 text-sm font-bold text-cyan-300">
              Etape {parsed.numericIndex}
            </span>
          )}

          <div className="mb-4 h-1 w-24 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400" />

          <h2
            className="text-2xl font-bold leading-tight text-white md:text-3xl"
            style={{
              textShadow:
                "3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
            }}
          >
            {parsed.mainTitle}
          </h2>

          {parsed.subTitle && (
            <span
              className="mt-1 block text-lg font-bold uppercase tracking-wide text-cyan-400 md:text-xl"
              style={{ textShadow: "1px 1px 0 rgba(0,0,0,0.5)" }}
            >
              {parsed.subTitle}
            </span>
          )}
        </div>

        <div className="lesson-section-content leading-relaxed text-slate-200 text-outline">{children}</div>
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

export function LessonLayout({
  courseNumber,
  title,
  objective,
  children,
  backUrl = "/tous-les-cours",
}: LessonLayoutProps) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 comic-dot-pattern">
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-12">
        <div
          className="comic-panel-dark relative w-full overflow-hidden p-6 md:p-8"
          style={{
            background: "linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%)",
          }}
        >
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute top-10 right-10 h-64 w-64 rounded-full bg-cyan-500 blur-3xl" />
            <div className="absolute bottom-10 left-10 h-48 w-48 rounded-full bg-indigo-500 blur-3xl" />
          </div>

          <div className="relative z-10">
            <div className="mb-6 md:mb-8">
              <Link
                href={backUrl}
                className="comic-button inline-flex items-center gap-1.5 border-2 border-black bg-slate-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-700 md:gap-2 md:border-4 md:px-5 md:py-2.5 md:text-base"
              >
                <ArrowLeftIcon className="h-3 w-3 md:h-4 md:w-4" />
                Retour aux cours
              </Link>
            </div>

            <header className="mb-8 flex flex-col items-center text-center md:mb-12">
              <div className="mb-4 md:mb-6">
                <span className="comic-panel inline-block border-2 border-black bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-bold text-white text-outline shadow-lg md:border-4 md:text-base">
                  Cours {courseNumber}
                </span>
              </div>

              {(() => {
                const match = title.match(/^(.*?)\s*\((.*)\)\s*$/);
                const main = match ? match[1] : title;
                const sub = match ? match[2] : null;

                return (
                  <div className="mb-6 flex flex-col items-center">
                    <h1
                      className="mb-2 max-w-3xl text-3xl font-black leading-tight text-white text-balance md:text-5xl lg:text-6xl"
                      style={{
                        textShadow:
                          "4px 4px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
                      }}
                    >
                      {main}
                    </h1>
                    {sub && (
                      <h2
                        className="mt-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-xl font-bold tracking-wide text-transparent md:text-3xl"
                        style={{ filter: "drop-shadow(2px 2px 0px rgba(0,0,0,0.5))" }}
                      >
                        {sub}
                      </h2>
                    )}
                  </div>
                );
              })()}

              {objective && (
                <div className="comic-panel max-w-2xl rounded-xl border-2 border-slate-700/50 bg-slate-800/80 p-4 md:border-4 md:p-6">
                  <p className="text-base leading-tight text-slate-100 text-outline text-balance md:text-xl md:leading-relaxed">
                    {objective}
                  </p>
                </div>
              )}
            </header>

            <div className="space-y-8">{children}</div>
          </div>
        </div>
      </div>
    </main>
  );
}

export { CalloutBox, LessonSection };
