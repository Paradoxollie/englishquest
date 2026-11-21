import type { ExerciseAnswer } from "@/lib/courses/exercise-check";
import { isGameSessionSlug, type GameSessionSlug } from "@/lib/games/game-session-rules";

export type LiveRound =
  | { kind: "game"; slug: GameSessionSlug; durationSeconds: number }
  | { kind: "course"; courseId: number; durationSeconds: number };
export type LiveProgress = { score: number; answered: number; correct: number; courseId?: number; answers?: ExerciseAnswer[] };
export type LiveCommand =
  | { action: "prepare"; rounds: LiveRound[] }
  | { action: "start" | "stop"; sessionId: string }
  | { action: "pulse"; sessionId: string; roundIndex?: number; progress?: LiveProgress };
export type LiveSession = {
  id: string; rounds: LiveRound[]; createdAt: number; startsAt: number | null; endsAt: number | null; stoppedAt: number | null;
};
export type LivePerson = {
  name: string; rank: number | null; points: number; answered: number; correct: number; score: number;
  roundsPlayed: number; lastSeenAt: number; roundIndex: number | null; answers?: ExerciseAnswer[];
  results?: { index: number; answered: number; correct: number; score: number; points: number }[];
};
export type LiveHistory = { id: string; createdAt: number; startsAt: number | null; roundCount: number };
export type LiveMedalist = Pick<LivePerson, "name" | "rank" | "points">;
type LiveRoomState = {
  serverNow: number; classId: string; className: string; code: string | null;
  session: LiveSession | null; self: LivePerson | null; history: LiveHistory[];
};
export type TeacherLiveSnapshot = LiveRoomState & { teacher: true; people: LivePerson[] };
export type LiveSnapshot = TeacherLiveSnapshot | (LiveRoomState & { teacher: false; people: LiveMedalist[] });
type ClockPhase = "idle" | "lobby" | "countdown" | "round" | "finished";
export type LiveClock = { phase: ClockPhase; index: number; startsAt: number | null; endsAt: number | null };

export function liveClock(session: LiveSession | null, nowMs: number): LiveClock {
  if (!session) return { phase: "idle", index: -1, startsAt: null, endsAt: null };
  if (session.stoppedAt !== null && nowMs >= session.stoppedAt) {
    return { phase: "finished", index: -1, startsAt: session.stoppedAt, endsAt: null };
  }
  if (session.startsAt === null) return { phase: "lobby", index: -1, startsAt: null, endsAt: null };
  if (nowMs < session.startsAt) return { phase: "countdown", index: -1, startsAt: session.createdAt, endsAt: session.startsAt };
  let start = session.startsAt;
  for (const [index, round] of session.rounds.entries()) {
    const end = start + round.durationSeconds * 1000;
    if (nowMs < end) return { phase: "round", index, startsAt: start, endsAt: end };
    start = end;
  }
  return { phase: "finished", index: -1, startsAt: session.endsAt ?? start, endsAt: null };
}

export function validateLiveRounds(input: unknown): LiveRound[] | null {
  if (!Array.isArray(input) || input.length < 1 || input.length > 12) return null;
  const rounds: LiveRound[] = [];
  let total = 0;
  for (const item of input) {
    if (!item || !Number.isInteger(item.durationSeconds) || item.durationSeconds < 30 || item.durationSeconds > 1800) return null;
    const durationSeconds = item.durationSeconds as number;
    total += durationSeconds;
    if (item.kind === "game" && isGameSessionSlug(item.slug)) rounds.push({ kind: "game", slug: item.slug, durationSeconds });
    else if (item.kind === "course" && Number.isInteger(item.courseId) && item.courseId >= 1 && item.courseId <= 50) {
      rounds.push({ kind: "course", courseId: item.courseId, durationSeconds });
    } else return null;
  }
  return total <= 10_800 ? rounds : null;
}
