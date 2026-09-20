export type EggHit = {
  id: string;
  roast: string;
};

const EXACT_EGGS: Record<string, EggHit> = {
  春天来了: { id: "spring", roast: "这是广播体操。" },
  舞动青春: { id: "youth", roast: "这是广播体操。" },
  龙年大吉: { id: "loong-year", roast: "这叫成语？" },
  鸡年大吉: { id: "chicken-year", roast: "这也叫成语？" },
  猪年大吉: { id: "pig-year", roast: "属猪的刚大一？" },
  吉祥三宝: { id: "three-treasures", roast: "怎么把年给辩过去了。" },
  大姐们: { id: "sisters", roast: "有点文化行吗。" },
  看吓着: { id: "sign", roast: "看呐这文化底蕴。" },
};

const YEAR_GREETING = /[龙蛇马羊猴鸡狗猪鼠牛虎兔]年大吉/;

export function detectEgg(word: string): EggHit | null {
  if (EXACT_EGGS[word]) return EXACT_EGGS[word];
  if (YEAR_GREETING.test(word)) {
    return { id: "year", roast: "这叫成语？" };
  }
  return null;
}

const FAIL_NOT_IDIOM = ["这叫成语？", "有点文化行吗。", "查了吧。", "笑死我了。"];
const FAIL_UNLINK = ["谁让你接这个的。", "没接上。"];
const FAIL_USED = ["用过了。"];
const FAIL_EMPTY = ["先写一个。"];
const OK_LINES = ["nbb。", "接上了。", "这条算。"];
const HINT_LINES = ["查了吧。"];
const PASS_LINES = ["接不上就输吧。", "过。"];
const WIN_LINES = ["结束。"];

function pick(lines: string[]): string {
  return lines[Math.floor(Math.random() * lines.length)];
}

export const lines = {
  notIdiom: () => pick(FAIL_NOT_IDIOM),
  unlink: () => pick(FAIL_UNLINK),
  used: () => pick(FAIL_USED),
  empty: () => pick(FAIL_EMPTY),
  ok: () => pick(OK_LINES),
  hint: () => pick(HINT_LINES),
  pass: () => pick(PASS_LINES),
  win: () => pick(WIN_LINES),
  deadEnd: () => "这个字没词了，免费过。",
  opening: (word: string) => `开局：${word}`,
  yourTurn: (name: string, char: string) => `${name}，接「${char}」`,
};
