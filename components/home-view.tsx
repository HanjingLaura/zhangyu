"use client";

import type { UserPublic } from "@/lib/types";
import { AvatarPicker } from "./avatar";

function ShopHouseIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 10.8 12 4l8 6.8V20H4V10.8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M10 20v-6h4v6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

export function HomeView({
  user,
  onAvatar,
  onCreate,
  onJoin,
  onRules,
  onScenes,
  onShop,
  onLogout,
}: {
  user: UserPublic;
  onAvatar: (image: string) => Promise<void>;
  onCreate: () => void;
  onJoin: () => void;
  onRules: () => void;
  onScenes: () => void;
  onShop: () => void;
  onLogout: () => void;
}) {
  void onRules;

  return (
    <div className="screen screen-home">
      <img
        src="/house.webp?v=3"
        alt=""
        className="pointer-events-none absolute left-1/2 top-[46%] z-0 w-[78%] -translate-x-1/2 -translate-y-1/2 select-none"
      />
      <div className="relative z-10 flex items-start justify-between px-4 pt-[calc(10px+env(safe-area-inset-top))]">
        <div className="flex items-center gap-2.5">
          <AvatarPicker name={user.name} src={user.avatarUrl} size={48} onPick={onAvatar} />
          <div className="min-w-0">
            <div className="text-[15px]">{user.name}</div>
            <div className="flex items-center gap-2 text-xs text-foam/55">
              <span>贝壳 {user.shells}</span>
              <button type="button" onClick={onLogout} className="text-foam/45">
                退出
              </button>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onShop}
          className="flex h-10 w-10 items-center justify-center rounded-full text-foam active:bg-white/10"
          aria-label="服装"
        >
          <ShopHouseIcon />
        </button>
      </div>
      <div className="relative z-10 mt-auto flex items-center gap-3 px-5 pb-[calc(18px+env(safe-area-inset-bottom))]">
        <button type="button" onClick={onCreate} className="btn btn-primary min-w-0 flex-1">
          创建房间
        </button>
        <button type="button" onClick={onJoin} className="btn btn-quiet min-w-0 flex-1">
          加入房间
        </button>
        <button type="button" onClick={onScenes} className="shrink-0 px-1 text-[15px] text-white">
          记录
        </button>
      </div>
    </div>
  );
}
