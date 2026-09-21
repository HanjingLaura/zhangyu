import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeShells, getOutfit } from "./wardrobe";
import type { GameTitles, Player } from "./types";

function player(id: string, culture: number): Player {
  return {
    id,
    name: id,
    tentacles: 8,
    culture,
    zhangyu: 0,
    fun: 0,
    fails: 0,
    out: false,
  };
}

describe("shells", () => {
  it("pays a base plus culture and titles", () => {
    const culture = player("a", 2);
    const zhangyu = player("b", 0);
    const titles = {
      culture,
      zhangyu,
      fun: culture,
      uncultured: zhangyu,
    } as GameTitles;
    assert.equal(computeShells(culture, titles), 6 + 6 + 10);
    assert.equal(computeShells(zhangyu, titles), 6 + 4);
  });
});

describe("outfits", () => {
  it("falls back to 常服", () => {
    assert.equal(getOutfit("nope").id, "plain");
    assert.equal(getOutfit("ranger").price, 24);
  });

  it("clips each face to that outfit's helmet opening", () => {
    for (const id of ["plain", "astronaut", "ranger", "diver", "office", "chef", "sailor", "jinyi"] as const) {
      const outfit = getOutfit(id);
      assert.ok(outfit.mask, `${id} needs a visor mask`);
      assert.match(outfit.mask ?? "", new RegExp(`${id}-mask\\.webp$`));
      assert.ok(outfit.hole);
    }
  });
});
