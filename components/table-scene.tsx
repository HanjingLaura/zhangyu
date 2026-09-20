import type { ReactNode } from "react";
import type { Danmaku } from "@/lib/types";
import { colorFor } from "./avatar";
import { OctopusFigure } from "./octopus";
import { rotateSeats, Seat, type SeatPerson } from "./seat";

const RING = { cx: 50, cy: 68, rx: 46, ry: 16 };

function seatAt(index: number, total: number) {
  const angle = ((90 + (360 / Math.max(total, 1)) * index) * Math.PI) / 180;
  const depth = Math.sin(angle);
  return {
    left: `${RING.cx + RING.rx * Math.cos(angle)}%`,
    top: `${RING.cy + RING.ry * Math.sin(angle)}%`,
    zIndex: Math.round(16 + depth * 10),
    scale: 0.72 + 0.28 * ((depth + 1) / 2),
  };
}

export function DanmakuLayer({ items }: { items: Danmaku[] }) {
  const recent = items.slice(-12);
  return (
    <div className="pointer-events-none absolute inset-x-0 top-[2%] z-[5] h-[36%] overflow-hidden">
      {recent.map((item, index) => (
        <div
          key={item.id}
          className="danmaku-item"
          style={{ top: `${(index * 17) % 85}%`, color: colorFor(item.userId) }}
        >
          {item.name}：{item.text}
        </div>
      ))}
    </div>
  );
}

function IsoTable({ children }: { children?: ReactNode }) {
  return (
    <div className="iso-table">
      <div className="iso-table-shadow" />
      <div className="iso-table-body" />
      <div className="iso-table-top">{children}</div>
    </div>
  );
}

export function TableScene({
  people = [],
  youId,
  currentId,
  finished = false,
  bubble,
  danmaku = [],
  children,
}: {
  people?: SeatPerson[];
  youId?: string;
  currentId?: string;
  finished?: boolean;
  bubble?: string;
  danmaku?: Danmaku[];
  children?: ReactNode;
}) {
  const seated = rotateSeats(people, youId);

  return (
    <div className="relative z-[1] flex min-h-0 flex-1 items-end justify-center px-1 pb-1">
      <div className="relative aspect-[4/5] w-full max-w-[420px]">
        <div className="absolute left-1/2 top-[18%] z-[8] w-[26%] -translate-x-1/2">
          <OctopusFigure className="w-full drop-shadow-[0_10px_8px_rgba(0,20,28,0.35)]" />
        </div>
        {bubble ? (
          <div className="bubble bubble-left absolute left-[64%] top-[16%] z-[9] w-max max-w-[32%]">
            {bubble}
          </div>
        ) : null}
        <IsoTable>{children}</IsoTable>
        <DanmakuLayer items={danmaku} />
        {seated.map((person, index) => {
          const place = seatAt(index, seated.length);
          return (
            <div
              key={person.id}
              className="absolute"
              style={{ left: place.left, top: place.top, zIndex: place.zIndex }}
            >
              <Seat
                person={person}
                active={!finished && currentId === person.id}
                settled={finished}
                you={person.id === youId}
                scale={place.scale}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
