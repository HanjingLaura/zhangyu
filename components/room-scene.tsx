import type { ReactNode } from "react";
import type { Danmaku } from "@/lib/types";
import { seatLayout } from "@/lib/seats";
import { colorFor } from "./avatar";
import { OctopusFigure } from "./octopus";
import { rotateSeats, Seat, type SeatPerson } from "./seat";

export function DanmakuLayer({ items }: { items: Danmaku[] }) {
  const recent = items.slice(-12);
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[1%] z-[22] h-[15%] overflow-hidden">
      {recent.map((item, index) => (
        <div
          key={item.id}
          className="danmaku-item"
          style={{ top: `${(index * 22) % 78}%`, color: colorFor(item.userId) }}
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
  speeches,
  danmaku = [],
  overlay,
}: {
  people?: SeatPerson[];
  youId?: string;
  currentId?: string;
  finished?: boolean;
  bubble?: string;
  speeches?: Map<string, string>;
  danmaku?: Danmaku[];
  overlay?: ReactNode;
}) {
  const seated = rotateSeats(people, youId);

  return (
    <div className="relative z-[1] min-h-0 flex-1">
      {overlay ? (
        <div className="absolute left-1/2 top-[2%] z-[20] w-[90%] max-w-[360px] -translate-x-1/2">{overlay}</div>
      ) : null}
      <div className="absolute left-[50%] top-[54%] z-[8] w-[20%] -translate-x-1/2 -translate-y-full">
        <div className="relative">
          {bubble ? (
            <div className="bubble absolute bottom-[96%] left-[72%] z-10 w-max max-w-[9.5rem] -translate-x-1/2 text-center">
              {bubble}
            </div>
          ) : null}
          <OctopusFigure className="w-full drop-shadow-[0_10px_8px_rgba(0,20,28,0.35)]" />
        </div>
      </div>
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
              speech={speeches?.get(person.id)}
            />
          </div>
        );
      })}
      <DanmakuLayer items={danmaku} />
    </div>
  );
}
