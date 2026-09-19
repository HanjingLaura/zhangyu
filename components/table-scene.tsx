import type { ReactNode } from "react";
import type { Danmaku } from "@/lib/types";
import { rotateSeats, Seat, seatStyle, type SeatPerson } from "./seat";

export function DanmakuLayer({ items }: { items: Danmaku[] }) {
  const recent = items.slice(-10);
  return (
    <div className="pointer-events-none absolute inset-[8%] overflow-hidden rounded-full">
      {recent.map((item, index) => (
        <div
          key={item.id}
          className="danmaku-item absolute text-[12px] text-[#fff4d2] drop-shadow-[0_1px_2px_rgba(0,0,0,0.65)]"
          style={{
            top: `${12 + ((index * 13) % 68)}%`,
            animationDelay: `${(item.at % 400) / 1000}s`,
          }}
        >
          {item.name}：{item.text}
        </div>
      ))}
    </div>
  );
}

export function TableScene({
  people,
  youId,
  currentId,
  finished = false,
  kingId,
  winnerId,
  danmaku = [],
  children,
}: {
  people: SeatPerson[];
  youId?: string;
  currentId?: string;
  finished?: boolean;
  kingId?: string;
  winnerId?: string;
  danmaku?: Danmaku[];
  children: ReactNode;
}) {
  const seated = rotateSeats(people, youId);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[340px]">
      <div className="lamp-glow absolute inset-[18%] rounded-full" />
      <div className="wood-table absolute inset-[14%] flex flex-col items-center justify-center rounded-full px-6">
        {children}
      </div>
      <DanmakuLayer items={danmaku} />
      {seated.map((person, index) => (
        <div
          key={person.id}
          className="absolute z-10"
          style={seatStyle(index, seated.length)}
        >
          <Seat
            person={person}
            active={!finished && currentId === person.id}
            settled={finished}
            king={finished && kingId === person.id}
            winner={finished && winnerId === person.id}
          />
        </div>
      ))}
    </div>
  );
}
