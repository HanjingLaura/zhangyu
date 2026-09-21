import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { createRoom, getRoom, joinRoom, leaveRoom, resetMemoryRooms, startRoom, playRoom } from "./store";
import type { UserPublic } from "./types";

function user(id: string, name: string): UserPublic {
  return {
    id,
    name,
    shells: 0,
    owned: ["astronaut"],
    outfit: "astronaut",
  };
}

describe("shared rooms", () => {
  beforeEach(() => {
    resetMemoryRooms();
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  it("lets two local players share a room code", async () => {
    const host = user("uaaa111111", "甲甲");
    const guest = user("ubbb222222", "乙乙");
    const created = await createRoom(host, { mode: "char", maxRounds: 20 });
    assert.equal(created.members.length, 1);
    const joined = await joinRoom(created.code, guest);
    assert.equal(joined.members.length, 2);
    const playing = await startRoom(created.code, host.id);
    assert.equal(playing.status, "playing");
    assert.equal(playing.game?.players[0].id, host.id);
    const finished = await playRoom(created.code, host.id, "finish");
    assert.equal(finished.status, "finished");
    assert.ok(finished.game?.payouts?.[host.id]);
    await leaveRoom(created.code, guest.id);
    await leaveRoom(created.code, host.id);
    assert.equal(await getRoom(created.code), null);
  });
});
