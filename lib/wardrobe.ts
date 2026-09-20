import type { GameTitles, Player } from "./types";

export type OutfitId = "plain" | "astronaut" | "ranger" | "diver";

export type Outfit = {
  id: OutfitId;
  name: string;
  price: number;
  src?: string;
  mask?: string;
  aspect?: number;
  hole?: { cx: number; cy: number; rw: number; rh: number };
};

export const OUTFITS: Outfit[] = [
  {
    id: "plain",
    name: "常服",
    price: 0,
    src: "/suit-plain.webp",
    mask: "/suit-plain-mask.webp",
    aspect: 420 / 780,
    hole: { cx: 50, cy: 16.92, rw: 18.21, rh: 9.81 },
  },
  {
    id: "astronaut",
    name: "宇航员",
    price: 12,
    src: "/suit-astronaut.webp",
    mask: "/suit-astronaut-mask.webp",
    aspect: 668 / 992,
    hole: { cx: 50.15, cy: 20.92, rw: 18.79, rh: 11.49 },
  },
  {
    id: "ranger",
    name: "巴斯光年",
    price: 24,
    src: "/suit-ranger.webp",
    mask: "/suit-ranger-mask.webp",
    aspect: 1324 / 1903,
    hole: { cx: 50.26, cy: 12.77, rw: 12.54, rh: 10.27 },
  },
  {
    id: "diver",
    name: "松鼠头盔",
    price: 16,
    src: "/suit-diver.webp",
    mask: "/suit-diver-mask.webp",
    aspect: 373 / 418,
    hole: { cx: 48.39, cy: 23.68, rw: 22.25, rh: 17.82 },
  },
];

export function getOutfit(id?: string) {
  return OUTFITS.find((item) => item.id === id) ?? OUTFITS[0];
}

export function computeShells(player: Pick<Player, "id" | "culture">, titles: GameTitles | null) {
  let shells = 6 + player.culture * 3;
  if (titles?.culture.id === player.id) shells += 10;
  if (titles?.zhangyu.id === player.id) shells += 4;
  return Math.min(50, shells);
}
