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
  submitCourseQuizAction,
} from "@/app/cours/actions";
import type { CourseMissionState } from "@/lib/courses/mission-state";

type CourseMissionContextValue = {
  courseNumber: number;
  isAuthenticated: boolean;
  isMissionTrackingEnabled: boolean;
  missionState: CourseMissionState | null;
  isSyncing: boolean;
  markReadingCheckpoint: () => Promise<void>;
  submitQuizResult: (score: number, total: number) => Promise<CourseMissionState | null>;
};

const CourseMissionContext = createContext<CourseMissionContextValue | null>(null);

type CourseMissionProviderProps = {
  courseNumber: number;
  isAuthenticated: boolean;
  isMissionTrackingEnabled: boolean;
  initialMissionState: CourseMissionState | null;
  children: ReactNode;
};

export function CourseMissionProvider({
  courseNumber,
  isAuthenticated,
  isMissionTrackingEnabled,
  initialMissionState,
  children,
}: CourseMissionProviderProps) {
  const router = useRouter();
  const [missionState, setMissionState] = useState<CourseMissionState | null>(initialMissionState);
  const [isSyncing, setIsSyncing] = useState(false);
  const checkpointPromiseRef = useRef<Promise<void> | null>(null);

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

  async function submitQuizResult(score: number, total: number) {
    if (!isAuthenticated || !isMissionTrackingEnabled) {
      return null;
    }

    setIsSyncing(true);

    try {
      const result = await submitCourseQuizAction({
        courseNumber,
        score,
        total,
      });

      if (result?.success && result.missionState) {
        setMissionState(result.missionState);
        router.refresh();
        return result.missionState;
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
      }}
    >
      {children}
    </CourseMissionContext.Provider>
  );
}

export function useCourseMission() {
  return useContext(CourseMissionContext);
}
