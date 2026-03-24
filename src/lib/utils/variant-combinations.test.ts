import test from "node:test";
import assert from "node:assert/strict";
import {generateVariantCombinations} from "./variant-combinations.ts";

test("generateVariantCombinations builds cartesian product for enabled options", () => {
  const result = generateVariantCombinations([
    {key: "color", label: "Color", values: ["Blue", "White"]},
    {key: "size", label: "Size", values: ["S", "M"]},
  ]);

  assert.equal(result.length, 4);
  assert.deepEqual(result[0], {
    title: "Blue / S",
    optionValues: {color: "Blue", size: "S"},
  });
  assert.deepEqual(result[3], {
    title: "White / M",
    optionValues: {color: "White", size: "M"},
  });
});

test("generateVariantCombinations ignores empty and non-variant options", () => {
  const result = generateVariantCombinations([
    {key: "color", label: "Color", values: ["Blue"]},
    {key: "fit", label: "Fit", values: [], useForVariants: true},
    {key: "note", label: "Note", values: ["Special"], useForVariants: false},
  ]);

  assert.deepEqual(result, [
    {
      title: "Blue",
      optionValues: {color: "Blue"},
    },
  ]);
});
