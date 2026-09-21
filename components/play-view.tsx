"use client";

import { useState } from "react";
import { currentNeed } from "@/lib/engine";
import type { RoomSnapshot, UserPublic } from "@/lib/types";
import { lastSpeeches } from "@/lib/speeches";
import { RoomScene } from "./room-scene";
import { SettleView } from "./settle-view";
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
  const game = room.game;
  if (!game) return null;

  const need = currentNeed(game);
  const current = game.players[game.turn];
  const finished = game.status === "finished";
  const speeches = lastSpeeches(game.messages);
  const mine = !you || current.id === you.id;
  const host = you?.id === room.hostId;

  if (finished) {
    return <SettleView room={room} you={you} onBack={onBack} onAgain={onAgain} onReseat={onReseat} />;
  }

  return (
    <div className="screen screen-room">
      <TopBar
        title={
          <span>
            第 {game.rounds + 1} 轮<span className="text-foam/40"> / {game.maxRounds}</span>
          </span>
        }
        right={<span>{game.mode === "char" ? "字接字" : "音接音"}</span>}
        onBack={onBack}
      />

      <RoomScene
        people={game.players.map((player) => ({ ...player, player }))}
        youId={you?.id}
        currentId={current.id}
        finished={false}
        bubble={speeches.octopus}
        speeches={speeches.players}
        danmaku={room.danmaku}
        overlay={
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
        }
      />

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
    </div>
  );
}
