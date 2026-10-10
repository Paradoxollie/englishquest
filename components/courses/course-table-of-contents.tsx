"use client";

import { useEffect, useState } from "react";

type CourseTableOfContentsProps = {
  sections: { id: string; title: string }[];
  estimatedMinutes?: number;
};

function cleanTitle(title: string) {
  return title.replace(/^\d+\.\s*/, "").replace(/\s*\(.*\)\s*$/, "");
}

export function CourseTableOfContents({ sections, estimatedMinutes }: CourseTableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(sections[0]?.id ?? null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      return;
    }
    const nodes = sections
      .map((section) => document.getElementById(section.id))
      .filter((node): node is HTMLElement => Boolean(node));
    if (nodes.length === 0) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-120px 0px -60% 0px", threshold: [0, 0.2] }
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav className="eq-toc" aria-label="Plan du cours">
      <p className="eq-toc-title">Dans ce cours</p>
      <ol className="eq-toc-list">
        {sections.map((section) => (
          <li key={section.id}>
            <a href={`#${section.id}`} aria-current={activeId === section.id ? "true" : undefined}>
              {cleanTitle(section.title)}
            </a>
          </li>
        ))}
      </ol>
      {estimatedMinutes ? (
        <p className="eq-toc-time">
          <b>{estimatedMinutes} min</b>
          Lecture et quiz. Tu peux reprendre plus tard.
        </p>
      ) : null}
    </nav>
  );
}
