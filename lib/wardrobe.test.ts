import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeShells, getOutfit, shellPayout } from "./wardrobe";
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
    assert.deepEqual(shellPayout(culture, titles), {
      base: 6,
      fromCulture: 6,
      cultureBonus: 10,
      zhangyuBonus: 0,
      amount: 22,
    });
  });

  it("caps a round at 50", () => {
    const culture = player("a", 20);
    const titles = {
      culture,
      zhangyu: player("b", 0),
      fun: culture,
      uncultured: culture,
    } as GameTitles;
    assert.equal(computeShells(culture, titles), 50);
  });
});

describe("outfits", () => {
  it("falls back to 宇航服", () => {
    assert.equal(getOutfit("nope").id, "astronaut");
    assert.equal(getOutfit("plain").id, "astronaut");
    assert.equal(getOutfit("ranger").price, 24);
    assert.equal(getOutfit("astronaut").price, 0);
  });

  it("clips each face to that outfit's helmet opening", () => {
    for (const id of ["astronaut", "ranger", "diver"] as const) {
      const outfit = getOutfit(id);
      assert.ok(outfit.mask, `${id} needs a visor mask`);
      assert.match(outfit.mask ?? "", new RegExp(`${id}-mask\\.webp$`));
      assert.ok(outfit.hole);
    }
    assert.equal(getOutfit("crab").name, "蟹老板");
    assert.equal(getOutfit("sponge").name, "海绵厨师");
  });
});
