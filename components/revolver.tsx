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
}: {
  side: SeatSide;
  firing?: boolean;
}) {
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-[46%] z-20 -translate-x-1/2 -translate-y-1/2"
      aria-hidden="true"
    >
      <div className={`${ROTATE[side]} ${firing ? "revolver-kick" : ""}`}>
        <svg width="72" height="72" viewBox="0 0 78 78" fill="none">
          <path
            d="M39 14c8 0 14 6 14 13 0 5-3 9-7 11v6h-4l-2 12h-2l-2-12h-4v-6c-4-2-7-6-7-11 0-7 6-13 14-13Z"
            fill="#d7c4a1"
            stroke="#2a1c12"
            strokeWidth="2"
          />
          <circle cx="39" cy="27" r="7" fill="#1a120c" />
          <circle cx="39" cy="27" r="3.2" fill="#c9a44a" />
          <rect x="36" y="44" width="6" height="18" rx="1.5" fill="#2a1c12" />
          <path d="M33 61h12l2 5H31l2-5Z" fill="#3c2a1c" />
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
