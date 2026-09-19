"use client";

import type { UserPublic } from "@/lib/types";
import { AvatarPicker } from "./avatar";
import { OctopusFigure } from "./octopus";

export function HomeView({
  user,
  onAvatar,
  onCreate,
  onJoin,
  onRules,
  onScenes,
  onLogout,
}: {
  user: UserPublic;
  onAvatar: (image: string) => Promise<void>;
  onCreate: () => void;
  onJoin: () => void;
  onRules: () => void;
  onScenes: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="tavern-screen px-6 pb-8 pt-7">
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AvatarPicker name={user.name} src={user.avatarUrl} size={64} onPick={onAvatar} />
          <div>
            <div className="font-display text-lg leading-none">{user.name}</div>
            <div className="mt-1 text-[11px] text-white/40">点头像换照片</div>
          </div>
        </div>
        <button type="button" onClick={onLogout} className="text-xs text-white/40">
          离开
        </button>
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center text-center">
        <div className="wood-table relative flex h-48 w-48 items-end justify-center rounded-full pb-2">
          <OctopusFigure
            priority
            className="h-40 w-40 drop-shadow-[0_18px_20px_rgba(0,0,0,0.38)]"
          />
        </div>
        <p className="mt-6 text-[11px] tracking-[0.38em] text-gold/80">酒桌中间坐着章鱼</p>
        <h1 className="font-display mt-2 text-4xl">丈育成语接龙</h1>
        <p className="mt-3 max-w-[16.5rem] text-sm leading-6 text-white/60">
          {user.name}，开一桌或拿房号入座。人顺时针接，中间那只章鱼看着你们。
        </p>
      </div>

      <div className="relative z-10 flex flex-col gap-3">
        <button type="button" onClick={onCreate} className="wood-btn py-3.5">
          创建房间
        </button>
        <button type="button" onClick={onJoin} className="ghost-btn py-3.5">
          加入房间
        </button>
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={onRules} className="ghost-btn py-3 text-sm">
            怎么玩
          </button>
          <button type="button" onClick={onScenes} className="ghost-btn py-3 text-sm">
            群聊名场面
          </button>
        </div>
      </div>
    </div>
  );
}
