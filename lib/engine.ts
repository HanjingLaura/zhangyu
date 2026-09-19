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
  IdiomIndex,
  Player,
  SubmitResult,
} from "./types";

function uid(prefix: string, seq: number) {
  return `${prefix}-${seq}`;
}

function living(players: Player[]) {
  return players.filter((player) => !player.out);
}

function nextLivingIndex(players: Player[], from: number) {
  const total = players.length;
  for (let step = 1; step <= total; step += 1) {
    const index = (from + step) % total;
    if (!players[index].out) return index;
  }
  return from;
}

function replacePlayer(players: Player[], id: string, next: Player) {
  return players.map((player) => (player.id === id ? next : player));
}

function hurt(player: Player): Player {
  const tentacles = Math.max(0, player.tentacles - 1);
  return {
    ...player,
    tentacles,
    zhangyu: player.zhangyu + 1,
    out: tentacles <= 0,
  };
}

function maybeFinish(game: Game): Game {
  const alive = living(game.players);
  if (alive.length === 1) {
    const winner = alive[0];
    return {
      ...game,
      status: "finished",
      winnerId: winner.id,
      lastHint: null,
      seq: game.seq + 1,
      messages: [
        ...game.messages,
        {
          id: uid("sys", game.seq + 1),
          kind: "octopus",
          text: `${winner.name} 活到了最后。${lines.win()}`,
          tone: "win",
        },
      ],
    };
  }
  if (alive.length === 0) {
    const ranked = [...game.players].sort(
      (a, b) => b.culture - a.culture || a.zhangyu - b.zhangyu,
    );
    const winner = ranked[0];
    return {
      ...game,
      status: "finished",
      winnerId: winner.id,
      lastHint: null,
      seq: game.seq + 1,
      messages: [
        ...game.messages,
        {
          id: uid("sys", game.seq + 1),
          kind: "octopus",
          text: `全员触手掉光。按文化分，${winner.name} 勉强算赢。`,
          tone: "win",
        },
      ],
    };
  }
  return game;
}

function announceTurn(game: Game): Game {
  const player = game.players[game.turn];
  const prev = game.chain[game.chain.length - 1];
  return {
    ...game,
    seq: game.seq + 1,
    messages: [
      ...game.messages,
      {
        id: uid("turn", game.seq + 1),
        kind: "system",
        text: lines.yourTurn(player.name, lastChar(prev)),
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
): SubmitResult {
  const player = game.players[game.turn];
  const nextPlayer = hurt(player);
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

  if (nextPlayer.out) {
    next = append(next, {
      kind: "octopus",
      text: `${player.name} 触手掉光，出局。`,
      tone: "fail",
    });
  }

  next = maybeFinish(next);
  if (next.status === "playing") {
    next = announceTurn({
      ...next,
      turn: nextLivingIndex(next.players, game.turn),
    });
  }
  return { game: next, ok: false, reason };
}

export function createGame(index: IdiomIndex, config: GameConfig): Game {
  const names = config.names.map((name) => name.trim()).filter(Boolean);
  const players: Player[] = names.map((name, i) => ({
    id: `p${i + 1}`,
    name,
    tentacles: config.tentacles,
    culture: 0,
    zhangyu: 0,
    out: false,
  }));

  const opening = pickOpening(index, config.opening);
  const seed: Game = {
    mode: config.mode,
    players,
    turn: 0,
    maxTentacles: config.tentacles,
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
      text: `${lines.hint()} 可以试试「${word}」。`,
      quote: `${player.name} 偷看词典`,
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

  if (egg) {
    return applyFail(spoken, egg.roast, "egg", "egg");
  }
  if (!lookup(index, word)) {
    return applyFail(spoken, lines.notIdiom(), "not-idiom");
  }
  if (spoken.used.includes(word)) {
    return applyFail(spoken, lines.used(), "used");
  }
  if (!links(index, prev, word, spoken.mode)) {
    return applyFail(spoken, lines.unlink(), "unlink");
  }

  const scored: Player = {
    ...player,
    culture: player.culture + 1,
  };
  let next = append(
    {
      ...spoken,
      players: replacePlayer(spoken.players, player.id, scored),
      chain: [...spoken.chain, word],
      used: [...spoken.used, word],
      lastHint: null,
    },
    {
      kind: "octopus",
      text: lines.ok(),
      quote: word,
      tone: "ok",
    },
  );

  next = maybeFinish(next);
  if (next.status === "playing") {
    next = announceTurn({
      ...next,
      turn: nextLivingIndex(next.players, spoken.turn),
    });
  }
  return { game: next, ok: true, reason: "ok" };
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
        turn: nextLivingIndex(skipped.players, game.turn),
      }),
      ok: true,
      reason: "dead-end",
    };
  }
  return applyFail(spoken, lines.pass(), "empty");
}

export function rankPlayers(game: Game) {
  return [...game.players].sort((a, b) => {
    if (a.out !== b.out) return a.out ? 1 : -1;
    if (b.culture !== a.culture) return b.culture - a.culture;
    return a.zhangyu - b.zhangyu;
  });
}
