export const MAX_PLAYERS = 6;
export const ROUND_OPTIONS = [20, 50, 100] as const;

const MARGIN = [0, 50, 22, 16, 13, 12, 12];
const SCALE = [1, 0.95, 0.92, 0.84, 0.74, 0.64, 0.56];

export function seatLayout(index: number, total: number) {
  const count = Math.min(MAX_PLAYERS, Math.max(total, 1));
  const margin = MARGIN[count] ?? 10;
  const usable = 100 - margin * 2;
  const left = count === 1 ? 50 : margin + (usable / (count - 1)) * index;
  const bow = count <= 2 ? 0 : Math.sin((index / Math.max(count - 1, 1)) * Math.PI) * 2.4;
  return {
    left,
    top: 84 + bow,
    zIndex: 20 + index,
    scale: SCALE[count] ?? 0.56,
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
