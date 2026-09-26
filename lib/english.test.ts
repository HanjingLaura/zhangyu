import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  englishCandidates,
  englishLinks,
  englishWordCount,
  isEnglishWord,
  normalizeEnglish,
  pickEnglishOpening,
} from "./english";

describe("english words", () => {
  it("normalizes and looks up dictionary words", () => {
    assert.equal(normalizeEnglish(" Ocean! "), "ocean");
    assert.equal(isEnglishWord("apple"), true);
    assert.equal(isEnglishWord("APPLE"), true);
    assert.equal(isEnglishWord("xyzzy"), false);
    assert.ok(englishWordCount() > 9000);
  });

  it("links by last letter to first letter", () => {
    assert.equal(englishLinks("ocean", "night"), true);
    assert.equal(englishLinks("ocean", "apple"), false);
    assert.equal(englishLinks("octopus", "school"), true);
  });

  it("opens with a word that has follow-ups", () => {
    const opening = pickEnglishOpening();
    assert.equal(isEnglishWord(opening), true);
    assert.ok(englishCandidates(opening, []).length >= 8);
  });
});
