import { withBase } from "./base-path";
import type { GameTitles, Player } from "./types";

export type OutfitId =
  | "astronaut"
  | "ranger"
  | "diver"
  | "copper"
  | "crab"
  | "knight"
  | "panda"
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
    hole: { cx: 47.99, cy: 24.93, rw: 18.77, rh: 19.14 },
  },
  {
    id: "copper",
    name: "铜盔潜水员",
    price: 18,
    src: withBase("/outfits/1.webp"),
    aspect: 720 / 960,
    hole: { cx: 50, cy: 16, rw: 8, rh: 8 },
  },
  {
    id: "crab",
    name: "蟹老板",
    price: 16,
    src: withBase("/outfits/2.webp"),
    aspect: 720 / 960,
    hole: { cx: 50, cy: 24, rw: 16, rh: 14 },
  },
  {
    id: "knight",
    name: "骑士",
    price: 18,
    src: withBase("/outfits/3.webp"),
    aspect: 720 / 960,
    hole: { cx: 50, cy: 12, rw: 7, rh: 8 },
  },
  {
    id: "panda",
    name: "熊猫",
    price: 16,
    src: withBase("/outfits/4.webp"),
    aspect: 720 / 960,
    hole: { cx: 50, cy: 28, rw: 10, rh: 10 },
  },
  {
    id: "mecha",
    name: "机甲",
    price: 20,
    src: withBase("/outfits/5.webp"),
    aspect: 720 / 960,
    hole: { cx: 50, cy: 14, rw: 10, rh: 11 },
  },
  {
    id: "bee",
    name: "蜜蜂",
    price: 14,
    src: withBase("/outfits/6.webp"),
    aspect: 720 / 960,
    hole: { cx: 50, cy: 24, rw: 16, rh: 14 },
  },
  {
    id: "starfish",
    name: "粉海星",
    price: 16,
    src: withBase("/outfits/7.webp"),
    aspect: 720 / 960,
    hole: { cx: 50, cy: 32, rw: 10, rh: 12 },
  },
  {
    id: "sponge",
    name: "海绵厨师",
    price: 16,
    src: withBase("/outfits/8.webp"),
    aspect: 720 / 960,
    hole: { cx: 50, cy: 34, rw: 16, rh: 16 },
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
