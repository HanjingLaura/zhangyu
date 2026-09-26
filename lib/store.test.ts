import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { englishCandidates } from "./english";
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

  it("lets the faster guest take a buzz round", async () => {
    const host = user("uaaa111111", "甲甲");
    const guest = user("ubbb222222", "乙乙");
    const created = await createRoom(host, { mode: "char", maxRounds: 20, buzz: true });
    assert.equal(created.buzz, true);
    await joinRoom(created.code, guest);
    const playing = await startRoom(created.code, host.id);
    assert.equal(playing.game?.buzz, true);
    const prev = playing.game?.chain.at(-1);
    const stolen = await playRoom(created.code, guest.id, "submit", "人来疯了", prev);
    assert.equal(stolen.game?.rounds, 1);
    assert.deepEqual(stolen.game?.chain.slice(-1), ["人来疯了"]);
    assert.equal(stolen.game?.players.find((player) => player.id === guest.id)?.zhangyu, 1);
  });

  it("plays an English word chain", async () => {
    const host = user("uaaa111111", "甲甲");
    const guest = user("ubbb222222", "乙乙");
    const created = await createRoom(host, { mode: "english", maxRounds: 20 });
    assert.equal(created.mode, "english");
    await joinRoom(created.code, guest);
    const playing = await startRoom(created.code, host.id);
    const prev = playing.game?.chain.at(-1) ?? "";
    assert.match(prev, /^[a-z]{2,}$/);
    const word = englishCandidates(prev, playing.game?.used ?? [])[0];
    assert.ok(word);
    const moved = await playRoom(created.code, host.id, "submit", word, prev);
    assert.equal(moved.game?.rounds, 1);
    assert.equal(moved.game?.chain.at(-1), word);
    assert.equal(moved.game?.players[0].culture, 1);
  });
});
