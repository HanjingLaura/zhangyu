"use client";

import { useState } from "react";
import type { RoomSnapshot, UserPublic } from "@/lib/types";
import { OctopusFigure } from "./octopus";
import { RoomHeader } from "./shell";
import { TableScene } from "./table-scene";

export function LobbyView({
  room,
  you,
  onBack,
  onStart,
  onConfigure,
  onDanmaku,
  error,
}: {
  room: RoomSnapshot;
  you: UserPublic;
  onBack: () => void;
  onStart: () => void;
  onConfigure: (patch: { mode?: "char" | "pinyin"; maxRounds?: number }) => void;
  onDanmaku: (text: string) => Promise<void>;
  error?: string;
}) {
  const host = room.hostId === you.id;
  const people = room.members.map((member) => ({ ...member, empty: false }));
  const [draft, setDraft] = useState("");

  return (
    <div className="tavern-screen">
      <RoomHeader title="等一桌人" subtitle={`房号 ${room.code}`} onBack={onBack} />
      <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-2">
        <TableScene people={people} youId={you.id} danmaku={room.danmaku}>
          <OctopusFigure className="h-24 w-24 drop-shadow-[0_14px_16px_rgba(0,0,0,0.35)]" />
          <div className="mt-1 font-display text-3xl tracking-[0.28em] text-gold">
            {room.code}
          </div>
          <div className="text-[10px] tracking-[0.28em] text-gold/60">
            {room.maxRounds} 轮 · {room.mode === "char" ? "字接字" : "音接音"}
          </div>
        </TableScene>
      </div>

      <div className="relative z-10 space-y-3 border-t border-[#d7b56a]/15 px-5 py-4">
        {host ? (
          <>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onConfigure({ mode: "char" })}
                className={`flex-1 rounded-full py-2 text-xs ${room.mode === "char" ? "bg-gold text-[#2a160e]" : "ghost-btn"}`}
              >
                字接字
              </button>
              <button
                type="button"
                onClick={() => onConfigure({ mode: "pinyin" })}
                className={`flex-1 rounded-full py-2 text-xs ${room.mode === "pinyin" ? "bg-gold text-[#2a160e]" : "ghost-btn"}`}
              >
                音接音
              </button>
            </div>
            <div className="flex gap-2">
              {[20, 50, 100].map((rounds) => (
                <button
                  key={rounds}
                  type="button"
                  onClick={() => onConfigure({ maxRounds: rounds })}
                  className={`flex-1 rounded-full py-2 text-xs ${room.maxRounds === rounds ? "bg-gold text-[#2a160e]" : "ghost-btn"}`}
                >
                  {rounds} 轮
                </button>
              ))}
            </div>
          </>
        ) : (
          <p className="text-center text-sm text-white/50">
            等 {room.members.find((member) => member.id === room.hostId)?.name ?? "开桌的人"} 开打
          </p>
        )}

        <form
          className="flex gap-2"
          onSubmit={async (event) => {
            event.preventDefault();
            const text = draft.trim();
            if (!text) return;
            setDraft("");
            await onDanmaku(text);
          }}
        >
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="发一条弹幕"
            maxLength={24}
            className="min-w-0 flex-1 rounded-full bg-white/8 px-4 py-2.5 text-sm outline-none ring-gold/40 focus:ring-2"
          />
          <button type="submit" className="ghost-btn px-4 text-sm">
            弹
          </button>
        </form>

        {error ? <p className="text-center text-sm text-coral">{error}</p> : null}
        {host ? (
          <button type="button" onClick={onStart} className="wood-btn w-full py-3.5">
            {room.members.length < 2 ? "再等一个人" : "开打"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
