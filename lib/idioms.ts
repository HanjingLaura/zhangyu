import type { IdiomIndex, IdiomRow, LinkMode } from "./types";

export function buildIndex(rows: IdiomRow[]): IdiomIndex {
  const byWord = new Map<string, { firstPinyin: string; lastPinyin: string }>();
  const byFirstChar = new Map<string, string[]>();
  const byFirstPinyin = new Map<string, string[]>();
  const byLastCharFanout = new Map<string, number>();

  for (const [word, firstPinyin, lastPinyin] of rows) {
    if (word.length < 2) continue;
    byWord.set(word, { firstPinyin, lastPinyin });
    const first = word[0];
    const list = byFirstChar.get(first);
    if (list) list.push(word);
    else byFirstChar.set(first, [word]);

    const pyList = byFirstPinyin.get(firstPinyin);
    if (pyList) pyList.push(word);
    else byFirstPinyin.set(firstPinyin, [word]);
  }

  for (const word of byWord.keys()) {
    const last = word[word.length - 1];
    const fanout = byFirstChar.get(last)?.length ?? 0;
    byLastCharFanout.set(word, fanout);
  }

  return { byWord, byFirstChar, byFirstPinyin, byLastCharFanout };
}

export function normalizeIdiom(input: string): string {
  return input.replace(/\s+/g, "").trim();
}

export function lastChar(word: string): string {
  return word[word.length - 1] ?? "";
}

export function firstChar(word: string): string {
  return word[0] ?? "";
}

export function lookup(index: IdiomIndex, word: string) {
  return index.byWord.get(word) ?? null;
}

export function links(
  index: IdiomIndex,
  prev: string,
  next: string,
  mode: LinkMode,
): boolean {
  if (mode === "char") return lastChar(prev) === firstChar(next);
  const prevInfo = lookup(index, prev);
  const nextInfo = lookup(index, next);
  if (prevInfo && nextInfo) return prevInfo.lastPinyin === nextInfo.firstPinyin;
  return lastChar(prev) === firstChar(next);
}

export function candidates(
  index: IdiomIndex,
  prev: string,
  mode: LinkMode,
  used: Iterable<string>,
): string[] {
  const usedSet = used instanceof Set ? used : new Set(used);
  const info = lookup(index, prev);
  const pool =
    mode === "pinyin" && info
      ? (index.byFirstPinyin.get(info.lastPinyin) ?? [])
      : (index.byFirstChar.get(lastChar(prev)) ?? []);
  return pool.filter((word) => word !== prev && !usedSet.has(word));
}

export function pickHints(
  index: IdiomIndex,
  prev: string,
  mode: LinkMode,
  used: Iterable<string>,
  count = 3,
): string[] {
  const pool = candidates(index, prev, mode, used);
  if (pool.length <= count) return pool;
  const picked: string[] = [];
  const copy = [...pool];
  while (picked.length < count && copy.length > 0) {
    const i = Math.floor(Math.random() * copy.length);
    picked.push(copy.splice(i, 1)[0]);
  }
  return picked;
}

const SAFE_OPENINGS = [
  "一鸣惊人",
  "龙飞凤舞",
  "开门见山",
  "画龙点睛",
  "天长地久",
  "海阔天空",
  "心想事成",
  "喜气洋洋",
  "光明磊落",
  "风调雨顺",
];

export function pickOpening(
  index: IdiomIndex,
  kind: "random" | "yiming" | "longfei",
): string {
  if (kind === "yiming" && index.byWord.has("一鸣惊人")) return "一鸣惊人";
  if (kind === "longfei" && index.byWord.has("龙飞凤舞")) return "龙飞凤舞";

  const preferred = SAFE_OPENINGS.filter((word) => {
    if (!index.byWord.has(word)) return false;
    return (index.byLastCharFanout.get(word) ?? 0) >= 8;
  });
  if (preferred.length > 0) {
    return preferred[Math.floor(Math.random() * preferred.length)];
  }

  let best = "一鸣惊人";
  let bestFan = -1;
  for (const [word, fanout] of index.byLastCharFanout) {
    if (fanout > bestFan) {
      best = word;
      bestFan = fanout;
    }
  }
  return best;
}
