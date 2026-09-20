import type { GameTitles, Player } from "./types";

export type OutfitId = "plain" | "astronaut" | "ranger" | "diver";

export type Outfit = {
  id: OutfitId;
  name: string;
  price: number;
  src?: string;
  aspect?: number;
  hole?: { cx: number; cy: number; rw: number; rh: number };
};

export const OUTFITS: Outfit[] = [
  { id: "plain", name: "常服", price: 0 },
  {
    id: "astronaut",
    name: "宇航员",
    price: 12,
    src: "/suit-astronaut.webp",
    aspect: 668 / 992,
    hole: { cx: 50.16, cy: 20.87, rw: 18.71, rh: 11.44 },
  },
  {
    id: "ranger",
    name: "巴斯光年",
    price: 24,
    src: "/suit-ranger.webp",
    aspect: 1324 / 1903,
    hole: { cx: 50.3, cy: 13.03, rw: 12.69, rh: 10.4 },
  },
  {
    id: "diver",
    name: "松鼠头盔",
    price: 16,
    src: "/suit-diver.webp",
    aspect: 373 / 418,
    hole: { cx: 49.06, cy: 22.97, rw: 18.77, rh: 17.22 },
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
