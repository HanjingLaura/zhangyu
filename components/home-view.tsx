"use client";

import { BgmToggle } from "./bgm";
import { withBase } from "@/lib/base-path";

function SettingsIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="3.1" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M19.4 13.5a7.8 7.8 0 0 0 .1-3l2-1.1-2-3.5-2.2.6a7.7 7.7 0 0 0-2.6-1.5L14.1 2h-4.2L9.3 4.5A7.7 7.7 0 0 0 6.7 6L4.5 5.4l-2 3.5 2 1.1a7.8 7.8 0 0 0-.1 3l-2 1.1 2 3.5 2.2-.6a7.7 7.7 0 0 0 2.6 1.5L9.9 22h4.2l.6-2.5a7.7 7.7 0 0 0 2.6-1.5l2.2.6 2-3.5-2-1.1Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
  onCreate,
  onJoin,
  onRules,
  onScenes,
  onShop,
  onSettings,
}: {
  onCreate: () => void;
  onJoin: () => void;
  onRules: () => void;
  onScenes: () => void;
  onShop: () => void;
  onSettings: () => void;
}) {
  void onRules;

  return (
    <div className="screen screen-home">
      <img
        src={withBase("/house.webp?v=4")}
        alt=""
        className="pointer-events-none absolute left-1/2 top-[46%] z-0 w-[78%] -translate-x-1/2 -translate-y-1/2 select-none"
      />
      <div className="relative z-10 flex items-center justify-between px-4 pt-[calc(12px+env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={onSettings}
          className="flex h-11 w-11 items-center justify-center rounded-full text-white active:bg-white/10"
          aria-label="设置"
        >
          <SettingsIcon />
        </button>
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
          历史记录
        </button>
      </div>
    </div>
  );
}
