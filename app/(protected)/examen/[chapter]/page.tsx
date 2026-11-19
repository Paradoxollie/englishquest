import { loginForCurrentPage } from "@/lib/navigation/login-return";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PageHead } from "@/components/comic/page-head";
import { getChapter, chapters } from "@/lib/courses/chapters";
import { EXAM_PASS_COUNT, EXAM_QUESTION_COUNT, buildChapterExam, examStatus, getUserChapterExams, isChapterCompleted } from "@/lib/exams/exams";
import { getChapterExamReward } from "@/lib/profile/economy";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ChapterExam } from "./chapter-exam";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ chapter: string }> }): Promise<Metadata> {
  const { chapter } = await params;
  const id = Number(chapter);
  const found = chapters.find((item) => item.id === id);
  return { title: found ? `Examen du chapitre ${found.id}` : "Examen" };
}

export default async function ChapterExamPage({ params }: { params: Promise<{ chapter: string }> }) {
  const { chapter: chapterParam } = await params;
  const chapterId = Number(chapterParam);
  if (!Number.isInteger(chapterId) || !chapters.some((item) => item.id === chapterId)) {
    notFound();
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(await loginForCurrentPage(`/examen/${encodeURIComponent(chapterParam)}`));
  }

  const chapter = getChapter(chapterId);
  const [completed, records] = await Promise.all([isChapterCompleted(user.id, chapterId), getUserChapterExams(user.id)]);
  const record = records.find((item) => item.chapter === chapterId);
  const status = examStatus(record, completed);
  const reward = getChapterExamReward(chapterId);

  return (
    <div>
      <PageHead caption={`Chapitre ${chapter.id} · ${chapter.level}`} title={`Examen : ${chapter.name}`}>
        {EXAM_QUESTION_COUNT} questions tirées des dix cours du chapitre, sans aide. Réussi à partir de{" "}
        {EXAM_PASS_COUNT} bonnes réponses. La première réussite rapporte + {reward.xp} XP et + {reward.gold} or ;
        ensuite tu peux le repasser pour améliorer ton score.
      </PageHead>

      <div className="eq-container eq-section">
        <div className="mx-auto max-w-3xl">
          {status === "locked" ? (
            <div className="eq-card p-6 space-y-3">
              <span className="eq-caption">Pas encore ouvert</span>
              <p className="eq-muted">
                L&apos;examen s&apos;ouvre quand les dix missions du chapitre sont validées sur la carte.
              </p>
              <div className="eq-home-actions pt-2">
                <Link href="/quest" className="eq-btn eq-btn-primary">
                  Retour à la carte
                </Link>
              </div>
            </div>
          ) : (
            <div>
              {record ? (
                <p className="eq-chip eq-chip-gold-soft mb-4 w-fit">
                  Meilleur score : {record.bestCorrect} / {record.total}
                  {record.passedAt ? " · réussi" : ""} · {record.attempts} tentative{record.attempts > 1 ? "s" : ""}
                </p>
              ) : null}
              <ChapterExam chapter={chapterId} chapterName={chapter.name} questions={buildChapterExam(chapterId)} alreadyPassed={status === "passed"} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
