import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
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
    redirect("/auth/login");
  }

  const chapter = getChapter(chapterId);
  const [completed, records] = await Promise.all([isChapterCompleted(user.id, chapterId), getUserChapterExams(user.id)]);
  const record = records.find((item) => item.chapter === chapterId);
  const status = examStatus(record, completed);
  const reward = getChapterExamReward(chapterId);

  return (
    <div className="eq-container eq-section">
      <div className="mx-auto max-w-3xl">
        <p className="eq-kicker">
          Chapitre {chapter.id} · {chapter.level}
        </p>
        <h1 className="eq-h1">Examen : {chapter.name}</h1>
        <p className="eq-lead mt-4 max-w-none">
          {EXAM_QUESTION_COUNT} questions tirées des dix cours du chapitre, sans aide. Réussi à partir de {EXAM_PASS_COUNT}{" "}
          bonnes réponses. La première réussite rapporte + {reward.xp} XP et + {reward.gold} or ; ensuite tu peux le
          repasser pour améliorer ton score.
        </p>

        {status === "locked" ? (
          <div className="eq-card mt-8">
            <p className="eq-kicker">Pas encore ouvert</p>
            <p className="mt-2 text-[var(--muted)]">
              L&apos;examen s&apos;ouvre quand les dix missions du chapitre sont validées sur la carte.
            </p>
            <div className="eq-home-actions mt-4">
              <Link href="/quest" className="eq-btn eq-btn-primary">
                Retour à la carte
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8">
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
  );
}
