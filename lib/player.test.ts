import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parsePlayer, playerHeaders, playerPayload } from "./player";

describe("playerHeaders", () => {
  it("keeps Chinese names out of the latin-1 header", () => {
    const headers = playerHeaders({
      id: "uabc123456",
      name: "小章鱼测",
      outfit: "astronaut",
    });
    const raw = headers["x-zy-player"];
    assert.ok(raw);
    for (const ch of raw) assert.ok(ch.charCodeAt(0) <= 255);
    assert.deepEqual(JSON.parse(raw), {
      id: "uabc123456",
      name: "uabc123456",
      outfit: "astronaut",
    });
  });

  it("keeps ascii names in the header", () => {
    const headers = playerHeaders({
      id: "uabc123456",
      name: "Laura",
      outfit: "diver",
    });
    assert.equal(JSON.parse(headers["x-zy-player"]).name, "Laura");
  });
});

describe("parsePlayer", () => {
  it("reads the Chinese name from the JSON body", () => {
    const headers = playerHeaders({
      id: "uabc123456",
      name: "小章鱼测",
      outfit: "astronaut",
    });
    const request = new Request("https://hanjing-laura.vercel.app/zhangyu/api/rooms", {
      headers,
    });
    const user = parsePlayer(request, {
      player: playerPayload({
        id: "uabc123456",
        name: "小章鱼测",
        avatarUrl: undefined,
        shells: 0,
        owned: [],
        outfit: "astronaut",
      }),
    });
    assert.equal(user?.id, "uabc123456");
    assert.equal(user?.name, "小章鱼测");
  });
});
