import type { LiveProgress, LiveRound } from "@/lib/classes/live-shared";

export type StoredRound = { progress: LiveProgress; pending: boolean };

export const EMPTY_PROGRESS: LiveProgress = { score: 0, answered: 0, correct: 0 };

function count(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

/** All checkpoints are cumulative. Replaying one must never add it a second time. */
export function mergeProgress(previous: LiveProgress, next: LiveProgress, round: LiveRound): LiveProgress {
  const progress: LiveProgress = {
    score: Math.max(count(previous.score), count(next.score)),
    answered: Math.max(count(previous.answered), count(next.answered)),
    correct: Math.max(count(previous.correct), count(next.correct)),
  };
  if (round.kind === "course") {
    const answers = new Map((previous.answers ?? []).map((answer) => [answer.id, answer]));
    for (const answer of next.answers ?? []) if (!answers.has(answer.id)) answers.set(answer.id, answer);
    progress.courseId = round.courseId;
    progress.answers = Array.from(answers.values());
  }
  return progress;
}

export function progressKey(playerId: string, sessionId: string, index: number): string {
  return `eq.live.v1.${playerId}.${sessionId}.${index}`;
}

export function readStoredRound(key: string): StoredRound {
  try {
    const raw = window.sessionStorage.getItem(key);
    if (raw) {
      const entry = JSON.parse(raw) as StoredRound;
      if (entry.progress && Number.isFinite(entry.progress.score) &&
          Array.isArray(entry.progress.answers ?? []) && typeof entry.pending === "boolean") return entry;
    }
  } catch {
    // Storage may be unavailable in private browsing. The connection also keeps a memory copy.
  }
  return { progress: EMPTY_PROGRESS, pending: false };
}

export function writeStoredRound(key: string, entry: StoredRound) {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // The server checkpoint and the in-memory copy continue to work.
  }
}
