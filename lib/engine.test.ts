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
    const result = submit(index, start(), "龙年大吉");
    assert.equal(result.ok, false);
    assert.equal(result.reason, "egg");
    assert.equal(result.game.players[0].out, false);
    assert.equal(result.game.players[0].zhangyu, 1);
    assert.equal(result.game.players[0].fun, 3);
    assert.equal(result.game.turn, 1);
    assert.match(result.game.messages.map((m) => m.text).join("\n"), /成语/);
  });

  it("rejects unknown words and broken links", () => {
    const unknown = submit(index, start(), "春天来了");
    assert.equal(unknown.reason, "egg");
    const unlink = submit(index, start(), "龙飞凤舞");
    assert.equal(unlink.reason, "unlink");
    const used = submit(index, submit(index, start(), "人山人海").game, "一鸣惊人");
    assert.equal(used.reason, "used");
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
    assert.match(text, /最有意思/);
    assert.match(text, /最没文化/);
    assert.match(text, /最丈育/);
    assert.match(text, /分最高/);
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
