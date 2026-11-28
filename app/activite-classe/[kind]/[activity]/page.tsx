import { isValidElement } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LiveActivityBridge } from "@/components/classes/live-activity-bridge";
import { LiveCourseActivity } from "@/components/classes/live-activity-course";
import { LiveGameActivity } from "@/components/classes/live-activity-game";
import { getCourseQuizPool } from "@/lib/courses/exercises-server";
import { lessons } from "@/lib/courses/lessons";
import { dialogueLineStarts, resolveAudioMap } from "@/lib/games/audio-manifest-server";
import { ECHO_SIGNAL_SCENARIOS } from "@/lib/games/echoSignal";
import { GAME_SESSION_SLUGS, isGameSessionSlug } from "@/lib/games/game-session-rules";
import { buildRushQueue } from "@/lib/games/grammar-rush-server";
import { SPELL_STRIKE_WORDS } from "@/lib/games/spellStrike";
import "./activity.css";

export const dynamic = "force-static";
export const dynamicParams = false;
export const metadata: Metadata = { title: "Activité de classe", robots: { index: false, follow: false } };

export function generateStaticParams() {
  return [
    ...GAME_SESSION_SLUGS.map(activity => ({ kind: "jeu", activity })),
    ...Object.keys(lessons).map(activity => ({ kind: "cours", activity })),
  ];
}

export default async function ClassActivityPage({ params }: { params: Promise<{ kind: string; activity: string }> }) {
  const { kind, activity } = await params;
  if (kind === "jeu" && isGameSessionSlug(activity)) {
    const questions = activity === "grammar-rush" ? buildRushQueue({ maxChapter: 2, focusCourseId: null }) : undefined;
    const audioMap = activity === "spell-strike"
      ? resolveAudioMap("spell-strike", SPELL_STRIKE_WORDS.flatMap(word => [word.id, `${word.id}-sentence`]))
      : activity === "echo-signal" ? resolveAudioMap("echo-signal", ECHO_SIGNAL_SCENARIOS.map(clip => clip.id)) : undefined;
    return <LiveActivityBridge path={`jeu/${activity}`}>
      <div className="eq-game-main eq-live-game-frame"><LiveGameActivity slug={activity} questions={questions}
        audioMap={audioMap} lineStarts={activity === "echo-signal" ? dialogueLineStarts : undefined} /></div>
    </LiveActivityBridge>;
  }
  const number = Number(activity);
  const lesson = lessons[number];
  if (kind !== "cours" || !lesson || String(number) !== activity) notFound();
  const quizSection = lesson.sections.find(section => /^quiz\b/i.test(section.title));
  const quiz = quizSection?.content;
  const original = isValidElement<{ questions?: { id: number; explanation?: string }[] }>(quiz) ? quiz.props.questions ?? [] : [];
  const explanations = new Map(original.map(item => [String(item.id), item.explanation]));
  const exercises = getCourseQuizPool(number).map(item => ({ ...item, explanation: item.explanation || explanations.get(item.id) || "" }));
  return <LiveActivityBridge path={`cours/${activity}`}>
    <LiveCourseActivity title={lesson.title} objective={lesson.objective} exercises={exercises}>
      {lesson.sections.filter(section => section !== quizSection).map((section, index) =>
        <details key={section.title} open={index === 0}>
          <summary>{section.title}</summary><div className="eq-prose">{section.content}</div>
        </details>
      )}
    </LiveCourseActivity>
  </LiveActivityBridge>;
}
