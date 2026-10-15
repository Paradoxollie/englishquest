"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  recordCourseCheckpointAction,
  startCourseAction,
  submitCourseQuizAction,
} from "@/app/cours/actions";
import type { CourseMissionState } from "@/lib/courses/mission-state";
import type { CourseQuizAnswer } from "@/lib/courses/quiz-grading";
import type { ExerciseItem } from "@/lib/courses/exercise-check";
import { dispatchReward } from "@/lib/profile/reward-events";

function isPerfectQuiz(state: CourseMissionState | null | undefined) {
  return Boolean(state && state.quizTotal && state.quizScore != null && state.quizScore >= state.quizTotal);
}

type CourseMissionContextValue = {
  courseNumber: number;
  isAuthenticated: boolean;
  isMissionTrackingEnabled: boolean;
  missionState: CourseMissionState | null;
  isSyncing: boolean;
  markReadingCheckpoint: () => Promise<void>;
  submitQuizResult: (answers: CourseQuizAnswer[]) => Promise<QuizSubmissionOutcome | null>;
  /** Exercices supplémentaires du cours, mêlés aux questions du quiz. */
  extraExercises: ExerciseItem[];
};

export type QuizSubmissionOutcome = {
  missionState: CourseMissionState;
  courseCompleted: { xp: number; gold: number; newLevel: number | null } | null;
};

const CourseMissionContext = createContext<CourseMissionContextValue | null>(null);

type CourseMissionProviderProps = {
  courseNumber: number;
  isAuthenticated: boolean;
  isMissionTrackingEnabled: boolean;
  initialMissionState: CourseMissionState | null;
  /** Lance la mission automatiquement à l'ouverture (cours débloqué, pas encore lancé). */
  autoLaunch?: boolean;
  extraExercises?: ExerciseItem[];
  children: ReactNode;
};

export function CourseMissionProvider({
  courseNumber,
  isAuthenticated,
  isMissionTrackingEnabled,
  initialMissionState,
  autoLaunch = false,
  extraExercises = [],
  children,
}: CourseMissionProviderProps) {
  const router = useRouter();
  const [missionState, setMissionState] = useState<CourseMissionState | null>(initialMissionState);
  const [isSyncing, setIsSyncing] = useState(false);
  const checkpointPromiseRef = useRef<Promise<void> | null>(null);
  const autoLaunchRef = useRef(false);

  useEffect(() => {
    if (!autoLaunch || !isAuthenticated || autoLaunchRef.current) {
      return;
    }
    autoLaunchRef.current = true;
    const formData = new FormData();
    formData.set("courseNumber", String(courseNumber));
    void startCourseAction(formData).then(() => router.refresh());
  }, [autoLaunch, isAuthenticated, courseNumber, router]);

  useEffect(() => {
    setMissionState(initialMissionState);
  }, [initialMissionState]);

  async function markReadingCheckpoint() {
    if (!isAuthenticated || !isMissionTrackingEnabled || missionState?.readingCheckpointReached) {
      return;
    }

    if (checkpointPromiseRef.current) {
      return checkpointPromiseRef.current;
    }

    const pending = (async () => {
      setIsSyncing(true);

      try {
        const result = await recordCourseCheckpointAction(courseNumber);

        if (result?.success && result.missionState) {
          setMissionState(result.missionState);
        }
      } finally {
        setIsSyncing(false);
        checkpointPromiseRef.current = null;
      }
    })();

    checkpointPromiseRef.current = pending;
    return pending;
  }

  async function submitQuizResult(answers: CourseQuizAnswer[]) {
    if (!isAuthenticated || !isMissionTrackingEnabled) {
      return null;
    }

    setIsSyncing(true);

    try {
      const result = await submitCourseQuizAction({
        courseNumber,
        answers,
      });

      if (result?.success && result.missionState) {
        const newBadges = result.newBadges ?? [];
        // Étoile du quiz parfait : 10 sur 10 pour la première fois sur ce cours.
        const perfectStar = isPerfectQuiz(result.missionState) && !isPerfectQuiz(missionState) ? 1 : 0;
        // Mission validée, badge ou étoile gagnés au passage : célébration globale.
        if (result.courseCompleted || newBadges.length > 0 || perfectStar > 0) {
          dispatchReward({
            xp: result.courseCompleted?.xp ?? 0,
            gold: result.courseCompleted?.gold ?? 0,
            newLevel: result.courseCompleted?.newLevel ?? null,
            badges: newBadges,
            stars: (result.courseCompleted ? 1 : 0) + perfectStar,
            label: result.courseCompleted ? `Mission ${courseNumber} validée` : undefined,
          });
        }
        setMissionState(result.missionState);
        router.refresh();
        return {
          missionState: result.missionState,
          courseCompleted: result.courseCompleted ?? null,
        };
      }

      return null;
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <CourseMissionContext.Provider
      value={{
        courseNumber,
        isAuthenticated,
        isMissionTrackingEnabled,
        missionState,
        isSyncing,
        markReadingCheckpoint,
        submitQuizResult,
        extraExercises,
      }}
    >
      {children}
    </CourseMissionContext.Provider>
  );
}

export function useCourseMission() {
  return useContext(CourseMissionContext);
}
