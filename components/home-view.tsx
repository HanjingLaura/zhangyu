"use client";

import type { UserPublic } from "@/lib/types";
import { AvatarPicker } from "./avatar";
import { TableScene } from "./table-scene";
import { TopBar } from "./shell";

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
  return (
    <div className="screen">
      <TopBar
        title=""
        right={
          <button type="button" onClick={onLogout} className="px-2 py-1">
            退出
          </button>
        }
      />
      <div className="relative z-10 flex items-center gap-3 px-5 pt-2">
        <AvatarPicker name={user.name} src={user.avatarUrl} size={48} onPick={onAvatar} />
        <div className="min-w-0 flex-1">
          <div className="text-[15px]">{user.name}</div>
          <div className="text-xs text-foam/55">贝壳 {user.shells}</div>
        </div>
      </div>
      <TableScene />
      <div className="drawer space-y-3">
        <button type="button" onClick={onCreate} className="btn btn-primary w-full">
          创建房间
        </button>
        <button type="button" onClick={onJoin} className="btn btn-quiet w-full">
          加入房间
        </button>
        <div className="grid grid-cols-3 gap-3">
          <button type="button" onClick={onShop} className="btn btn-quiet py-3 text-sm">
            服装
          </button>
          <button type="button" onClick={onRules} className="btn btn-quiet py-3 text-sm">
            玩法
          </button>
          <button type="button" onClick={onScenes} className="btn btn-quiet py-3 text-sm">
            记录
          </button>
        </div>
      </div>
    </div>
  );
}
