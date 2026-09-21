"use client";

import { useState } from "react";
import { currentNeed, rankPlayers } from "@/lib/engine";
import type { RoomSnapshot, UserPublic } from "@/lib/types";
import { lastSpeeches } from "@/lib/speeches";
import { RecordSheet } from "./record-sheet";
import { RoomScene } from "./room-scene";
import { TopBar } from "./shell";

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
  const speeches = lastSpeeches(game.messages);
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

      <RoomScene
        people={game.players.map((player) => ({ ...player, player }))}
        youId={you?.id}
        currentId={current.id}
        finished={finished}
        bubble={speeches.octopus}
        speeches={speeches.players}
        danmaku={room.danmaku}
        overlay={
          finished ? undefined : (
            <form
              className="rounded-[22px] bg-[#f7f1de] px-3 py-2.5 text-ink shadow-[0_12px_28px_rgba(0,20,28,0.35)]"
              onSubmit={(event) => {
                event.preventDefault();
                onSubmit();
              }}
            >
              <div className="mb-1.5 flex items-center justify-between px-0.5">
                <span className="text-[13px] font-semibold">接龙</span>
                <span className="flex items-center gap-3 text-[11px] text-ink/50">
                  <span>{mine ? "轮到你" : `等 ${current.name}`}</span>
                  <button type="button" disabled={!mine} onClick={onHint} className="disabled:opacity-30">
                    提示
                  </button>
                  <button type="button" disabled={!mine} onClick={onPass} className="disabled:opacity-30">
                    跳过
                  </button>
                  {host ? (
                    <button type="button" onClick={onFinish} className="text-ink/35">
                      结束
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
                  className="min-w-0 flex-1 rounded-[14px] border border-ink/10 bg-white px-3 py-2.5 text-[15px] text-ink outline-none placeholder:text-ink/30 disabled:opacity-40"
                  autoComplete="off"
                />
                <button type="submit" disabled={!mine} className="btn btn-primary shrink-0 px-4 py-2.5 text-sm">
                  发送
                </button>
              </div>
              {error ? <p className="mt-1 text-xs text-coral">{error}</p> : null}
            </form>
          )
        }
      />

      {finished ? null : (
        <form
          className="relative z-20 flex shrink-0 items-center gap-2 px-3 pb-[calc(10px+env(safe-area-inset-bottom))] pt-1"
          onSubmit={(event) => {
            event.preventDefault();
            const text = barrage.trim();
            if (!text) return;
            setBarrage("");
            void onDanmaku(text);
          }}
        >
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-[18px] bg-[#12343c]/90 px-3 py-2 shadow-[0_10px_24px_rgba(0,20,28,0.4)]">
            <span className="shrink-0 text-[13px] font-semibold text-gold">弹幕</span>
            <input
              value={barrage}
              onChange={(event) => setBarrage(event.target.value)}
              placeholder="从这儿发，底部飘过"
              maxLength={24}
              className="min-w-0 flex-1 bg-transparent py-1 text-[15px] text-foam outline-none placeholder:text-foam/35"
            />
            <button type="submit" className="btn btn-primary shrink-0 px-3 py-1.5 text-sm">
              发送
            </button>
          </div>
        </form>
      )}

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
      ) : null}
      {showRecord ? <RecordSheet room={room} onClose={() => setShowRecord(false)} /> : null}
    </div>
  );
}
