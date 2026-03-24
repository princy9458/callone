import test from "node:test";
import assert from "node:assert/strict";
import {calculateDiscountBreakdown, sumDiscountBreakdowns} from "./discounts.ts";

test("calculateDiscountBreakdown handles exclusive percentage discounts", () => {
  const result = calculateDiscountBreakdown({
    amount: 1000,
    gstRate: 18,
    discountType: "exclusive",
    discountValue: 10,
  });

  assert.deepEqual(result, {
    discountType: "exclusive",
    discountValue: 10,
    discountAmount: 100,
    taxableAmount: 900,
    taxAmount: 162,
    finalAmount: 1062,
  });
});

test("calculateDiscountBreakdown handles flat discounts without GST", () => {
  const result = calculateDiscountBreakdown({
    amount: 1500,
    gstRate: 0,
    discountType: "flat",
    discountValue: 10,
  });

  assert.deepEqual(result, {
    discountType: "flat",
    discountValue: 10,
    discountAmount: 150,
    taxableAmount: 1350,
    taxAmount: 0,
    finalAmount: 1350,
  });
});

test("sumDiscountBreakdowns accumulates order totals", () => {
  const result = sumDiscountBreakdowns([
    {
      discountType: "exclusive",
      discountValue: 10,
      discountAmount: 100,
      taxableAmount: 900,
      taxAmount: 162,
      finalAmount: 1062,
    },
    {
      discountType: "flat",
      discountValue: 5,
      discountAmount: 50,
      taxableAmount: 450,
      taxAmount: 0,
      finalAmount: 450,
    },
  ]);

  assert.deepEqual(result, {
    discountAmount: 150,
    taxableAmount: 1350,
    taxAmount: 162,
    finalAmount: 1512,
  });
});
