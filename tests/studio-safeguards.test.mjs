import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";

const studio = await readFile(new URL("../app/studio/studio.tsx", import.meta.url), "utf8");

test("non-negotiable Studio conditions override the additive score", () => {
  for (const answerIndex of [7, 9, 11, 14, 17]) {
    assert.match(studio, new RegExp(`answers\\[${answerIndex}\\]===-3`));
  }
  assert.match(studio, /controllingConditions\.length\?\{key:"repair"/);
  assert.match(studio, /Positive answers elsewhere cannot cancel it out/);
});

test("the rendered and exported records explain controlling conditions", () => {
  assert.match(studio, /CONTROLLING CONDITIONS/);
  assert.match(studio, /These answers prevent an AI test for now/);
  assert.match(studio, /Non-negotiable conditions cannot be offset by the score/);
});
