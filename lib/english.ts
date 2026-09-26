import words from "@/data/english-words.json";

const WORD_SET = new Set<string>();
const byFirst = new Map<string, string[]>();
const lastFanout = new Map<string, number>();

for (const raw of words as string[]) {
  const word = normalizeEnglish(raw);
  if (word.length < 2 || WORD_SET.has(word)) continue;
  WORD_SET.add(word);
  const list = byFirst.get(word[0]);
  if (list) list.push(word);
  else byFirst.set(word[0], [word]);
}

for (const word of WORD_SET) {
  lastFanout.set(word, byFirst.get(word[word.length - 1])?.length ?? 0);
}

export function normalizeEnglish(input: string) {
  return input.toLowerCase().replace(/[^a-z]/g, "");
}

export function isEnglishWord(input: string) {
  return WORD_SET.has(normalizeEnglish(input));
}

export function englishLinks(prev: string, next: string) {
  const a = normalizeEnglish(prev);
  const b = normalizeEnglish(next);
  return a.length >= 2 && b.length >= 2 && a[a.length - 1] === b[0];
}

export function englishCandidates(prev: string, used: Iterable<string>) {
  const last = normalizeEnglish(prev).slice(-1);
  const usedSet = new Set([...used].map(normalizeEnglish));
  return (byFirst.get(last) ?? []).filter((word) => !usedSet.has(word));
}

export function pickEnglishHints(prev: string, used: Iterable<string>, count = 3) {
  const pool = englishCandidates(prev, used);
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
  "octopus",
  "ocean",
  "water",
  "apple",
  "school",
  "friend",
  "house",
  "music",
  "light",
  "table",
];

export function pickEnglishOpening() {
  const preferred = SAFE_OPENINGS.filter((word) => (lastFanout.get(word) ?? 0) >= 20);
  if (preferred.length > 0) {
    return preferred[Math.floor(Math.random() * preferred.length)];
  }
  let best = "ocean";
  let bestFan = -1;
  for (const [word, fanout] of lastFanout) {
    if (fanout > bestFan) {
      best = word;
      bestFan = fanout;
    }
  }
  return best;
}

export function englishWordCount() {
  return WORD_SET.size;
}
