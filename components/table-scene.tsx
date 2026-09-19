import type { ReactNode } from "react";
import type { Danmaku } from "@/lib/types";
import { SEAT_COLORS } from "./avatar";
import { rotateSeats, Seat, seatStyle, type SeatPerson } from "./seat";

export function DanmakuLayer({ items }: { items: Danmaku[] }) {
  const recent = items.slice(-12);
  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {recent.map((item, index) => {
        const color =
          SEAT_COLORS[[...item.userId].reduce((sum, char) => sum + char.charCodeAt(0), 0) % SEAT_COLORS.length];
        return (
          <div
            key={item.id}
            className="danmaku-item absolute left-full text-[13px] font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]"
            style={{
              top: `${10 + ((index * 12) % 70)}%`,
              color,
            }}
          >
            {item.name}：{item.text}
          </div>
        );
      })}
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
