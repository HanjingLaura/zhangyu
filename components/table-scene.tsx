import Image from "next/image";
import type { ReactNode } from "react";
import type { Danmaku } from "@/lib/types";
import { colorFor } from "./avatar";
import { OctopusFigure } from "./octopus";
import { rotateSeats, Seat, type SeatPerson } from "./seat";

const TABLE = { cx: 50, cy: 50, rx: 46, ry: 46 };

function seatAt(index: number, total: number) {
  const angle = ((90 + (360 / Math.max(total, 1)) * index) * Math.PI) / 180;
  return {
    left: `${TABLE.cx + TABLE.rx * Math.cos(angle)}%`,
    top: `${TABLE.cy + TABLE.ry * Math.sin(angle)}%`,
  };
}

export function DanmakuLayer({ items }: { items: Danmaku[] }) {
  const recent = items.slice(-12);
  return (
    <div className="pointer-events-none absolute inset-x-0 top-[4%] z-[5] h-[40%] overflow-hidden">
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
    <div className="relative z-[1] flex min-h-0 flex-1 items-end justify-center px-3 pb-1">
      <div className="relative aspect-square w-[78%] max-w-[320px]">
        <Image
          src="/table.webp"
          alt=""
          fill
          priority
          sizes="(max-width: 480px) 100vw, 440px"
          className="select-none object-contain"
        />
        <DanmakuLayer items={danmaku} />

        <div className="absolute left-1/2 top-[8%] z-[6] w-[34%] -translate-x-1/2">
          <OctopusFigure className="w-full drop-shadow-[0_16px_14px_rgba(0,20,28,0.45)]" />
        </div>
        {bubble ? (
          <div className="bubble bubble-left absolute left-[68%] top-[16%] z-[7] w-max max-w-[30%]">
            {bubble}
          </div>
        ) : null}

        {children ? (
          <div className="absolute left-1/2 top-[62%] z-[6] -translate-x-1/2 -translate-y-1/2">
            {children}
          </div>
        ) : null}

        {seated.map((person, index) => (
          <div key={person.id} className="absolute z-10" style={seatAt(index, seated.length)}>
            <Seat
              person={person}
              active={!finished && currentId === person.id}
              settled={finished}
              you={person.id === youId}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
