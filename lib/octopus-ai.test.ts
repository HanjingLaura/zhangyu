import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseJsonObject } from "./bailian";
import { parseRoast, parseSettle } from "./octopus-ai";

describe("bailian json", () => {
  it("reads a fenced object", () => {
    const data = parseJsonObject('```json\n{"roast":"这叫成语？"}\n```');
    assert.equal(data?.roast, "这叫成语？");
  });
});

describe("octopus parse", () => {
  it("clips a roast and falls back", () => {
    assert.equal(parseRoast('{"roast":"这叫成语？"}', "nbb。").roast, "这叫成语？");
    assert.equal(parseRoast("nope", "先写一个。").roast, "先写一个。");
  });

  it("reads 最丈育 and 最有文化", () => {
    const settled = parseSettle(
      '{"roast":"散了。","zhangyu":"Cora","culture":"Laura","notes":{"zhangyu":"龙年大吉","culture":"接得正经"}}',
      "结束。",
    );
    assert.equal(settled.zhangyu, "Cora");
    assert.equal(settled.culture, "Laura");
    assert.equal(settled.notes.zhangyu, "龙年大吉");
    assert.equal(settled.notes.culture, "接得正经");
  });
});
