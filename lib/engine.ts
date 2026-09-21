import {
  candidates,
  lastChar,
  links,
  lookup,
  pickHints,
  pickOpening,
} from "./idioms";
import { detectEgg, lines } from "./roasts";
import type {
  ChatTone,
  Game,
  GameConfig,
  GameTitles,
  IdiomIndex,
  Player,
  SeatPlayer,
  SubmitResult,
} from "./types";

function uid(prefix: string, seq: number) {
  return `${prefix}-${seq}`;
}

function nextIndex(players: Player[], from: number) {
  return (from + 1) % players.length;
}

function replacePlayer(players: Player[], id: string, next: Player) {
  return players.map((player) => (player.id === id ? next : player));
}

function rankBy(game: Game, score: (player: Player) => number) {
  return [...game.players].sort((a, b) => {
    const delta = score(b) - score(a);
    if (delta !== 0) return delta;
    return a.name.localeCompare(b.name, "zh-CN");
  });
}

export function computeTitles(game: Game): GameTitles {
  const culture = rankBy(game, (player) => player.culture)[0];
  const zhangyuRank = rankBy(game, (player) => player.zhangyu);
  const zhangyu = zhangyuRank.find((player) => player.id !== culture.id) ?? zhangyuRank[0];
  const fun = rankBy(game, (player) => player.fun)[0];
  const uncultured = rankBy(game, (player) => player.fails * 10 - player.culture)[0];

  return {
    fun,
    uncultured,
    zhangyu,
    culture,
  };
}

function settle(game: Game, note?: string): Game {
  const titles = computeTitles(game);
  return {
    ...game,
    status: "finished",
    winnerId: titles.culture.id,
    titles,
    lastHint: null,
    seq: game.seq + 1,
    messages: [
      ...game.messages,
      {
        id: uid("sys", game.seq + 1),
        kind: "octopus",
        text:
          note ??
          `接满 ${game.rounds} 轮。最有文化 ${titles.culture.name}，最丈育 ${titles.zhangyu.name}。`,
        tone: "win",
      },
    ],
  };
}

function maybeFinish(game: Game): Game {
  if (game.status === "finished") return game;
  if (game.rounds >= game.maxRounds) {
    return settle(game);
  }
  return game;
}

function announceTurn(game: Game): Game {
  const player = game.players[game.turn];
  const prev = game.chain[game.chain.length - 1];
  const char = lastChar(prev);
  return {
    ...game,
    seq: game.seq + 1,
    messages: [
      ...game.messages,
      {
        id: uid("turn", game.seq + 1),
        kind: "system",
        text: game.buzz ? lines.buzzTurn(char) : lines.yourTurn(player.name, char),
        tone: "turn",
      },
    ],
  };
}

function append(
  game: Game,
  message: Omit<Game["messages"][number], "id">,
): Game {
  return {
    ...game,
    seq: game.seq + 1,
    messages: [
      ...game.messages,
      { ...message, id: uid(message.kind, game.seq + 1) },
    ],
  };
}

function applyFail(
  game: Game,
  roast: string,
  reason: SubmitResult["reason"],
  tone: ChatTone = "fail",
  extra?: Partial<Player>,
): SubmitResult {
  const player = game.players[game.turn];
  const nextPlayer: Player = {
    ...player,
    zhangyu: player.zhangyu + 1,
    fails: player.fails + 1,
    ...extra,
    fun: player.fun + (extra?.fun ?? 0),
  };
  let next = append(
    {
      ...game,
      players: replacePlayer(game.players, player.id, nextPlayer),
      lastHint: null,
    },
    {
      kind: "octopus",
      text: roast,
      quote: `${player.name} 的发言`,
      tone,
    },
  );

  next = maybeFinish(next);
  if (next.status === "playing") {
    next = announceTurn({
      ...next,
      turn: next.buzz ? game.turn : nextIndex(next.players, game.turn),
    });
  }
  return { game: next, ok: false, reason };
}

export function createGame(index: IdiomIndex, config: GameConfig): Game {
  const roster: SeatPlayer[] =
    config.seatPlayers && config.seatPlayers.length >= 2
      ? config.seatPlayers
      : config.names
          .map((name) => name.trim())
          .filter(Boolean)
          .map((name, i) => ({ id: `p${i + 1}`, name }));
  const players: Player[] = roster.map((seat) => ({
    id: seat.id,
    name: seat.name,
    avatarUrl: seat.avatarUrl,
    outfit: seat.outfit,
    tentacles: config.tentacles,
    culture: 0,
    zhangyu: 0,
    fun: 0,
    fails: 0,
    out: false,
  }));

  const opening = pickOpening(index, config.opening);
  const seed: Game = {
    mode: config.mode,
    players,
    turn: 0,
    maxTentacles: config.tentacles,
    maxRounds: config.maxRounds,
    buzz: Boolean(config.buzz),
    rounds: 0,
    chain: [opening],
    used: [opening],
    messages: [
      {
        id: "open-0",
        kind: "octopus",
        text: lines.opening(opening),
        tone: "ok",
      },
    ],
    status: "playing",
    winnerId: null,
    lastHint: null,
    titles: null,
    seq: 1,
  };
  return announceTurn(seed);
}

