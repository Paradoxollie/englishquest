import { ReactNode } from "react";
import { SpeakSelection } from "@/components/courses/speak-selection";

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
    .replace(/[̀-ͯ]/g, "")
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

  let badgeLabel = `Partie ${index + 1}`;
  if (numericIndex !== null) {
    badgeLabel = `Partie ${numericIndex}`;
  } else if (/quiz|validation/i.test(remainingTitle)) {
    badgeLabel = "Quiz";
  } else if (/introduction|ouverture/i.test(remainingTitle)) {
    badgeLabel = "Pour commencer";
  }

  return { badgeLabel, mainTitle, subTitle, numericIndex };
}

const calloutTitles: Record<CalloutType, string> = {
  remember: "À retenir",
  warning: "Attention",
  tip: "Astuce",
};

function CalloutBox({ type, children }: CalloutBoxProps) {
  return (
    <aside className={`eq-callout eq-callout-${type}`}>
      <p className="eq-callout-title">{calloutTitles[type]}</p>
      <div>{children}</div>
    </aside>
  );
}

interface LessonSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
  sectionIndex?: number;
  id?: string;
}

function LessonSection({ title, children, className = "", sectionIndex = 0, id }: LessonSectionProps) {
  const parsed = parseLessonSectionTitle(title, sectionIndex);
  const anchorId = id ?? createLessonSectionId(title, sectionIndex);
  const isQuiz = /quiz|validation/i.test(title);

  return (
    <section id={isQuiz ? "quiz" : anchorId} className={`eq-lesson-section ${className}`}>
      {isQuiz ? <span id={anchorId} /> : null}
      <header className="eq-lesson-section-head">
        <h2>
          {parsed.mainTitle}
          {parsed.subTitle ? <span className="eq-lesson-section-sub">{parsed.subTitle}</span> : null}
        </h2>
      </header>
      <div className="lesson-section-content">{children}</div>
    </section>
  );
}

interface LessonLayoutProps {
  courseNumber: number;
  title: string;
  objective?: string;
  levelLabel?: string;
  typeLabel?: string;
  aside?: ReactNode;
  topBar?: ReactNode;
  children: ReactNode;
}

export function LessonLayout({
  courseNumber,
  title,
  objective,
  levelLabel,
  typeLabel,
  aside,
  topBar,
  children,
}: LessonLayoutProps) {
  const match = title.match(/^(.*?)\s*\((.*)\)\s*$/);
  const main = match ? match[1] : title;
  const sub = match ? match[2] : null;

  return (
    <div className="cahier cahier-ruled eq-lesson">
      {topBar}
      <div className="eq-container eq-lesson-grid">
        {aside ? <div className="eq-lesson-aside">{aside}</div> : null}
        <article className="eq-lesson-article">
          <p className="eq-lesson-kicker">
            Cours {courseNumber}
            {levelLabel ? ` · ${levelLabel}` : ""}
            {typeLabel ? ` · ${typeLabel}` : ""}
          </p>
          <h1 className="eq-lesson-title">
            {main}
            {sub ? <span className="eq-lesson-subtitle">{sub}</span> : null}
          </h1>
          {objective ? <p className="eq-lesson-objective">{objective}</p> : null}
          <SpeakSelection />
          <div className="eq-lesson-body">{children}</div>
        </article>
      </div>
    </div>
  );
}

export { CalloutBox, LessonSection };
