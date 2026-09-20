"use client";

import { useState } from "react";
import type { RoomSnapshot, UserPublic } from "@/lib/types";
import { TopBar } from "./shell";
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
  const hostName = room.members.find((member) => member.id === room.hostId)?.name ?? "房主";
  const [draft, setDraft] = useState("");

  return (
    <div className="screen screen-room">
      <TopBar
        title={
          <span>
            房间 <span className="font-display tracking-[0.2em]">{room.code}</span>
          </span>
        }
        right={<span>{room.members.length}/4</span>}
        onBack={onBack}
      />
      <TableScene people={room.members} youId={you.id} danmaku={room.danmaku}>
        <div className="plaque rounded-2xl px-4 py-1.5 text-center">
          <div className="font-display text-[26px] tracking-[0.3em] text-gold">{room.code}</div>
          <div className="mt-0.5 text-[11px] text-foam/50">
            {room.maxRounds} 轮 · {room.mode === "char" ? "字接字" : "音接音"}
          </div>
        </div>
      </TableScene>

      <div className="drawer space-y-3">
        {host ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onConfigure({ mode: "char" })}
              className={`chip ${room.mode === "char" ? "chip-on" : ""}`}
            >
              字接字
            </button>
            <button
              type="button"
              onClick={() => onConfigure({ mode: "pinyin" })}
              className={`chip ${room.mode === "pinyin" ? "chip-on" : ""}`}
            >
              音接音
            </button>
            <span className="w-px bg-white/10" />
            {[20, 50, 100].map((rounds) => (
              <button
                key={rounds}
                type="button"
                onClick={() => onConfigure({ maxRounds: rounds })}
                className={`chip ${room.maxRounds === rounds ? "chip-on" : ""}`}
              >
                {rounds} 轮
              </button>
            ))}
          </div>
        ) : null}

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
            placeholder="弹幕"
            maxLength={24}
            className="field py-3 text-sm"
          />
          <button type="submit" className="btn btn-quiet shrink-0 whitespace-nowrap px-5 py-3 text-sm">
            发送
          </button>
        </form>

        {error ? <p className="text-center text-sm text-coral">{error}</p> : null}
        {host ? (
          <button
            type="button"
            onClick={onStart}
            disabled={room.members.length < 2}
            className="btn btn-primary w-full"
          >
            {room.members.length < 2 ? "至少 2 人" : "开始"}
          </button>
        ) : (
          <p className="py-2 text-center text-sm text-foam/50">等待 {hostName} 开始</p>
        )}
      </div>
    </div>
  );
}
