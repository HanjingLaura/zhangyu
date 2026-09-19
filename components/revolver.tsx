import type { SeatSide } from "./seat";

const ROTATE: Record<SeatSide, string> = {
  south: "rotate-180",
  north: "rotate-0",
  west: "-rotate-90",
  east: "rotate-90",
};

export function Revolver({
  side,
  firing = false,
  large = false,
}: {
  side: SeatSide;
  firing?: boolean;
  large?: boolean;
}) {
  const width = large ? 132 : 96;
  return (
    <div
      className={`pointer-events-none ${
        large
          ? "relative"
          : "absolute left-1/2 top-[42%] z-20 -translate-x-1/2 -translate-y-1/2"
      }`}
      aria-hidden="true"
    >
      <div className={`${ROTATE[side]} ${firing ? "revolver-kick" : ""}`}>
        <svg width={width} height={width} viewBox="0 0 120 120" fill="none">
          <path
            d="M58 18c12 0 22 9 22 20 0 8-5 14-11 17v8h-6l-3 18h-4l-3-18h-6V55c-6-3-11-9-11-17 0-11 10-20 22-20Z"
            fill="#d8c4a0"
            stroke="#1c120c"
            strokeWidth="3"
          />
          <circle cx="58" cy="38" r="12" fill="#1a120c" />
          <circle cx="58" cy="38" r="5" fill="#c9a44a" />
          <rect x="53" y="63" width="10" height="28" rx="2" fill="#24160f" />
          <path d="M48 90h20l4 10H44l4-10Z" fill="#3b2618" />
          <path d="M54 18h8v-8h-8z" fill="#24160f" />
        </svg>
      </div>
    </div>
  );
}

export function currentSeatSide(index: number, count: number): SeatSide {
  if (count === 2) return index === 0 ? "south" : "north";
  if (count === 3) {
    if (index === 0) return "south";
    if (index === 1) return "west";
    return "east";
  }
  if (index === 0) return "south";
  if (index === 1) return "west";
  if (index === 2) return "north";
  return "east";
}
