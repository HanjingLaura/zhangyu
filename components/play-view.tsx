"use client";

import { useState } from "react";
import { currentNeed, rankPlayers, zhangyuKing } from "@/lib/engine";
import { downloadRecord } from "@/lib/record";
import type { RoomSnapshot, UserPublic } from "@/lib/types";
import { OctopusFigure } from "./octopus";
import { RoomHeader } from "./shell";
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
  const game = room.game;
  if (!game) return null;

  const need = currentNeed(game);
  const current = game.players[game.turn];
  const finished = game.status === "finished";
  const king = zhangyuKing(game);
  const titles = game.titles;
  const ranked = rankPlayers(game);
  const line = lastOctopus(room)?.text;
  const mine = !you || current.id === you.id;
  const host = you?.id === room.hostId;

  return (
    <div className="tavern-screen">
      <RoomHeader
        title="丈育成语接龙"
        subtitle={`${game.mode === "char" ? "字接字" : "音接音"} · ${game.rounds}/${game.maxRounds} 轮`}
        onBack={onBack}
      />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center px-1">
        {line ? (
          <div className="mb-2 line-clamp-2 max-w-[88%] rounded-2xl bg-[#f6efe2] px-3 py-1.5 text-center text-[11px] leading-5 text-[#2a160e] shadow">
            {line}
          </div>
        ) : null}
        <TableScene
          people={game.players}
          youId={you?.id}
          currentId={current.id}
          finished={finished}
          kingId={king.id}
          winnerId={titles?.culture.id ?? game.winnerId ?? undefined}
          danmaku={room.danmaku}
        >
          <OctopusFigure
            priority
            className="h-[6.6rem] w-[6.6rem] drop-shadow-[0_16px_18px_rgba(0,0,0,0.35)]"
          />
          <div className="font-display text-5xl leading-none text-[#f6e2b0]">{need.char}</div>
          <div className="mt-1 text-[10px] tracking-[0.28em] text-gold/70">
            {finished ? "本局结束" : "顺时针接到这个字"}
          </div>
        </TableScene>
      </div>

      {finished ? (
        <div className="relative z-10 border-t border-[#d7b56a]/15 px-4 py-3">
          <div className="parchment rounded-3xl px-4 py-3">
            <div className="text-center font-display text-xl">本局结算</div>
            {titles ? (
              <div className="mt-2 grid grid-cols-2 gap-2 text-center text-[11px]">
                <div className="rounded-2xl bg-[#2a160e]/6 px-2 py-2">
                  <div className="text-[#8a5a28]">最有意思</div>
                  <div className="font-display text-base">{titles.fun.name}</div>
                </div>
                <div className="rounded-2xl bg-[#2a160e]/6 px-2 py-2">
                  <div className="text-[#8a5a28]">最没文化</div>
                  <div className="font-display text-base">{titles.uncultured.name}</div>
                </div>
                <div className="rounded-2xl bg-[#2a160e]/6 px-2 py-2">
                  <div className="text-[#8a5a28]">最丈育</div>
                  <div className="font-display text-base">{titles.zhangyu.name}</div>
                </div>
                <div className="rounded-2xl bg-[#2a160e]/6 px-2 py-2">
                  <div className="text-[#8a5a28]">分最高</div>
                  <div className="font-display text-base">{titles.culture.name}</div>
                </div>
              </div>
            ) : null}
            <ol className="mt-3 space-y-1 text-sm">
              {ranked.map((player, index) => (
                <li key={player.id} className="flex justify-between">
                  <span>
                    {index + 1}. {player.name}
                  </span>
                  <span>
                    {player.culture} 分 · {player.zhangyu} 丈育
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <button type="button" onClick={() => downloadRecord(room)} className="ghost-btn py-3 text-sm">
              导出
            </button>
            <button type="button" onClick={onReseat} className="ghost-btn py-3 text-sm">
              回房间
            </button>
            <button type="button" onClick={onAgain} className="wood-btn py-3 text-sm">
              再来
            </button>
          </div>
        </div>
      ) : (
        <form
          className="relative z-10 border-t border-[#d7b56a]/15 px-3 py-3"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <p className="mb-2 text-center text-[11px] text-gold/70">
            {mine ? `轮到你，接「${need.char}」` : `等 ${current.name} 接「${need.char}」`}
            ，没有时间限制
          </p>
          <div className="flex gap-2">
            <input
              id="idiom-input"
              value={draft}
              onChange={(event) => onDraft(event.target.value)}
              placeholder={`接「${need.char}」`}
              disabled={!mine}
              className="min-w-0 flex-1 rounded-full bg-white/8 px-4 py-3 text-base outline-none ring-gold/40 focus:ring-2 disabled:opacity-40"
              autoComplete="off"
            />
            <button type="submit" disabled={!mine} className="wood-btn shrink-0 px-5 py-3 text-sm">
              接上
            </button>
          </div>
          {error ? <p className="mt-2 text-center text-xs text-coral">{error}</p> : null}
          <div className="mt-2 flex gap-2">
            <input
              value={barrage}
              onChange={(event) => setBarrage(event.target.value)}
              placeholder="弹幕"
              maxLength={24}
              className="min-w-0 flex-1 rounded-full bg-white/8 px-3 py-2 text-xs outline-none ring-gold/40 focus:ring-2"
            />
            <button
              type="button"
              onClick={async () => {
                const text = barrage.trim();
                if (!text) return;
                setBarrage("");
                await onDanmaku(text);
              }}
              className="ghost-btn px-3 py-2 text-xs"
            >
              弹
            </button>
            <button type="button" disabled={!mine} onClick={onHint} className="ghost-btn px-3 py-2 text-xs disabled:opacity-40">
              查了吧
            </button>
            <button type="button" disabled={!mine} onClick={onPass} className="ghost-btn px-3 py-2 text-xs disabled:opacity-40">
              过
            </button>
          </div>
          {host ? (
            <button type="button" onClick={onFinish} className="mt-2 w-full text-center text-[11px] text-white/35">
              提前散场
            </button>
          ) : null}
        </form>
      )}
    </div>
  );
}
