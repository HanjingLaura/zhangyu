import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createGame, finishGame, submit } from "./engine";
import { historyForUser, historyFromGame, historyToRoom } from "./history";
import { buildIndex } from "./idioms";

const index = buildIndex([
  ["一鸣惊人", "yi", "ren"],
  ["人山人海", "ren", "hai"],
]);

describe("history", () => {
  it("keeps a player's finished chain and danmaku", () => {
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
    const game = finishGame(first.game);
    const record = historyFromGame({
      code: "TEST",
      game,
      danmaku: [{ id: "d1", userId: game.players[0].id, name: "Cora", text: "nbb", at: 1 }],
    });
    assert.deepEqual(record.chain, ["一鸣惊人", "人山人海"]);
    assert.equal(historyForUser([record], game.players[0].id).length, 1);
    assert.equal(historyForUser([record], "nobody").length, 0);
    const room = historyToRoom(record);
    assert.equal(room.game?.chain.join("→"), "一鸣惊人→人山人海");
    assert.equal(room.danmaku[0].text, "nbb");
  });
});
