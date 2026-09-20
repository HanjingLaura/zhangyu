"use client";

import { OUTFITS } from "@/lib/wardrobe";
import type { UserPublic } from "@/lib/types";
import { Figure } from "./figure";
import { TopBar } from "./shell";

export function ShopView({
  user,
  error,
  onBack,
  onBuy,
  onWear,
}: {
  user: UserPublic;
  error?: string;
  onBack: () => void;
  onBuy: (id: string) => void;
  onWear: (id: string) => void;
}) {
  return (
    <div className="screen">
      <TopBar title="服装" right={<span className="text-sm text-foam">贝壳 {user.shells}</span>} onBack={onBack} />
      <div className="relative z-10 flex-1 space-y-3 overflow-y-auto px-4 pb-8 pt-2">
        {OUTFITS.map((outfit) => {
          const owned = outfit.id === "plain" || user.owned.includes(outfit.id);
          const wearing = user.outfit === outfit.id;
          return (
            <div key={outfit.id} className="flex items-center gap-3 rounded-3xl bg-black/25 px-3 py-3">
              <Figure name={user.name} src={user.avatarUrl} outfitId={outfit.id} size={104} />
              <div className="min-w-0 flex-1">
                <div className="text-[15px]">{outfit.name}</div>
                <div className="text-xs text-foam/50">{outfit.price ? `${outfit.price} 贝壳` : "免费"}</div>
              </div>
              {wearing ? (
                <span className="text-sm text-gold">穿着</span>
              ) : owned ? (
                <button type="button" onClick={() => onWear(outfit.id)} className="btn btn-quiet px-4 py-2 text-sm">
                  穿上
                </button>
              ) : (
                <button type="button" onClick={() => onBuy(outfit.id)} className="btn btn-primary px-4 py-2 text-sm">
                  兑换
                </button>
              )}
            </div>
          );
        })}
        {error ? <p className="text-center text-sm text-coral">{error}</p> : null}
      </div>
    </div>
  );
}
