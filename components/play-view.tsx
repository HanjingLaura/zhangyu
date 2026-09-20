"use client";

import { useState } from "react";
import { currentNeed, rankPlayers } from "@/lib/engine";
import type { RoomSnapshot, UserPublic } from "@/lib/types";
import { RecordSheet } from "./record-sheet";
import { TopBar } from "./shell";
import { TableScene } from "./table-scene";

function lastOctopus(room: RoomSnapshot) {
  return [...(room.game?.messages ?? [])].reverse().find((message) => message.kind === "octopus");
}

export function PlayView({
  room,
  you,
  draft,
  error,
  onDraft,
  onSubmit,
  onHint,
  onPass,
  onDanmaku,
  onBack,
  onAgain,
  onReseat,
  onFinish,
}: {
  room: RoomSnapshot;
  you?: UserPublic | null;
  draft: string;
  error?: string;
  onDraft: (value: string) => void;
  onSubmit: () => void;
  onHint: () => void;
  onPass: () => void;
  onDanmaku: (text: string) => Promise<void>;
  onBack: () => void;
  onAgain: () => void;
  onReseat: () => void;
  onFinish: () => void;
}) {
  const [barrage, setBarrage] = useState("");
  const [showRecord, setShowRecord] = useState(false);
  const game = room.game;
  if (!game) return null;

  const need = currentNeed(game);
  const current = game.players[game.turn];
  const finished = game.status === "finished";
  const titles = game.titles;
  const ranked = rankPlayers(game);
  const bubble = lastOctopus(room)?.text;
  const mine = !you || current.id === you.id;
  const host = you?.id === room.hostId;

  return (
    <div className="screen screen-room">
      <TopBar
        title={
          finished ? (
            <span>已结束</span>
          ) : (
            <span>
              第 {game.rounds + 1} 轮<span className="text-foam/40"> / {game.maxRounds}</span>
            </span>
          )
        }
        right={<span>{finished ? `共 ${game.rounds} 轮` : game.mode === "char" ? "字接字" : "音接音"}</span>}
        onBack={onBack}
      />

      <TableScene
        people={game.players.map((player) => ({ ...player, player }))}
        youId={you?.id}
        currentId={current.id}
        finished={finished}
        bubble={bubble}
        danmaku={room.danmaku}
      >
        <div className="plaque flex min-w-[6rem] flex-col items-center rounded-2xl px-4 py-1.5">
          <div className="font-display text-[40px] leading-none text-[#f6e2b0]">{need.char}</div>
          <div className="mt-1 text-[11px] text-foam/50">{need.word}</div>
        </div>
      </TableScene>

      {finished ? (
        <div className="sheet relative z-10 max-h-[52%] shrink-0 overflow-y-auto rounded-t-[28px] px-5 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4">
          <div className="text-center font-display text-2xl">结算</div>
          <p className="mt-1 text-center text-xs text-ink/50">
            共 {game.rounds} 轮
            {you && game.payouts?.[you.id] != null ? ` · 贝壳 +${game.payouts[you.id]}` : ""}
          </p>
          {titles ? (
            <div className="mt-3 grid grid-cols-2 gap-2 text-center">
              {[
                ["最丈育", titles.zhangyu.name, titles.notes?.zhangyu],
                ["最有文化", titles.culture.name, titles.notes?.culture],
              ].map(([label, name, note]) => (
                <div key={label} className="rounded-2xl bg-ink/6 px-2 py-3">
                  <div className="text-[11px] text-ink/55">{label}</div>
                  <div className="mt-0.5 truncate font-display text-xl">{name}</div>
                  {note ? <div className="mt-1 text-[11px] text-ink/45">{note}</div> : null}
                </div>
              ))}
            </div>
          ) : null}
          <ol className="mt-3 divide-y divide-ink/8 text-sm">
            {ranked.map((player, index) => (
              <li key={player.id} className="flex items-center justify-between gap-3 py-2">
                <span className="truncate">
                  <span className="mr-2 text-ink/40">{index + 1}</span>
                  {player.name}
                </span>
                <span className="shrink-0 text-xs text-ink/60">
                  {player.culture} 分 · 有意思 {player.fun} · 丈育 {player.zhangyu} · 失误 {player.fails}
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setShowRecord(true)}
              className="btn bg-ink/8 py-3 text-sm text-ink"
            >
              导出
            </button>
            <button type="button" onClick={onReseat} className="btn bg-ink/8 py-3 text-sm text-ink">
              回房间
            </button>
            <button type="button" onClick={onAgain} className="btn btn-primary py-3 text-sm">
              再来一局
            </button>
          </div>
        </div>
      ) : (
        <form
          className="drawer space-y-2.5"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <div className="flex items-center justify-between px-1 text-xs text-foam/55">
            <span>{mine ? "轮到你" : `等 ${current.name}`}</span>
            <span className="flex gap-4">
              <button type="button" disabled={!mine} onClick={onHint} className="disabled:opacity-30">
                提示
              </button>
              <button type="button" disabled={!mine} onClick={onPass} className="disabled:opacity-30">
                跳过
              </button>
              {host ? (
                <button type="button" onClick={onFinish} className="text-foam/40">
                  结束本局
                </button>
              ) : null}
            </span>
          </div>
          <div className="flex gap-2">
            <input
              id="idiom-input"
              value={draft}
              onChange={(event) => onDraft(event.target.value)}
              placeholder={`接「${need.char}」`}
              disabled={!mine}
              className="field"
              autoComplete="off"
            />
            <button type="submit" disabled={!mine} className="btn btn-primary shrink-0 whitespace-nowrap px-5">
              发送
            </button>
          </div>
          {error ? <p className="px-1 text-xs text-coral">{error}</p> : null}
          <div className="flex gap-2">
            <input
              value={barrage}
              onChange={(event) => setBarrage(event.target.value)}
              placeholder="弹幕"
              maxLength={24}
              className="field py-2.5 text-sm"
            />
            <button
              type="button"
              onClick={async () => {
                const text = barrage.trim();
                if (!text) return;
                setBarrage("");
                await onDanmaku(text);
              }}
              className="btn btn-quiet shrink-0 whitespace-nowrap px-5 py-2.5 text-sm"
            >
              发送
            </button>
          </div>
        </form>
      )}
      {showRecord ? <RecordSheet room={room} onClose={() => setShowRecord(false)} /> : null}
    </div>
  );
}
