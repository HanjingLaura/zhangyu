import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { lastSpeeches } from "./speeches";

describe("lastSpeeches", () => {
  it("keeps the last idiom on each player and strips 开局", () => {
    const { players, octopus } = lastSpeeches([
      { id: "1", kind: "octopus", text: "开局：一鸣惊人" },
      { id: "2", kind: "player", playerId: "p1", text: "人山人海" },
      { id: "3", kind: "octopus", text: "接上了。" },
      { id: "4", kind: "player", playerId: "p2", text: "海阔天空" },
      { id: "5", kind: "player", playerId: "p1", text: "空前绝后" },
    ]);
    assert.equal(octopus, "接上了。");
    assert.equal(players.get("p1"), "空前绝后");
    assert.equal(players.get("p2"), "海阔天空");
  });
});
