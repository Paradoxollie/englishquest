import { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "@/components/ui/icons";

/**
 * Composant reutilisable pour afficher les cours de grammaire
 * Style English Quest: comics premium, structure editoriale nette.
 */

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
  } else if (/vigilance|piege|attention/i.test(remainingTitle)) {
    badgeLabel = "Vigilance";
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
      bg: "linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(34, 197, 94, 0.08) 100%)",
      border: "border-emerald-500/50",
      iconBg: "bg-emerald-500",
      title: "A retenir",
      glow: "shadow-[0_0_0_1px_rgba(16,185,129,0.18),0_24px_50px_rgba(16,185,129,0.08)]",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      bg: "linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(217, 119, 6, 0.08) 100%)",
      border: "border-amber-500/50",
      iconBg: "bg-amber-500",
      title: "Attention",
      glow: "shadow-[0_0_0_1px_rgba(245,158,11,0.18),0_24px_50px_rgba(245,158,11,0.08)]",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      bg: "linear-gradient(135deg, rgba(6, 182, 212, 0.18) 0%, rgba(59, 130, 246, 0.08) 100%)",
      border: "border-cyan-500/50",
      iconBg: "bg-cyan-500",
      title: "Astuce",
      glow: "shadow-[0_0_0_1px_rgba(6,182,212,0.18),0_24px_50px_rgba(6,182,212,0.08)]",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      className={`lesson-callout ${style.glow} relative my-6 overflow-hidden rounded-[1.35rem] border-2 p-5 ${style.border}`}
      style={{ background: style.bg }}
    >
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -right-8 top-0 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
      </div>
      <div className="relative z-10 flex items-start gap-4">
        <div className={`${style.iconBg} flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-black text-white shadow-[0_4px_0_0_#000]`}>
          {style.icon}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="mb-2 text-lg font-black uppercase tracking-[0.16em] text-white text-outline">
            {style.title}
          </h4>
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
      className={`lesson-section-shell comic-panel-dark relative mb-8 scroll-mt-28 overflow-hidden p-6 md:p-8 ${className}`}
      style={{
        background:
          "linear-gradient(135deg, rgba(24, 39, 68, 0.97) 0%, rgba(15, 23, 42, 0.98) 45%, rgba(10, 18, 35, 0.98) 100%)",
      }}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500 opacity-85" />
      <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-cyan-400/30 via-transparent to-transparent" />
      <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-500/8 blur-3xl" />

      <div className="relative z-10">
        <div className="mb-8 flex flex-col gap-5 border-b border-white/10 pb-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.1rem] border-2 border-black bg-slate-950/70 shadow-[0_4px_0_0_#000]">
              <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-300 bg-clip-text text-xl font-black text-transparent">
                {parsed.numericIndex ?? sectionIndex + 1}
              </span>
            </div>

            <div className="min-w-0">
              <p className="mb-2 text-[11px] font-black uppercase tracking-[0.24em] text-cyan-300/90">
                {parsed.badgeLabel}
              </p>
              <h2
                className="text-2xl font-black leading-tight text-white md:text-3xl"
                style={{
                  textShadow:
                    "3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
                }}
              >
                {parsed.mainTitle}
              </h2>
              {parsed.subTitle && (
                <p className="mt-2 text-sm font-bold uppercase tracking-[0.18em] text-violet-300 md:text-base">
                  {parsed.subTitle}
                </p>
              )}
            </div>
          </div>

          <Link
            href={`#${anchorId}`}
            className="inline-flex items-center gap-2 self-start rounded-full border border-white/15 bg-slate-950/45 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-300 transition-colors hover:border-cyan-400/50 hover:text-cyan-200"
          >
            Ancre
          </Link>
        </div>

        <div className="lesson-section-content text-slate-200 text-outline leading-relaxed">
          {children}
        </div>
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
  const titleMatch = title.match(/^(.*?)\s*\((.*)\)\s*$/);
  const mainTitle = titleMatch ? titleMatch[1] : title;
  const subTitle = titleMatch ? titleMatch[2] : null;

  return (
    <main className="lesson-shell min-h-screen bg-gradient-to-br from-stone-950 via-[#071324] to-stone-950 comic-dot-pattern">
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
        <div
          className="comic-panel-dark relative w-full overflow-hidden p-6 md:p-8 lg:p-10"
          style={{
            background:
              "linear-gradient(135deg, rgba(22, 35, 61, 0.98) 0%, rgba(15, 23, 42, 0.99) 48%, rgba(7, 18, 36, 0.99) 100%)",
          }}
        >
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute left-10 top-10 h-64 w-64 rounded-full bg-cyan-500 blur-3xl" />
            <div className="absolute bottom-8 right-8 h-52 w-52 rounded-full bg-violet-500 blur-3xl" />
          </div>
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />

          <div className="relative z-10">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 md:mb-8">
              <Link
                href={backUrl}
                className="comic-button inline-flex items-center gap-2 bg-slate-800 px-4 py-2 text-sm font-bold text-white hover:bg-slate-700"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Retour aux cours
              </Link>

              <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-300">
                <span className="comic-panel border-2 border-black bg-slate-950/70 px-3 py-1">
                  Parcours English Quest
                </span>
                <span className="comic-panel border-2 border-black bg-indigo-700 px-3 py-1 text-white">
                  Cours {courseNumber}
                </span>
              </div>
            </div>

            <header className="mb-8 md:mb-12">
              <div className="mx-auto max-w-3xl text-center">
                <p className="mb-4 text-[11px] font-black uppercase tracking-[0.34em] text-cyan-300 md:text-xs">
                  Lecon structuree, claire et progressive
                </p>

                <h1
                  className="text-4xl font-black leading-none text-white md:text-6xl"
                  style={{
                    textShadow:
                      "4px 4px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
                  }}
                >
                  {mainTitle}
                </h1>

                {subTitle && (
                  <p className="mt-4 bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-300 bg-clip-text text-2xl font-black tracking-[0.08em] text-transparent md:text-4xl">
                    {subTitle}
                  </p>
                )}

                {objective && (
                  <div className="mt-8 rounded-[1.6rem] border-2 border-white/10 bg-slate-950/35 p-5 shadow-[0_28px_60px_rgba(0,0,0,0.28)] md:p-6">
                    <div className="mx-auto mb-4 h-1.5 w-24 rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-400" />
                    <p className="mb-2 text-[11px] font-black uppercase tracking-[0.26em] text-cyan-300">
                      Objectif de maitrise
                    </p>
                    <p className="text-base leading-relaxed text-slate-100 md:text-xl">
                      {objective}
                    </p>
                  </div>
                )}
              </div>
            </header>

            <div className="space-y-8 md:space-y-10">{children}</div>
          </div>
        </div>
      </div>
    </main>
  );
}

export { CalloutBox, LessonSection };
