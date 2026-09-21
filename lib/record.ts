import { rankPlayers } from "./engine";
import type { RoomSnapshot } from "./types";

export type RecordPoster = {
  title: string;
  code: string;
  mode: string;
  rounds: number;
  maxRounds: number;
  chain: string[];
  titles: {
    zhangyu: string;
    culture: string;
    zhangyuNote: string;
    cultureNote: string;
  } | null;
  danmaku: { name: string; text: string }[];
  scores: {
    rank: number;
    name: string;
    culture: number;
    fun: number;
    zhangyu: number;
    fails: number;
  }[];
};

export function buildRecordPoster(room: RoomSnapshot): RecordPoster | null {
  const game = room.game;
  if (!game) return null;
  const titles = game.titles;
  return {
    title: "章鱼哥接龙",
    code: room.code,
    mode: game.mode === "char" ? "字接字" : "音接音",
    rounds: game.rounds,
    maxRounds: game.maxRounds,
    chain: game.chain,
    titles: titles
      ? {
          zhangyu: titles.zhangyu.name,
          culture: titles.culture.name,
          zhangyuNote: titles.notes?.zhangyu ?? "",
          cultureNote: titles.notes?.culture ?? "",
        }
      : null,
    danmaku: room.danmaku.map((item) => ({ name: item.name, text: item.text })),
    scores: rankPlayers(game).map((player, index) => ({
      rank: index + 1,
      name: player.name,
      culture: player.culture,
      fun: player.fun,
      zhangyu: player.zhangyu,
      fails: player.fails,
    })),
  };
}

export function wrapChain(
  chain: string[],
  maxWidth: number,
  fontSize: number,
  measure?: (word: string) => number,
) {
  const chipPad = Math.round(fontSize * 1.15);
  const arrow = Math.round(fontSize * 1.15);
  const rows: string[][] = [];
  let row: string[] = [];
  let x = 0;
  for (const word of chain) {
    const width = (measure ? measure(word) : word.length * fontSize) + chipPad;
    const extra = row.length ? arrow : 0;
    if (row.length && x + extra + width > maxWidth) {
      rows.push(row);
      row = [word];
      x = width;
    } else {
      x += extra + width;
      row.push(word);
    }
  }
  if (row.length) rows.push(row);
  return rows;
}

export function formatRecord(room: RoomSnapshot) {
  const poster = buildRecordPoster(room);
  if (!poster) return "还没开始。";

  const lines = [
    `${poster.title} · 房间 ${poster.code}`,
    `${poster.mode} · ${poster.maxRounds} 轮 · 共接 ${poster.rounds} 轮`,
    "",
    "接龙",
    poster.chain.join(" → "),
    "",
    "结算",
    poster.titles
      ? [
          `最丈育　　${poster.titles.zhangyu}${poster.titles.zhangyuNote ? `　${poster.titles.zhangyuNote}` : ""}`,
          `最有文化　${poster.titles.culture}${poster.titles.cultureNote ? `　${poster.titles.cultureNote}` : ""}`,
        ].join("\n")
      : "未结束",
    "",
    "分数",
    ...poster.scores.map(
      (player) =>
        `${player.rank}. ${player.name}  ${player.culture} 分  有意思 ${player.fun}  丈育 ${player.zhangyu}  失误 ${player.fails}`,
    ),
    "",
    "弹幕",
    poster.danmaku.length
      ? poster.danmaku.map((item) => `${item.name}：${item.text}`).join("\n")
      : "无",
    "",
    "对话",
    ...(room.game?.messages ?? []).map((message) => {
      if (message.kind === "player") {
        const name =
          room.game?.players.find((player) => player.id === message.playerId)?.name ??
          "有人";
        return `${name}：${message.text}`;
      }
      return `章鱼：${message.text}`;
    }),
  ];

  return lines.join("\n");
}

export function downloadRecord(room: RoomSnapshot) {
  const text = formatRecord(room);
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `zhangyu-${room.code}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function copyRecord(room: RoomSnapshot) {
  const text = formatRecord(room);
  await navigator.clipboard.writeText(text);
  return text;
}
