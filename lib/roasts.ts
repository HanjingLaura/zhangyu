export type EggHit = {
  id: string;
  roast: string;
};

const EXACT_EGGS: Record<string, EggHit> = {
  春天来了: { id: "spring", roast: "这是广播体操。少骗人。" },
  舞动青春: { id: "youth", roast: "广播体操请回操场，这儿是成语桌。" },
  龙年大吉: { id: "loong-year", roast: "这叫成语？拜年短信请回微信。" },
  鸡年大吉: { id: "chicken-year", roast: "属鸡也不能这么接。" },
  猪年大吉: { id: "pig-year", roast: "属猪的刚大一？这也不成语。" },
  吉祥三宝: { id: "three-treasures", roast: "怎么把年给辩过去了。谁属猪啊。" },
  大姐们: { id: "sisters", roast: "有点文化行吗。" },
  看吓着: { id: "sign", roast: "看呐这文化底蕴。门牌也算接龙？" },
};

const YEAR_GREETING = /[龙蛇马羊猴鸡狗猪鼠牛虎兔]年大吉/;

export function detectEgg(word: string): EggHit | null {
  if (EXACT_EGGS[word]) return EXACT_EGGS[word];
  if (YEAR_GREETING.test(word)) {
    return { id: "year", roast: "这叫成语？拜年请出门左转。" };
  }
  return null;
}

const FAIL_NOT_IDIOM = [
  "这叫成语？",
  "有点文化行吗",
  "笑死我了",
  "人大约就是没文化",
  "查了吧",
  "丈育现场，章鱼都捂眼睛。",
];

const FAIL_UNLINK = [
  "谁让你接这个的",
  "上一字还在桌上，你就已经跑偏了。",
  "接龙不是脑筋急转弯。",
  "章鱼八条腿都跟不上你的思维。",
];

const FAIL_USED = [
  "用过了。背诵课文也不能循环播放。",
  "这条触手刚爬过，换一条。",
];

const FAIL_EMPTY = ["先把成语写上。沉默也是一种丈育。"];

const OK_LINES = [
  "居然接上了。文化回光返照。",
  "nbb，人大约就是有文化。",
  "这条算正经的。记下来，待会还要靠它。",
  "章鱼点头。暂时不笑你。",
];

const HINT_LINES = [
  "查了吧。",
  "提示可以给，丈育值也记账。",
  "这能叫自己会？章鱼看见了。",
];

const PASS_LINES = [
  "接不上就输吧。",
  "掉一条触手。该你们了。",
  "认输也是一种诚实。",
];

const WIN_LINES = [
  "文化余烬还在，章鱼宣布你活到了最后。",
  "赢了。今晚可以在群里装一下。",
];

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
  deadEnd: () => "这个字太绝了，接不动。章鱼放你们一马，免费过。",
  opening: (word: string) => `开局抛一条正经的：${word}。从最后一个字接。`,
  yourTurn: (name: string, char: string) =>
    `${name}，接到「${char}」。接不上就输吧。`,
};
