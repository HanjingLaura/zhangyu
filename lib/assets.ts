import { withBase } from "./base-path";
import { OUTFITS } from "./wardrobe";

/** Scene photos. Query strings must match the backdrop <img> src exactly. */
export const SCENE_PATHS = [
  "/sand.webp",
  "/sea.webp",
  "/house.webp?v=4",
  "/interior.webp?v=8",
  "/octopus.webp",
] as const;

export type BackdropKind = "sand" | "home" | "sea" | "room";

export function assetUrls() {
  const urls = SCENE_PATHS.map((path) => withBase(path));
  for (const outfit of OUTFITS) {
    if (outfit.src) urls.push(outfit.src);
    if (outfit.mask) urls.push(outfit.mask);
  }
  return urls;
}

export function backdropKind(view: string, playing: boolean): BackdropKind {
  if (view === "auth") return "sea";
  if (view === "boot" || view === "home") return "home";
  if (view === "lobby") return "room";
  if (view === "play" && playing) return "room";
  return "sand";
}

const kept: HTMLImageElement[] = [];
const pending = new Map<string, Promise<void>>();

export function warmUrls(urls: string[]) {
  if (typeof window === "undefined") return Promise.resolve();
  const jobs: Promise<void>[] = [];
  for (const src of urls) {
    if (!src) continue;
    let job = pending.get(src);
    if (!job) {
      const img = new Image();
      img.decoding = "sync";
      img.src = src;
      kept.push(img);
      job = Promise.resolve(img.decode?.()).then(
        () => undefined,
        () => undefined,
      );
      pending.set(src, job);
    }
    jobs.push(job);
  }
  return Promise.all(jobs).then(() => undefined);
}

let warming: Promise<void> | null = null;

export function warmAssets() {
  warming ??= warmUrls(assetUrls());
  return warming;
}
