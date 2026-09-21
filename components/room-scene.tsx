import type { ReactNode } from "react";
import type { Danmaku } from "@/lib/types";
import { seatLayout } from "@/lib/seats";
import { colorFor } from "./avatar";
import { OctopusFigure } from "./octopus";
import { rotateSeats, Seat, type SeatPerson } from "./seat";

export function DanmakuLayer({ items }: { items: Danmaku[] }) {
  const recent = items.slice(-12);
  return (
    <div className="pointer-events-none absolute inset-x-0 top-[2%] z-[5] h-[28%] overflow-hidden">
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

export function RoomScene({
  people = [],
  youId,
  currentId,
  finished = false,
  bubble,
  danmaku = [],
  overlay,
}: {
  people?: SeatPerson[];
  youId?: string;
  currentId?: string;
  finished?: boolean;
  bubble?: string;
  danmaku?: Danmaku[];
  overlay?: ReactNode;
}) {
  const seated = rotateSeats(people, youId);

  return (
    <div className="relative z-[1] min-h-0 flex-1">
      <DanmakuLayer items={danmaku} />
      {overlay ? (
        <div className="absolute left-1/2 top-[5%] z-[20] w-[88%] max-w-[340px] -translate-x-1/2">{overlay}</div>
      ) : null}
      <div className="absolute left-1/2 top-[46%] z-[8] w-[18%] -translate-x-1/2">
        <OctopusFigure className="w-full drop-shadow-[0_10px_8px_rgba(0,20,28,0.35)]" />
      </div>
      {bubble ? (
        <div className="bubble bubble-left absolute left-[64%] top-[48%] z-[9] w-max max-w-[30%]">
          {bubble}
        </div>
      ) : null}
      {seated.map((person, index) => {
        const place = seatLayout(index, seated.length);
        return (
          <div
            key={person.id}
            className="absolute"
            style={{
              left: `${place.left}%`,
              top: `${place.top}%`,
              zIndex: place.zIndex,
            }}
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
  );
}
