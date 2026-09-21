import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import {
  buyOutfitLocal,
  listLocalHistory,
  loadCurrentUser,
  loginLocal,
  logoutLocal,
  registerLocal,
  syncFinishedGame,
  useLocalStorage,
} from "./local-user";
import type { RoomSnapshot } from "./types";

class MemoryStorage {
  private data = new Map<string, string>();
  getItem(key: string) {
    return this.data.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.data.set(key, value);
  }
  removeItem(key: string) {
    this.data.delete(key);
  }
}

function finishedRoom(userId: string): RoomSnapshot {
  const player = {
    id: userId,
    name: "甲甲",
    tentacles: 8,
    culture: 2,
    zhangyu: 0,
    fun: 0,
    fails: 0,
    out: false,
  };
  const other = {
    id: "ubbb222222",
    name: "乙乙",
    tentacles: 8,
    culture: 0,
    zhangyu: 3,
    fun: 0,
    fails: 1,
    out: false,
  };
  return {
    code: "TEST",
    hostId: userId,
    members: [
      { id: userId, name: "甲甲" },
      { id: other.id, name: "乙乙" },
    ],
    status: "finished",
    mode: "char",
    tentacles: 8,
    opening: "yiming",
    maxRounds: 20,
    game: {
      mode: "char",
      players: [player, other],
      turn: 0,
      maxTentacles: 8,
      maxRounds: 20,
      rounds: 2,
      chain: ["一鸣惊人", "人山人海"],
      used: ["一鸣惊人", "人山人海"],
      messages: [],
      status: "finished",
      winnerId: userId,
      lastHint: null,
      titles: {
        fun: player,
        uncultured: other,
        zhangyu: other,
        culture: player,
      },
      seq: 3,
      payouts: { [userId]: 22, [other.id]: 10 },
    },
    danmaku: [{ id: "d1", userId, name: "甲甲", text: "nbb", at: 1 }],
  };
}

describe("local user", () => {
  beforeEach(() => {
    useLocalStorage(new MemoryStorage());
  });

  it("keeps nickname, shells, clothes, and history on this browser", async () => {
    const user = await registerLocal("甲甲", "pass");
    assert.equal(user.outfit, "astronaut");
    assert.equal(loadCurrentUser()?.id, user.id);
    const paid = syncFinishedGame(finishedRoom(user.id));
    assert.equal(paid?.shells, 22);
    assert.equal(listLocalHistory().length, 1);
    assert.equal(syncFinishedGame(finishedRoom(user.id))?.shells, 22);
    const bought = buyOutfitLocal("diver");
    assert.equal(bought.outfit, "diver");
    assert.equal(bought.shells, 6);
    logoutLocal();
    assert.equal(loadCurrentUser(), null);
    const again = await loginLocal("甲甲", "pass");
    assert.equal(again.shells, 6);
    assert.equal(again.outfit, "diver");
  });
});
