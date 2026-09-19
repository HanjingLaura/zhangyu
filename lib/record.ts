import { rankPlayers } from "./engine";
import type { RoomSnapshot } from "./types";

export function formatRecord(room: RoomSnapshot) {
  const game = room.game;
  if (!game) return "这桌还没开打。";

  const titles = game.titles;
  const lines = [
    `丈育成语接龙 · 房号 ${room.code}`,
    `规则：${game.mode === "char" ? "字接字" : "音接音"} · ${game.maxRounds} 轮`,
    `接龙：${game.chain.join(" → ")}`,
    `共 ${game.rounds} 轮`,
    "",
    "结算",
    titles
      ? [
          `最有意思　${titles.fun.name}（${titles.fun.fun}）`,
          `最没文化　${titles.uncultured.name}（失误 ${titles.uncultured.fails}）`,
          `最丈育　　${titles.zhangyu.name}（${titles.zhangyu.zhangyu}）`,
          `分最高　　${titles.culture.name}（${titles.culture.culture}）`,
        ].join("\n")
      : "尚未散场",
    "",
    "分数",
    ...rankPlayers(game).map(
      (player, index) =>
        `${index + 1}. ${player.name}  文化 ${player.culture}  丈育 ${player.zhangyu}  有意思 ${player.fun}  失误 ${player.fails}`,
    ),
    "",
    "弹幕",
    room.danmaku.length
      ? room.danmaku.map((item) => `${item.name}：${item.text}`).join("\n")
      : "（没有弹幕）",
    "",
    "桌上的话",
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
