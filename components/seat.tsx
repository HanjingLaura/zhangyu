import type { Player } from "@/lib/types";
import { Avatar } from "./avatar";

export type SeatPerson = {
  id: string;
  name: string;
  avatarUrl?: string;
  empty?: boolean;
  player?: Player;
};

export type SeatSide = "south" | "north" | "west" | "east";

export function rotateSeats<T extends { id: string }>(people: T[], youId?: string) {
  const index = youId ? people.findIndex((person) => person.id === youId) : 0;
  if (index <= 0) return people;
  return [...people.slice(index), ...people.slice(0, index)];
}

export function seatStyle(index: number, total: number) {
  const angle = ((90 + (360 / Math.max(total, 1)) * index) * Math.PI) / 180;
  const radius = 46;
  return {
    left: `${50 + radius * Math.cos(angle)}%`,
    top: `${50 + radius * Math.sin(angle)}%`,
  };
}

export function Seat({
  person,
  active = false,
  settled = false,
  king = false,
  winner = false,
}: {
  person: SeatPerson;
  active?: boolean;
  settled?: boolean;
  king?: boolean;
  winner?: boolean;
}) {
  const empty = Boolean(person.empty);
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 text-center">
      <div
        className={`rounded-full p-0.5 ${
          active ? "bg-gold shadow-[0_0_18px_rgba(230,195,122,0.45)]" : "bg-transparent"
        }`}
      >
        <Avatar
          name={person.name}
          src={person.avatarUrl}
          empty={empty}
          size={46}
          ring={active}
        />
      </div>
      <div
        className={`mx-auto mt-1 max-w-[4.6rem] truncate rounded-full px-2 py-0.5 text-[10px] ${
          empty ? "bg-black/20 text-white/30" : "bg-[#2a160e]/80 text-[#f6efe2]"
        }`}
      >
        {empty ? "虚位" : person.name}
      </div>
      {person.player && !empty ? (
        settled ? (
          <div className="mt-0.5 text-[10px] text-gold">
            {person.player.culture} 分
            {king ? " · 丈育" : ""}
            {winner ? " · 最高" : ""}
          </div>
        ) : (
          <div className="mt-0.5 text-[10px] text-white/45">
            {person.player.culture}/{person.player.zhangyu}
          </div>
        )
      ) : null}
    </div>
  );
}
