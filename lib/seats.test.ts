import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MAX_PLAYERS, parseRoomOptions, seatLayout } from "./seats";

describe("seat layout", () => {
  it("keeps 2 to 6 people on a front arc", () => {
    for (let n = 2; n <= MAX_PLAYERS; n++) {
      const spots = Array.from({ length: n }, (_, i) => seatLayout(i, n));
      const xs = spots.map((spot) => spot.left).sort((a, b) => a - b);
      assert.ok(xs[0] > 4 && xs[xs.length - 1] < 96, `${n} people stay on screen`);
      for (let i = 1; i < xs.length; i++) {
        assert.ok(xs[i] - xs[i - 1] > 8, `${n} people need space`);
      }
      assert.ok(spots.every((spot) => spot.top > 66 && spot.top < 76));
    }
  });
});

describe("room options", () => {
  it("only keeps 字接字 / 音接音 and 20 50 100", () => {
    assert.deepEqual(parseRoomOptions({ mode: "pinyin", maxRounds: 20 }), { mode: "pinyin", maxRounds: 20 });
    assert.deepEqual(parseRoomOptions({ mode: "nope", maxRounds: 7 }), { mode: "char", maxRounds: 100 });
  });
});
