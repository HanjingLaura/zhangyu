"use client";

import { useState } from "react";
import { rankPlayers } from "@/lib/engine";
import { downloadRecord } from "@/lib/record";
import { downloadRecordImage } from "@/lib/record-image";
import type { RoomSnapshot, UserPublic } from "@/lib/types";
import { SeaPanel } from "./sea-panel";

export function SettleView({
  room,
  you,
  onBack,
  onAgain,
  onReseat,
}: {
  room: RoomSnapshot;
  you?: UserPublic | null;
  onBack: () => void;
  onAgain?: () => void;
  onReseat?: () => void;
}) {
  const [exporting, setExporting] = useState(false);
  const game = room.game;
  if (!game) return null;
  const titles = game.titles;
  const ranked = rankPlayers(game);

  return (
    <SeaPanel title="结算" right={<span>共 {game.rounds} 轮</span>} onBack={onBack}>
      {titles ? (
        <div className="grid grid-cols-2 gap-2 text-center">
          {[
            ["最丈育", titles.zhangyu.name],
            ["最有文化", titles.culture.name],
          ].map(([label, name]) => (
            <div key={label} className="rounded-2xl bg-white/8 px-2 py-3">
              <div className="text-[11px] text-foam/50">{label}</div>
              <div className="mt-0.5 truncate font-display text-xl text-foam">{name}</div>
            </div>
          ))}
        </div>
      ) : null}
      <ol className="mt-3 divide-y divide-white/8 text-sm">
        {ranked.map((player, index) => {
          const shells = game.payouts?.[player.id];
          return (
            <li key={player.id} className="flex items-center justify-between gap-3 py-2">
              <span className="min-w-0">
                <span className="truncate text-foam">
                  <span className="mr-2 text-foam/40">{index + 1}</span>
                  {you?.id === player.id ? "我" : player.name}
                </span>
                <span className="mt-0.5 block text-[11px] text-foam/45">
                  {player.culture} 分 · 丈育 {player.zhangyu}
                </span>
              </span>
              {shells != null ? <span className="shrink-0 font-display text-lg text-gold">+{shells}</span> : null}
            </li>
          );
        })}
      </ol>
      <div className="mt-3 space-y-2">
        {onAgain ? (
          <button type="button" onClick={onAgain} className="btn btn-primary h-12 w-full py-0">
            再来一局
          </button>
        ) : null}
        <button
          type="button"
          disabled={exporting}
          onClick={() => {
            setExporting(true);
            void downloadRecordImage(room)
              .catch(() => downloadRecord(room))
              .finally(() => setExporting(false));
          }}
          className={`btn h-12 w-full py-0 ${onAgain ? "btn-quiet" : "btn-primary"}`}
        >
          {exporting ? "导出中" : "导出长图"}
        </button>
        {onReseat ? (
          <button type="button" onClick={onReseat} className="btn btn-quiet h-12 w-full py-0">
            回房间
          </button>
        ) : null}
      </div>
    </SeaPanel>
  );
}
