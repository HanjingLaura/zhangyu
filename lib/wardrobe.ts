import { withBase } from "./base-path";
import type { GameTitles, Player } from "./types";

export type OutfitId = "astronaut" | "ranger" | "diver";

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
