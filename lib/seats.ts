export const MAX_PLAYERS = 6;
export const ROUND_OPTIONS = [20, 50, 100] as const;

const SPAN = [0, 0, 72, 108, 132, 150, 168];

export function seatLayout(index: number, total: number) {
  const count = Math.min(MAX_PLAYERS, Math.max(total, 1));
  const span = SPAN[count] ?? 168;
  const start = 90 - span / 2;
  const angleDeg = start + (count === 1 ? 0 : (span / (count - 1)) * index);
  const angle = (angleDeg * Math.PI) / 180;
  const depth = Math.sin(angle);
  return {
    left: 50 + 44 * Math.cos(angle),
    top: 90 + 8 * Math.sin(angle),
    zIndex: Math.round(20 + depth * 12),
    scale: Math.max(0.62, 0.96 - 0.06 * Math.max(0, count - 2)),
  };
}

export function parseRoomOptions(body: { mode?: string; maxRounds?: number }) {
  return {
    mode: body.mode === "pinyin" ? ("pinyin" as const) : ("char" as const),
    maxRounds: ROUND_OPTIONS.includes(body.maxRounds as (typeof ROUND_OPTIONS)[number])
      ? (body.maxRounds as (typeof ROUND_OPTIONS)[number])
      : 100,
  };
}
