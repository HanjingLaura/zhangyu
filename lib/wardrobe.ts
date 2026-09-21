import type { GameTitles, Player } from "./types";

export type OutfitId = "plain" | "astronaut" | "ranger" | "diver" | "office" | "chef" | "sailor" | "jinyi";

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
    aspect: 388 / 1016,
    hole: { cx: 52.19, cy: 11.75, rw: 28.99, rh: 12.75 },
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
    hole: { cx: 48.34, cy: 11.52, rw: 11.97, rh: 10.48 },
  },
  {
    id: "diver",
    name: "松鼠头盔",
    price: 16,
    src: "/suit-diver.webp",
    mask: "/suit-diver-mask.webp",
    aspect: 373 / 418,
    hole: { cx: 47.99, cy: 24.93, rw: 18.77, rh: 19.14 },
  },
  {
    id: "office",
    name: "西装",
    price: 10,
    src: "/suit-office.webp",
    mask: "/suit-office-mask.webp",
    aspect: 447 / 1213,
    hole: { cx: 49.89, cy: 11.79, rw: 21.48, rh: 11.46 },
  },
  {
    id: "chef",
    name: "厨师",
    price: 12,
    src: "/suit-chef.webp",
    mask: "/suit-chef-mask.webp",
    aspect: 482 / 1213,
    hole: { cx: 50, cy: 11.79, rw: 21.58, rh: 11.46 },
  },
  {
    id: "sailor",
    name: "水手",
    price: 14,
    src: "/suit-sailor.webp",
    mask: "/suit-sailor-mask.webp",
    aspect: 475 / 1218,
    hole: { cx: 50.11, cy: 11.82, rw: 21.47, rh: 11.49 },
  },
  {
    id: "jinyi",
    name: "锦衣",
    price: 16,
    src: "/suit-jinyi.webp",
    mask: "/suit-jinyi-mask.webp",
    aspect: 537 / 1222,
    hole: { cx: 49.91, cy: 11.78, rw: 21.6, rh: 11.46 },
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
