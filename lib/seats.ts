export const MAX_PLAYERS = 6;
export const ROUND_OPTIONS = [20, 50, 100] as const;

const SCALE = [1, 0.95, 0.92, 0.84, 0.74, 0.64, 0.56];

export function seatLayout(index: number, total: number) {
  const count = Math.min(MAX_PLAYERS, Math.max(total, 1));
  const scale = SCALE[count] ?? 0.56;

  if (count <= 2) {
    const left = count === 1 ? 22 : index === 0 ? 22 : 78;
    return { left, top: 70, zIndex: 20 + index, scale };
  }

  const leftCount = Math.floor(count / 2);
  const onLeft = index < leftCount;
  const sideIndex = onLeft ? index : index - leftCount;
  const sideCount = onLeft ? leftCount : count - leftCount;
  const pad = count >= 5 ? 9 : 11;
  const gap = count >= 5 ? 22 : 28;
  const span = 50 - gap / 2 - pad;
  const start = onLeft ? pad : 50 + gap / 2;
  const left =
    sideCount === 1
      ? start + span * (onLeft ? 0.32 : 0.68)
      : start + (span / (sideCount - 1)) * sideIndex;
  const bow = Math.sin((index / Math.max(count - 1, 1)) * Math.PI) * 1.2;

  return {
    left,
    top: 71 + bow,
    zIndex: 20 + index,
    scale,
  };
}

export function modeLabel(mode?: string) {
  if (mode === "pinyin") return "音接音";
  if (mode === "english") return "英文";
  return "字接字";
}

export function parseRoomOptions(body: { mode?: string; maxRounds?: number; buzz?: boolean }) {
  return {
    mode:
      body.mode === "pinyin" || body.mode === "english"
        ? body.mode
        : ("char" as const),
    maxRounds: ROUND_OPTIONS.includes(body.maxRounds as (typeof ROUND_OPTIONS)[number])
      ? (body.maxRounds as (typeof ROUND_OPTIONS)[number])
      : 100,
    buzz: body.buzz === true,
  };
}
