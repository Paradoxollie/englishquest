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
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500 opacity-80" />
      <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative z-10">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex items-start gap-4">
            <div className="comic-panel border-2 border-black bg-cyan-600 p-3">
              <BookIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
                Plan du cours
              </p>
              <h2 className="text-2xl font-black text-white text-outline md:text-3xl">
                Lecture guidee
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-300 md:text-base">
                Utilise ce plan pour avancer section par section, revenir sur un point cle ou retrouver
                rapidement le quiz final.
              </p>
            </div>
          </div>

          <div className="comic-panel border-2 border-black bg-slate-950/60 px-4 py-3 text-center">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
              Sections
            </p>
            <p className="mt-1 text-2xl font-black text-white">{sections.length}</p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {sections.map((section, index) => {
            const parsed = parseLessonSectionTitle(section.title, index);

            return (
              <Link
                key={section.id}
                href={`#${section.id}`}
                className="group comic-panel flex items-center justify-between gap-4 border-2 border-black bg-slate-900/75 px-4 py-4 transition-all hover:-translate-y-0.5 hover:bg-slate-800"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 border-black bg-slate-950/80 shadow-[0_4px_0_0_#000]">
                    <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-300 bg-clip-text text-base font-black text-transparent">
                      {parsed.numericIndex ?? index + 1}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300/90">
                      {parsed.badgeLabel}
                    </p>
                    <p className="truncate text-sm font-bold text-white md:text-base">
                      {parsed.mainTitle}
                    </p>
                    {parsed.subTitle && (
                      <p className="truncate text-xs font-semibold uppercase tracking-[0.14em] text-violet-300">
                        {parsed.subTitle}
                      </p>
                    )}
                  </div>
                </div>

                <ArrowRightIcon className="h-4 w-4 shrink-0 text-cyan-300 transition-transform group-hover:translate-x-0.5" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
