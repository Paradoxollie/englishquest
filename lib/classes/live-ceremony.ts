import type { LiveSession } from "./live-shared";

export const CEREMONY_SETTLE_MS = 8_000;
export const CEREMONY_INTRO_MS = 1_800;
export const CEREMONY_REVEAL_MS = 2_400;
export const CEREMONY_WINNER_MS = 4_200;

export type CeremonyStep = {
  phase: "settling" | "intro" | "reveal" | "complete";
  revealed: number[];
  spotlight: number | null;
  startsAt: number;
  endsAt: number;
  stepStartedAt: number;
};

/** Le projecteur et les téléphones retrouvent la même place, même après un rechargement. */
export function ceremonyStep(session: LiveSession, nowMs: number, ranks: readonly number[]): CeremonyStep {
  const finish = session.stoppedAt ?? session.endsAt ?? session.createdAt;
  const started = session.startsAt !== null && session.startsAt <= finish;
  const startsAt = finish + (started ? CEREMONY_SETTLE_MS : 0);
  const places = [3, 2, 1].filter((rank) => ranks.includes(rank));
  const duration = (place: number) => place === 1 ? CEREMONY_WINNER_MS : CEREMONY_REVEAL_MS;
  const endsAt = startsAt + (started && places.length ? CEREMONY_INTRO_MS + places.reduce((sum, place) => sum + duration(place), 0) : 0);
  const base = { startsAt, endsAt, spotlight: null };
  if (nowMs < startsAt) return { ...base, phase: "settling", revealed: [], stepStartedAt: finish };
  if (!started || places.length === 0) return { ...base, phase: "complete", revealed: [], stepStartedAt: startsAt };
  let next = startsAt + CEREMONY_INTRO_MS;
  if (nowMs < next) return { ...base, phase: "intro", revealed: [], stepStartedAt: startsAt };
  const revealed: number[] = [];
  for (const place of places) {
    revealed.push(place);
    const stepStartedAt = next;
    next += duration(place);
    if (nowMs < next) return { ...base, phase: "reveal", revealed, spotlight: place, stepStartedAt };
  }
  return { ...base, phase: "complete", revealed, stepStartedAt: endsAt };
}
