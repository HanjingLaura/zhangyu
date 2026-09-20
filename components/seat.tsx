import type { Player } from "@/lib/types";
import { Figure } from "./figure";

export type SeatPerson = {
  id: string;
  name: string;
  avatarUrl?: string;
  outfit?: string;
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
  scale = 1,
}: {
  person: SeatPerson;
  active?: boolean;
  settled?: boolean;
  you?: boolean;
  scale?: number;
}) {
  const player = person.player;
  const suited = Boolean(person.outfit && person.outfit !== "plain");
  return (
    <div
      className="flex flex-col items-center"
      style={{ transform: `translate(-50%, -78%) scale(${scale})` }}
    >
      <div className={active ? "drop-shadow-[0_0_14px_#6ec8c0]" : "drop-shadow-[0_10px_10px_rgba(0,20,28,0.35)]"}>
        <Figure name={person.name} src={person.avatarUrl} outfitId={person.outfit} size={suited ? 132 : 72} />
      </div>
      <div className="mt-0.5 max-w-[5.6rem] truncate rounded-full bg-black/70 px-2.5 py-0.5 text-[11px] text-foam">
        {you ? "我" : person.name}
      </div>
      {player ? (
        <div className="text-[11px] text-gold">{settled ? `${player.culture} 分` : player.culture}</div>
      ) : null}
    </div>
  );
}
