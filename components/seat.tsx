import type { Player } from "@/lib/types";
import { TentacleDots } from "./octopus";

export const SEAT_COLORS = ["#ff6a4d", "#3cb7a4", "#f3c15d", "#c084fc"];

export type SeatSide = "south" | "north" | "west" | "east";

export function assignSeats(players: Player[]) {
  const seats: Partial<Record<SeatSide, Player>> = {};
  if (players[0]) seats.south = players[0];
  if (players.length === 2 && players[1]) seats.north = players[1];
  if (players.length === 3) {
    seats.west = players[1];
    seats.east = players[2];
  }
  if (players.length >= 4) {
    seats.west = players[1];
    seats.north = players[2];
    seats.east = players[3];
  }
  return seats;
}

function colorFor(player: Player) {
  const index = Number(player.id.replace("p", "")) - 1;
  return SEAT_COLORS[Math.max(0, index) % SEAT_COLORS.length];
}

export function Seat({
  player,
  active,
  compact = false,
  settled = false,
  king = false,
  winner = false,
  maxTentacles = 3,
}: {
  player: Player;
  active: boolean;
  compact?: boolean;
  settled?: boolean;
  king?: boolean;
  winner?: boolean;
  maxTentacles?: number;
}) {
  return (
    <div
      className={`min-w-0 rounded-2xl border px-2.5 py-2 text-center backdrop-blur-sm ${
        compact ? "w-[5.2rem]" : "w-[7.8rem]"
      } ${
        player.out
          ? "border-white/10 bg-black/25 opacity-45"
          : active
            ? "border-gold/80 bg-gold/15 shadow-[0_0_24px_rgba(243,193,93,0.25)]"
            : "border-white/10 bg-black/30"
      }`}
    >
      <div
        className="mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-[#10242b]"
        style={{ background: colorFor(player) }}
      >
        {player.name.slice(0, 1)}
      </div>
      <div
        className={`mt-1 truncate text-[12px] text-white ${player.out ? "line-through" : ""}`}
      >
        {player.name}
      </div>
      {settled ? (
        <div className="mt-1 space-y-0.5">
          <div className="font-display text-lg text-gold">{player.zhangyu}</div>
          <div className="text-[10px] text-white/45">丈育值</div>
          {king ? (
            <div className="text-[10px] text-coral">丈育王</div>
          ) : null}
          {winner ? (
            <div className="text-[10px] text-gold">活到最后</div>
          ) : null}
        </div>
      ) : (
        <div className="mt-1 flex flex-col items-center gap-1">
          <TentacleDots
            current={player.tentacles}
            max={maxTentacles}
            light
          />
          <div className="text-[10px] text-white/40">
            丈育 {player.zhangyu}
          </div>
        </div>
      )}
    </div>
  );
}
