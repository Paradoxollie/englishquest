import Link from "next/link";
import { ArrowRightIcon, BookIcon } from "@/components/ui/icons";
import { parseLessonSectionTitle } from "@/components/courses/lesson-layout";

type CourseTableOfContentsProps = {
  sections: Array<{
    id: string;
    title: string;
  }>;
};

export function CourseTableOfContents({ sections }: CourseTableOfContentsProps) {
  return (
    <section className="comic-panel-dark relative overflow-hidden p-6 md:p-8">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 opacity-60" />

      <div className="relative z-10">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="comic-panel border-2 border-black bg-cyan-600 p-3">
              <BookIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
                Plan du cours
              </p>
              <h2 className="text-2xl font-bold text-white text-outline">Reperes rapides</h2>
            </div>
          </div>

          <span className="comic-panel border-2 border-black bg-slate-900/80 px-4 py-2 text-xs font-bold text-slate-200">
            {sections.length} sections
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {sections.map((section, index) => {
            const parsed = parseLessonSectionTitle(section.title, index);

            return (
              <Link
                key={section.id}
                href={`#${section.id}`}
                className="comic-panel flex items-center justify-between gap-3 border-2 border-black bg-slate-800 px-4 py-4 transition-transform hover:scale-[1.01]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="comic-panel border-2 border-black bg-slate-900 px-3 py-2 text-sm font-bold text-cyan-300">
                    {parsed.numericIndex ?? index + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-white md:text-base">
                      {parsed.mainTitle}
                    </p>
                    {parsed.subTitle && (
                      <p className="truncate text-xs font-semibold uppercase tracking-[0.12em] text-cyan-300">
                        {parsed.subTitle}
                      </p>
                    )}
                  </div>
                </div>
                <ArrowRightIcon className="h-4 w-4 shrink-0 text-cyan-300" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
