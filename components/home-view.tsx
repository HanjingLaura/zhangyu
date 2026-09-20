"use client";

import type { UserPublic } from "@/lib/types";
import { AvatarPicker } from "./avatar";
import { BgmToggle } from "./bgm";

function ShopHouseIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3.5 11.2 12 3.8l8.5 7.4V20.2H3.5V11.2Z"
        fill="currentColor"
        fillOpacity="0.16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M10 20.2v-6.2h4v6.2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9.2 10.4h5.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
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
        src="/house.webp?v=4"
        alt=""
        className="pointer-events-none absolute left-1/2 top-[46%] z-0 w-[78%] -translate-x-1/2 -translate-y-1/2 select-none"
      />
      <div className="relative z-10 flex items-center justify-between px-4 pt-[calc(12px+env(safe-area-inset-top))]">
        <div className="flex min-w-0 items-center gap-2.5">
          <AvatarPicker
            name={user.name}
            src={user.avatarUrl}
            size={52}
            onPick={onAvatar}
            confirmFirst
            onLogout={onLogout}
          />
          <div className="min-w-0">
            <div className="truncate text-[15px] font-medium text-black">{user.name}</div>
            <div className="text-xs text-black">贝壳 {user.shells}</div>
          </div>
        </div>
        <div className="flex items-center">
          <BgmToggle />
          <button
            type="button"
            onClick={onShop}
            className="flex h-11 w-11 items-center justify-center rounded-full text-white active:bg-white/10"
            aria-label="商店"
          >
            <ShopHouseIcon />
          </button>
        </div>
      </div>
      <div className="relative z-10 mt-auto flex items-center gap-3 px-5 pb-[calc(36px+env(safe-area-inset-bottom))]">
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
