import { rankPlayers } from "./engine";
import type { RoomSnapshot } from "./types";

export function formatRecord(room: RoomSnapshot) {
  const game = room.game;
  if (!game) return "还没开始。";

  const titles = game.titles;
  const lines = [
    `章鱼哥接龙 · 房间 ${room.code}`,
    `${game.mode === "char" ? "字接字" : "音接音"} · ${game.maxRounds} 轮 · 共接 ${game.rounds} 轮`,
    "",
    "接龙",
    game.chain.join(" → "),
    "",
    "结算",
    titles
      ? [
          `最丈育　　${titles.zhangyu.name}（${titles.zhangyu.zhangyu}）${titles.notes?.zhangyu ? `　${titles.notes.zhangyu}` : ""}`,
          `最有文化　${titles.culture.name}（${titles.culture.culture}）${titles.notes?.culture ? `　${titles.notes.culture}` : ""}`,
        ].join("\n")
      : "未结束",
    "",
    "分数",
    ...rankPlayers(game).map(
      (player, index) =>
        `${index + 1}. ${player.name}  ${player.culture} 分  有意思 ${player.fun}  丈育 ${player.zhangyu}  失误 ${player.fails}`,
    ),
    "",
    "弹幕",
    room.danmaku.length
      ? room.danmaku.map((item) => `${item.name}：${item.text}`).join("\n")
      : "无",
    "",
    "对话",
    ...game.messages.map((message) => {
      if (message.kind === "player") {
        const name =
          game.players.find((player) => player.id === message.playerId)?.name ??
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
