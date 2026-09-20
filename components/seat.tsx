import type { Player } from "@/lib/types";
import { Avatar } from "./avatar";

export type SeatPerson = {
  id: string;
  name: string;
  avatarUrl?: string;
  player?: Player;
};

export function rotateSeats<T extends { id: string }>(people: T[], youId?: string) {
  const index = youId ? people.findIndex((person) => person.id === youId) : 0;
  if (index <= 0) return people;
  return [...people.slice(index), ...people.slice(0, index)];
}

export function Seat({
  person,
  active = false,
  settled = false,
  you = false,
}: {
  person: SeatPerson;
  active?: boolean;
  settled?: boolean;
  you?: boolean;
}) {
  const player = person.player;
  return (
    <div className="flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
      <div className={`rounded-full ${active ? "seat-glow" : "ring-2 ring-[#16343c]"}`}>
        <Avatar name={person.name} src={person.avatarUrl} size={54} />
      </div>
      <div className="mt-1.5 max-w-[5.4rem] truncate rounded-full bg-black/70 px-2.5 py-0.5 text-[11px] text-foam">
        {you ? "我" : person.name}
      </div>
      {player ? (
        <div className="mt-0.5 text-[11px] text-gold">
          {settled ? `${player.culture} 分` : player.culture}
        </div>
      ) : null}
    </div>
  );
}
