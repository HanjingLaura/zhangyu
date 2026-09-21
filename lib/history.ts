import { rankPlayers } from "./engine";
import type { Danmaku, Game, LinkMode, RoomSnapshot } from "./types";
import { computeShells } from "./wardrobe";

export type HistoryRecord = {
  id: string;
  at: number;
  code: string;
  mode: LinkMode;
  rounds: number;
  maxRounds: number;
  playerIds: string[];
  chain: string[];
  danmaku: { name: string; text: string }[];
  titles: {
    zhangyu: string;
    culture: string;
    zhangyuNote: string;
    cultureNote: string;
  } | null;
  scores: {
    id: string;
    name: string;
    culture: number;
    fun: number;
    zhangyu: number;
    fails: number;
    shells: number;
  }[];
};

export function historyFromGame(room: {
  code: string;
  game: Game;
  danmaku: Danmaku[];
}): HistoryRecord {
  const game = room.game;
  const titles = game.titles;
  return {
    id: `${room.code}-${game.seq}-${Date.now().toString(36)}`,
    at: Date.now(),
    code: room.code,
    mode: game.mode,
    rounds: game.rounds,
    maxRounds: game.maxRounds,
    playerIds: game.players.map((player) => player.id),
    chain: game.chain,
    danmaku: room.danmaku.map((item) => ({ name: item.name, text: item.text })),
    titles: titles
      ? {
          zhangyu: titles.zhangyu.name,
          culture: titles.culture.name,
          zhangyuNote: titles.notes?.zhangyu ?? "",
          cultureNote: titles.notes?.culture ?? "",
        }
      : null,
    scores: rankPlayers(game).map((player) => ({
      id: player.id,
      name: player.name,
      culture: player.culture,
      fun: player.fun,
      zhangyu: player.zhangyu,
      fails: player.fails,
      shells: game.payouts?.[player.id] ?? computeShells(player, titles),
    })),
  };
}

export function historyForUser(records: HistoryRecord[], userId: string) {
  return records.filter((item) => item.playerIds.includes(userId));
}

export function historyToRoom(record: HistoryRecord): RoomSnapshot {
  const players = record.scores.map((score) => ({
    id: score.id,
    name: score.name,
    tentacles: 8,
    culture: score.culture,
    zhangyu: score.zhangyu,
    fun: score.fun,
    fails: score.fails,
    out: false,
  }));
  const byName = (name: string) => players.find((player) => player.name === name) ?? players[0];
  const titles = record.titles
    ? {
        fun: players[0],
        uncultured: players[0],
        zhangyu: byName(record.titles.zhangyu),
        culture: byName(record.titles.culture),
        notes: {
          zhangyu: record.titles.zhangyuNote,
          culture: record.titles.cultureNote,
        },
      }
    : null;
  return {
    code: record.code,
    hostId: record.playerIds[0] ?? "",
    members: record.scores.map((score) => ({ id: score.id, name: score.name })),
    status: "finished",
    mode: record.mode,
    tentacles: 8,
    opening: "yiming",
    maxRounds: record.maxRounds,
    game: {
      mode: record.mode,
      players,
      turn: 0,
      maxTentacles: 8,
      maxRounds: record.maxRounds,
      rounds: record.rounds,
      chain: record.chain,
      used: record.chain,
      messages: [],
      status: "finished",
      winnerId: titles?.culture.id ?? null,
      lastHint: null,
      titles,
      seq: 0,
      payouts: Object.fromEntries(record.scores.map((score) => [score.id, score.shells])),
    },
    danmaku: record.danmaku.map((item, index) => ({
      id: `h${index}`,
      userId: "",
      name: item.name,
      text: item.text,
      at: record.at,
    })),
  };
}
