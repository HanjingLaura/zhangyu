import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  computeTitles,
  createGame,
  finishGame,
  hint,
  pass,
  submit,
  zhangyuKing,
} from "./engine";
import { formatRecord } from "./record";
import { buildIndex } from "./idioms";
import type { RoomSnapshot } from "./types";

const index = buildIndex([
  ["一鸣惊人", "yi", "ren"],
  ["人山人海", "ren", "hai"],
  ["海阔天空", "hai", "kong"],
  ["空前绝后", "kong", "hou"],
  ["后来居上", "hou", "shang"],
  ["龙飞凤舞", "long", "wu"],
  ["舞文弄墨", "wu", "mo"],
  ["人才辈出", "ren", "chu"],
]);

function start(maxRounds = 100) {
  return createGame(index, {
    names: ["Cora", "Lauraura"],
    mode: "char",
    tentacles: 2,
    opening: "yiming",
    maxRounds,
  });
}

describe("createGame", () => {
  it("opens with 一鸣惊人 and asks for 人", () => {
    const game = start();
    assert.equal(game.chain[0], "一鸣惊人");
    assert.match(game.messages.at(-1)?.text ?? "", /接「人」/);
    assert.equal(game.players[0].name, "Cora");
    assert.equal(game.maxRounds, 100);
  });
});

describe("submit", () => {
  it("accepts a real linked idiom and moves clockwise", () => {
    const result = submit(index, start(), "人山人海");
    assert.equal(result.ok, true);
    assert.deepEqual(result.game.chain, ["一鸣惊人", "人山人海"]);
    assert.equal(result.game.players[0].culture, 1);
    assert.equal(result.game.rounds, 1);
    assert.equal(result.game.turn, 1);
    const playerLines = result.game.messages.filter(
      (message) => message.kind === "player" && message.text === "人山人海",
    );
    assert.equal(playerLines.length, 1);
  });

  it("roasts fake office classics without kicking anyone out", () => {
    const game = createGame(index, {
      names: ["Cora", "Lauraura"],
      mode: "char",
      tentacles: 2,
      opening: "longfei",
      maxRounds: 100,
    });
    const result = submit(index, game, "舞动青春");
    assert.equal(result.ok, true);
    assert.equal(result.reason, "egg");
    assert.deepEqual(result.game.chain, ["龙飞凤舞", "舞动青春"]);
    assert.equal(result.game.rounds, 1);
    assert.equal(result.game.players[0].out, false);
    assert.equal(result.game.players[0].zhangyu, 1);
    assert.equal(result.game.players[0].fun, 3);
    assert.equal(result.game.players[0].culture, 0);
    assert.match(result.game.messages.map((m) => m.text).join("\n"), /广播体操/);
  });

  it("rejects unknown words and broken links", () => {
    const unknown = submit(index, start(), "春天来了");
    assert.equal(unknown.ok, false);
    assert.equal(unknown.reason, "unlink");
    assert.deepEqual(unknown.game.chain, ["一鸣惊人"]);
    const short = submit(index, start(), "人海");
    assert.equal(short.reason, "not-four");
    const unlink = submit(index, start(), "龙飞凤舞");
    assert.equal(unlink.reason, "unlink");
    const used = submit(index, submit(index, start(), "人山人海").game, "一鸣惊人");
    assert.equal(used.reason, "used");
  });

  it("counts four linked characters even when they are not idioms", () => {
    const result = submit(index, start(), "人来疯了");
    assert.equal(result.ok, true);
    assert.equal(result.reason, "not-idiom");
    assert.deepEqual(result.game.chain, ["一鸣惊人", "人来疯了"]);
    assert.equal(result.game.rounds, 1);
    assert.equal(result.game.players[0].culture, 0);
    assert.equal(result.game.players[0].zhangyu, 1);
  });

  it("finishes when casual four-character links fill the round limit", () => {
    const first = submit(index, start(2), "人来疯了");
    const second = submit(index, first.game, "了却心事");
    assert.equal(second.ok, true);
    assert.equal(second.reason, "not-idiom");
    assert.equal(second.game.rounds, 2);
    assert.equal(second.game.status, "finished");
    assert.deepEqual(second.game.chain, ["一鸣惊人", "人来疯了", "了却心事"]);
  });

  it("finishes after the configured number of rounds", () => {
    const first = submit(index, start(2), "人山人海");
    const second = submit(index, first.game, "海阔天空");
    assert.equal(second.game.rounds, 2);
    assert.equal(second.game.status, "finished");
    assert.ok(second.game.titles);
    assert.equal(second.game.titles?.culture.name, "Cora");
  });
});

describe("hint and pass", () => {
  it("charges 丈育值 for peeking", () => {
    const game = hint(index, start());
    assert.ok(game.lastHint === "人山人海" || game.lastHint === "人才辈出");
    assert.equal(game.players[0].zhangyu, 2);
  });

  it("lets a dead end pass free", () => {
    const tight = buildIndex([
      ["一鸣惊人", "yi", "ren"],
      ["人山人海", "ren", "hai"],
    ]);
    const game = createGame(tight, {
      names: ["A", "B"],
      mode: "char",
      tentacles: 2,
      opening: "yiming",
      maxRounds: 100,
    });
    const after = submit(tight, game, "人山人海").game;
    const skipped = pass(tight, after);
    assert.equal(skipped.reason, "dead-end");
    assert.equal(skipped.game.players[1].fails, 0);
  });
});

