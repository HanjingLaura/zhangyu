import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createGame, finishGame, submit } from "./engine";
import { buildIndex } from "./idioms";
import { buildRecordPoster, formatRecord, wrapChain } from "./record";
import type { RoomSnapshot } from "./types";

const index = buildIndex([
  ["一鸣惊人", "yi", "ren"],
  ["人山人海", "ren", "hai"],
]);

describe("record poster", () => {
  it("packs the chain and danmaku for the settlement long image", () => {
    const first = submit(
      index,
      createGame(index, {
        names: ["Cora", "Lauraura"],
        mode: "char",
        tentacles: 2,
        opening: "yiming",
        maxRounds: 1,
      }),
      "人山人海",
    );
    const room: RoomSnapshot = {
      code: "TEST",
      hostId: "p1",
      members: first.game.players,
      status: "finished",
      mode: "char",
      tentacles: 2,
      opening: "yiming",
      maxRounds: 1,
      game: finishGame(first.game),
      danmaku: [{ id: "d1", userId: "p1", name: "Cora", text: "nbb", at: 1 }],
    };
    const poster = buildRecordPoster(room);
    assert.ok(poster);
    assert.deepEqual(poster.chain, ["一鸣惊人", "人山人海"]);
    assert.deepEqual(poster.danmaku, [{ name: "Cora", text: "nbb" }]);
    assert.equal(poster.mode, "字接字");
    assert.match(formatRecord(room), /一鸣惊人 → 人山人海/);
  });

  it("wraps a long chain into rows", () => {
    const words = ["一鸣惊人", "人山人海", "海阔天空"];
    assert.equal(wrapChain(words, 180, 24).length, 3);
    assert.deepEqual(wrapChain(words, 900, 24), [words]);
  });
});