export function currentNeed(game: Game) {
  const prev = game.chain[game.chain.length - 1];
  return {
    word: prev,
    char: lastChar(prev),
  };
}

export function hint(index: IdiomIndex, game: Game): Game {
  if (game.status !== "playing") return game;
  const prev = game.chain[game.chain.length - 1];
  const options = pickHints(index, prev, game.mode, game.used, 3);
  const player = game.players[game.turn];
  if (options.length === 0) {
    return append(
      { ...game, lastHint: null },
      { kind: "octopus", text: lines.deadEnd(), tone: "hint" },
    );
  }
  const word = options[0];
  return append(
    {
      ...game,
      lastHint: word,
      players: replacePlayer(game.players, player.id, {
        ...player,
        zhangyu: player.zhangyu + 2,
      }),
    },
    {
      kind: "octopus",
      text: `${lines.hint()} 试试「${word}」。`,
      quote: `${player.name} 看了提示`,
      tone: "hint",
    },
  );
}

export function submit(
  index: IdiomIndex,
  game: Game,
  raw: string,
): SubmitResult {
  if (game.status !== "playing") {
    return { game, ok: false, reason: "finished" };
  }

  const word = raw.replace(/\s+/g, "").trim();
  const player = game.players[game.turn];
  const prev = game.chain[game.chain.length - 1];

  if (!word) {
    return applyFail(game, lines.empty(), "empty");
  }

  const egg = detectEgg(word);
  const spoken = append(game, {
    kind: "player",
    playerId: player.id,
    text: word,
    tone: egg ? "egg" : undefined,
  });

  if (word.length !== 4) {
    return applyFail(spoken, lines.notFour(), "not-four");
  }
  if (spoken.used.includes(word)) {
    return applyFail(spoken, lines.used(), "used");
  }
  if (!links(index, prev, word, spoken.mode)) {
    return applyFail(spoken, lines.unlink(), "unlink");
  }

  const idiom = Boolean(lookup(index, word));
  const scored: Player = {
    ...player,
    culture: player.culture + (idiom ? 1 : 0),
    zhangyu: player.zhangyu + (idiom ? 0 : 1),
    fails: player.fails + (idiom ? 0 : 1),
    fun: player.fun + (egg ? 3 : 0),
  };
  const reason: SubmitResult["reason"] = idiom ? "ok" : egg ? "egg" : "not-idiom";
  const roast = idiom ? lines.ok() : egg ? egg.roast : lines.okCasual();
  let next = append(
    {
      ...spoken,
      players: replacePlayer(spoken.players, player.id, scored),
      chain: [...spoken.chain, word],
      used: [...spoken.used, word],
      lastHint: null,
      rounds: spoken.rounds + 1,
    },
    {
      kind: "octopus",
      text: roast,
      quote: word,
      tone: egg && !idiom ? "egg" : "ok",
    },
  );

  next = maybeFinish(next);
  if (next.status === "playing") {
    next = announceTurn({
      ...next,
      turn: next.buzz ? spoken.turn : nextIndex(next.players, spoken.turn),
    });
  }
  return { game: next, ok: true, reason };
}

export function pass(index: IdiomIndex, game: Game): SubmitResult {
  if (game.status !== "playing") {
    return { game, ok: false, reason: "finished" };
  }
  const prev = game.chain[game.chain.length - 1];
  const moves = candidates(index, prev, game.mode, game.used);
  const player = game.players[game.turn];
  const spoken = append(game, {
    kind: "player",
    playerId: player.id,
    text: "过",
    tone: "fail",
  });

  if (moves.length === 0) {
    const skipped = append(
      { ...spoken, lastHint: null },
      { kind: "octopus", text: lines.deadEnd(), tone: "hint" },
    );
    return {
      game: announceTurn({
        ...skipped,
        turn: nextIndex(skipped.players, game.turn),
      }),
      ok: true,
      reason: "dead-end",
    };
  }
  return applyFail(spoken, lines.pass(), "empty");
}

export function finishGame(game: Game): Game {
  if (game.status === "finished") return game;
  return settle(game, `提前结束，共 ${game.rounds} 轮。`);
}

export function addFun(game: Game, userId: string, amount = 1): Game {
  const player = game.players.find((item) => item.id === userId);
  if (!player) return game;
  return {
    ...game,
    players: replacePlayer(game.players, userId, {
      ...player,
      fun: player.fun + amount,
    }),
  };
}

export function rankPlayers(game: Game) {
  return [...game.players].sort((a, b) => {
    if (b.culture !== a.culture) return b.culture - a.culture;
    if (a.zhangyu !== b.zhangyu) return a.zhangyu - b.zhangyu;
    return b.fun - a.fun;
  });
}

export function zhangyuKing(game: Game) {
  return computeTitles(game).zhangyu;
}
