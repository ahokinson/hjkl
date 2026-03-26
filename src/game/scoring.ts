export const FULL_SCORE_MS = 5000;
export const DECAY_MS = 10000;
const MAX_POINTS = 100;
const MAX_STREAK_BONUS = 4;
const STREAK_CURVE = 4;

export function streakMultiplier(streak: number): number {
  return 1 + MAX_STREAK_BONUS * (1 - Math.exp(-streak / STREAK_CURVE));
}

export function calculateScore(elapsedMs: number, streak: number): number {
  const points =
    elapsedMs <= FULL_SCORE_MS
      ? MAX_POINTS
      : elapsedMs <= FULL_SCORE_MS + DECAY_MS
        ? Math.floor(MAX_POINTS * (1 - (elapsedMs - FULL_SCORE_MS) / DECAY_MS))
        : 0;

  return Math.floor(points * streakMultiplier(streak));
}
