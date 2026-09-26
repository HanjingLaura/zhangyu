import { withBase } from "./base-path";
import type { GameTitles, Player } from "./types";

export type OutfitId =
  | "astronaut"
  | "ranger"
  | "diver"
  | "knight"
  | "mecha"
  | "bee"
  | "starfish"
  | "sponge";

export type Outfit = {
  id: OutfitId;
  name: string;
  price: number;
  src?: string;
  mask?: string;
  aspect?: number;
  hole?: { cx: number; cy: number; rw: number; rh: number };
};

export const DEFAULT_OUTFIT: OutfitId = "astronaut";

export const OUTFITS: Outfit[] = [
  {
    id: "astronaut",
    name: "宇航服",
    price: 0,
    src: withBase("/suit-astronaut.webp"),
    mask: withBase("/suit-astronaut-mask.webp"),
    aspect: 528 / 1057,
    hole: { cx: 49.87, cy: 11.62, rw: 15.06, rh: 6.62 },
  },
  {
    id: "ranger",
    name: "巴斯光年",
    price: 24,
    src: withBase("/suit-ranger.webp"),
    mask: withBase("/suit-ranger-mask.webp"),
    aspect: 1324 / 1903,
    hole: { cx: 48.34, cy: 11.52, rw: 11.97, rh: 10.48 },
  },
  {
    id: "diver",
    name: "松鼠",
    price: 16,
    src: withBase("/suit-diver.webp"),
    mask: withBase("/suit-diver-mask.webp"),
    aspect: 373 / 418,
    hole: { cx: 48.39, cy: 24.4, rw: 21.58, rh: 18.66 },
  },
  {
    id: "knight",
    name: "骑士",
    price: 18,
    src: withBase("/outfits/3.webp"),
    mask: withBase("/outfits/3-mask.webp"),
    aspect: 417 / 946,
    hole: { cx: 50, cy: 13.32, rw: 11.39, rh: 4.12 },
  },
  {
    id: "mecha",
    name: "机甲",
    price: 20,
    src: withBase("/outfits/5.webp"),
    mask: withBase("/outfits/5-mask.webp"),
    aspect: 516 / 953,
    hole: { cx: 49.9, cy: 11.8, rw: 13.28, rh: 6.87 },
  },
  {
    id: "bee",
    name: "蜜蜂",
    price: 14,
    src: withBase("/outfits/6.webp"),
    mask: withBase("/outfits/6-mask.webp"),
    aspect: 663 / 955,
    hole: { cx: 38.91, cy: 28.53, rw: 18.7, rh: 11.47 },
  },
  {
    id: "starfish",
    name: "粉海星",
    price: 16,
    src: withBase("/outfits/7.webp"),
    mask: withBase("/outfits/7-mask.webp"),
    aspect: 701 / 911,
    hole: { cx: 47.15, cy: 30.68, rw: 12.05, rh: 11.91 },
  },
  {
    id: "sponge",
    name: "海绵厨师",
    price: 16,
    src: withBase("/outfits/8.webp"),
    mask: withBase("/outfits/8-mask.webp"),
    aspect: 585 / 939,
    hole: { cx: 45.3, cy: 45.53, rw: 22.74, rh: 15.07 },
  },
];

export function getOutfit(id?: string) {
  return OUTFITS.find((item) => item.id === id) ?? OUTFITS[0];
}

export function isFreeOutfit(id: string) {
  return getOutfit(id).price === 0;
}

export function normalizeOutfitId(id?: string): OutfitId {
  return getOutfit(id).id;
}

export function normalizeOwned(owned?: string[]) {
  const allowed = new Set(OUTFITS.map((item) => item.id));
  const next = [...new Set((owned ?? []).filter((id): id is OutfitId => allowed.has(id as OutfitId)))];
  if (!next.includes(DEFAULT_OUTFIT)) next.unshift(DEFAULT_OUTFIT);
  return next;
}

export type ShellPayout = {
  base: number;
  fromCulture: number;
  cultureBonus: number;
  zhangyuBonus: number;
  amount: number;
};

export function shellPayout(player: Pick<Player, "id" | "culture">, titles: GameTitles | null): ShellPayout {
  const base = 6;
  const fromCulture = player.culture * 3;
  const cultureBonus = titles?.culture.id === player.id ? 10 : 0;
  const zhangyuBonus = titles?.zhangyu.id === player.id ? 4 : 0;
  return {
    base,
    fromCulture,
    cultureBonus,
    zhangyuBonus,
    amount: Math.min(50, base + fromCulture + cultureBonus + zhangyuBonus),
  };
}

export function computeShells(player: Pick<Player, "id" | "culture">, titles: GameTitles | null) {
  return shellPayout(player, titles).amount;
}
