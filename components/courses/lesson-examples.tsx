import type { ReactNode } from "react";

type Example = { english: string; meaning: string };

export function LessonExamples({
  children,
  examples,
  note,
}: {
  children: ReactNode;
  examples: Example[];
  note?: ReactNode;
}) {
  return (
    <div className="eq-lesson-examples">
      <p>{children}</p>
      <dl>
        {examples.map(({ english, meaning }) => (
          <div key={english}>
            <dt lang="en">{english}</dt>
            <dd>{meaning}</dd>
          </div>
        ))}
      </dl>
      {note ? <p>{note}</p> : null}
    </div>
  );
}