describe("settlement", () => {
  it("names titles after the table ends", () => {
    const first = submit(index, start(), "春天来了");
    const second = submit(index, first.game, "人山人海");
    const ended = finishGame(second.game);
    const titles = computeTitles(ended);
    assert.equal(zhangyuKing(ended).name, "Cora");
    assert.equal(titles.uncultured.name, "Cora");
    assert.equal(titles.culture.name, "Lauraura");
    assert.equal(ended.status, "finished");
  });

  it("does not give 最丈育 and 最有文化 to the same person", () => {
    const first = submit(index, start(), "人山人海");
    const second = submit(index, first.game, "海阔天空");
    const third = submit(index, second.game, "空前绝后");
    const titles = computeTitles(finishGame(third.game));
    assert.equal(titles.culture.name, "Cora");
    assert.equal(titles.zhangyu.name, "Lauraura");
    assert.notEqual(titles.culture.id, titles.zhangyu.id);
  });

  it("exports the chain and scores", () => {
    const first = submit(index, start(1), "人山人海");
    const room: RoomSnapshot = {
      code: "TEST",
      hostId: "p1",
      members: first.game.players,
      status: "finished",
      mode: "char",
      tentacles: 2,
      opening: "yiming",
      maxRounds: 1,
      game: first.game,
      danmaku: [{ id: "d1", userId: "p1", name: "Cora", text: "nbb", at: 1 }],
    };
    const text = formatRecord(room);
    assert.match(text, /一鸣惊人 → 人山人海/);
    assert.match(text, /Cora/);
    assert.match(text, /nbb/);
    assert.match(text, /最丈育/);
    assert.match(text, /最有文化/);
  });
});

describe("clockwise turns", () => {
  it("hands the next seat to the left around the table", () => {
    const game = createGame(index, {
      names: ["南", "西", "北", "东"],
      mode: "char",
      tentacles: 8,
      opening: "yiming",
      maxRounds: 100,
    });
    const first = submit(index, game, "人山人海");
    assert.equal(first.game.turn, 1);
    assert.equal(first.game.players[first.game.turn].name, "西");
    const second = submit(index, first.game, "海阔天空");
    assert.equal(second.game.players[second.game.turn].name, "北");
  });
});

describe("english mode", () => {
  it("accepts a linked dictionary word and counts a round", () => {
    const game = createGame(index, {
      names: ["Cora", "Lauraura"],
      mode: "english",
      tentacles: 2,
      opening: "yiming",
      maxRounds: 20,
    });
    const prev = game.chain[0];
    assert.match(prev, /^[a-z]{2,}$/);
    const known: Record<string, string> = {
      n: "night",
      r: "river",
      s: "school",
      e: "earth",
      t: "table",
      d: "dance",
      l: "light",
      c: "chain",
    };
    const word = known[prev.slice(-1)] ?? "apple";
    const result = submit(index, game, word);
    assert.equal(result.ok, true, result.reason);
    assert.equal(result.game.rounds, 1);
    assert.equal(result.game.chain.at(-1), word);
    assert.equal(result.game.players[0].culture, 1);
  });

  it("rejects a non-word and a broken English link", () => {
    const game = {
      ...createGame(index, {
        names: ["A", "B"],
        mode: "english",
        tentacles: 2,
        opening: "yiming",
        maxRounds: 20,
      }),
      chain: ["ocean"],
      used: ["ocean"],
    };
    const fake = submit(index, game, "xyzzy");
    assert.equal(fake.ok, false);
    assert.equal(fake.reason, "not-word");
    assert.equal(fake.game.rounds, 0);
    const unlink = submit(index, game, "apple");
    assert.equal(unlink.reason, "unlink");
    const ok = submit(index, game, "night");
    assert.equal(ok.ok, true);
    assert.deepEqual(ok.game.chain, ["ocean", "night"]);
  });
});

describe("pinyin mode", () => {
  it("allows same-sound links", () => {
    const game = createGame(index, {
      names: ["A", "B"],
      mode: "pinyin",
      tentacles: 2,
      opening: "yiming",
      maxRounds: 100,
    });
    const result = submit(index, game, "人才辈出");
    assert.equal(result.ok, true);
  });
});

describe("buzz", () => {
  it("lets the faster player take the round", () => {
    const game = createGame(index, {
      names: ["Cora", "Lauraura"],
      mode: "char",
      tentacles: 2,
      opening: "yiming",
      maxRounds: 100,
      buzz: true,
    });
    assert.match(game.messages.at(-1)?.text ?? "", /抢答/);
    const stolen = submit(
      index,
      { ...game, turn: 1 },
      "人山人海",
    );
    assert.equal(stolen.ok, true);
    assert.equal(stolen.game.players[1].culture, 1);
    assert.equal(stolen.game.players[0].culture, 0);
    assert.equal(stolen.game.turn, 1);
    assert.match(stolen.game.messages.at(-1)?.text ?? "", /抢答/);
  });
});
