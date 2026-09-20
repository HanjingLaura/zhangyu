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
    aspect: 860 / 982,
    hole: { cx: 50, cy: 25.05, rw: 20.47, rh: 18.08 },
  },
  {
    id: "diver",
    name: "松鼠头盔",
    price: 16,
    src: "/suit-diver.webp",
    aspect: 647 / 884,
    hole: { cx: 61.46, cy: 33.62, rw: 26.2, rh: 18.95 },
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
