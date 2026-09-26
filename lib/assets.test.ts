import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assetUrls, backdropKind } from "./assets";

describe("assets", () => {
  it("keeps scene photos and every outfit decoded", () => {
    const urls = assetUrls();
    for (const path of ["/sand.webp", "/sea.webp", "/house.webp?v=4", "/interior.webp?v=8", "/octopus.webp"]) {
      assert.ok(
        urls.some((url) => url.includes(path)),
        path,
      );
    }
    for (const path of [
      "/suit-astronaut.webp",
      "/suit-astronaut-mask.webp",
      "/suit-ranger.webp",
      "/outfits/5.webp",
      "/outfits/5-mask.webp",
      "/outfits/6.webp",
      "/outfits/7.webp",
      "/outfits/8.webp",
    ]) {
      assert.ok(
        urls.some((url) => url.includes(path)),
        path,
      );
    }
  });

  it("picks a backdrop that is already on screen", () => {
    assert.equal(backdropKind("auth", false), "sea");
    assert.equal(backdropKind("home", false), "home");
    assert.equal(backdropKind("shop", false), "sand");
    assert.equal(backdropKind("lobby", false), "room");
    assert.equal(backdropKind("play", true), "room");
    assert.equal(backdropKind("play", false), "sand");
    assert.equal(backdropKind("boot", false), "home");
  });
});
