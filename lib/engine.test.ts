import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createGame, hint, pass, submit, zhangyuKing } from "./engine";
import { buildIndex } from "./idioms";

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

function start() {
  return createGame(index, {
    names: ["Cora", "Lauraura"],
    mode: "char",
    tentacles: 2,
    opening: "yiming",
  });
}

describe("createGame", () => {
  it("opens with 一鸣惊人 and asks for 人", () => {
    const game = start();
    assert.equal(game.chain[0], "一鸣惊人");
    assert.match(game.messages.at(-1)?.text ?? "", /接到「人」/);
    assert.equal(game.players[0].name, "Cora");
  });
});

describe("submit", () => {
  it("accepts a real linked idiom", () => {
    const result = submit(index, start(), "人山人海");
    assert.equal(result.ok, true);
    assert.deepEqual(result.game.chain, ["一鸣惊人", "人山人海"]);
    assert.equal(result.game.players[0].culture, 1);
    assert.equal(result.game.turn, 1);
    const playerLines = result.game.messages.filter(
      (message) => message.kind === "player" && message.text === "人山人海",
    );
    assert.equal(playerLines.length, 1);
  });

  it("roasts fake office classics", () => {
    const result = submit(index, start(), "龙年大吉");
    assert.equal(result.ok, false);
    assert.equal(result.reason, "egg");
    assert.equal(result.game.players[0].tentacles, 1);
    assert.equal(result.game.players[0].zhangyu, 1);
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

  it("eliminates a player and can finish the table", () => {
    const first = submit(index, start(), "春天来了");
    const second = submit(index, first.game, "人山人海");
    const third = submit(index, second.game, "猪年大吉");
    assert.equal(third.game.players[0].out, true);
    assert.equal(third.game.status, "finished");
    assert.equal(third.game.winnerId, "p2");
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
    });
    const after = submit(tight, game, "人山人海").game;
    const skipped = pass(tight, after);
    assert.equal(skipped.reason, "dead-end");
    assert.equal(skipped.game.players[1].tentacles, 2);
  });
});

describe("settlement", () => {
  it("names the 丈育王 by score", () => {
    const first = submit(index, start(), "春天来了");
    const second = submit(index, first.game, "人山人海");
    const king = zhangyuKing(second.game);
    assert.equal(king.name, "Cora");
    assert.ok(king.zhangyu > 0);
  });
});

describe("pinyin mode", () => {
  it("allows same-sound links", () => {
    const game = createGame(index, {
      names: ["A", "B"],
      mode: "pinyin",
      tentacles: 2,
      opening: "yiming",
    });
    const result = submit(index, game, "人才辈出");
    assert.equal(result.ok, true);
  });
});
