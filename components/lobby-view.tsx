"use client";

import { MAX_PLAYERS } from "@/lib/seats";
import type { RoomSnapshot, UserPublic } from "@/lib/types";
import { RoomScene } from "./room-scene";
import { TopBar } from "./shell";

export function LobbyView({
  room,
  you,
  onBack,
  onStart,
  error,
}: {
  room: RoomSnapshot;
  you: UserPublic;
  onBack: () => void;
  onStart: () => void;
  error?: string;
}) {
  const host = room.hostId === you.id;
  const hostName = room.members.find((member) => member.id === room.hostId)?.name ?? "房主";

  return (
    <div className="screen screen-room">
      <TopBar
        title={
          <span>
            房间 <span className="font-display tracking-[0.2em]">{room.code}</span>
          </span>
        }
        right={<span>{room.members.length}/{MAX_PLAYERS}</span>}
        onBack={onBack}
      />
      <RoomScene
        people={room.members}
        youId={you.id}
        danmaku={room.danmaku}
        overlay={
          <div className="space-y-2 rounded-[22px] bg-[#f7f1de] px-3 py-2.5 text-center text-ink shadow-[0_12px_28px_rgba(0,20,28,0.35)]">
            <div className="font-display text-[28px] tracking-[0.28em] text-[#6a5420]">{room.code}</div>
            <div className="text-[11px] text-ink/45">
              {room.maxRounds} 轮 · {room.mode === "char" ? "字接字" : "音接音"}
            </div>
            {error ? <p className="text-sm text-coral">{error}</p> : null}
            {host ? (
              <button
                type="button"
                onClick={onStart}
                disabled={room.members.length < 2}
                className="btn btn-primary w-full py-3 text-sm"
              >
                {room.members.length < 2 ? "至少 2 人" : "开始"}
              </button>
            ) : (
              <p className="py-1 text-sm text-ink/45">等待 {hostName} 开始</p>
            )}
          </div>
        }
      />
    </div>
  );
}
