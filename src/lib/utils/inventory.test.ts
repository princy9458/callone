import test from "node:test";
import assert from "node:assert/strict";
import {
  buildWarehouseAvailability,
  selectWarehouseForQuantity,
  sumEffectiveAvailability,
} from "./inventory.ts";

test("buildWarehouseAvailability applies warehouse and global blocked stock", () => {
  const result = buildWarehouseAvailability(
    [
      {
        warehouseId: "wh88",
        code: "WH88",
        priority: 10,
        onHand: 12,
        reserved: 2,
        blocked: 1,
        warehouseBlocked: 3,
      },
      {
        warehouseId: "wh90",
        code: "WH90",
        priority: 20,
        onHand: 20,
        reserved: 5,
        blocked: 0,
        warehouseBlocked: 0,
      },
    ],
    4
  );

  assert.deepEqual(
    result.map((entry) => ({
      warehouseId: entry.warehouseId,
      appliedGlobalBlocked: entry.appliedGlobalBlocked,
      effectiveAvailable: entry.effectiveAvailable,
    })),
    [
      {warehouseId: "wh88", appliedGlobalBlocked: 4, effectiveAvailable: 2},
      {warehouseId: "wh90", appliedGlobalBlocked: 0, effectiveAvailable: 15},
    ]
  );
});

test("selectWarehouseForQuantity chooses the first warehouse with enough effective stock", () => {
  const selected = selectWarehouseForQuantity(
    [
      {
        warehouseId: "wh88",
        code: "WH88",
        priority: 10,
        onHand: 10,
        reserved: 0,
        blocked: 0,
        warehouseBlocked: 0,
        appliedGlobalBlocked: 0,
        effectiveAvailable: 3,
      },
      {
        warehouseId: "wh90",
        code: "WH90",
        priority: 20,
        onHand: 10,
        reserved: 0,
        blocked: 0,
        warehouseBlocked: 0,
        appliedGlobalBlocked: 0,
        effectiveAvailable: 8,
      },
    ],
    5
  );

  assert.equal(selected?.warehouseId, "wh90");
});

test("sumEffectiveAvailability totals remaining stock across warehouses", () => {
  const result = sumEffectiveAvailability([
    {
      warehouseId: "wh88",
      code: "WH88",
      priority: 10,
      onHand: 10,
      reserved: 0,
      blocked: 0,
      warehouseBlocked: 0,
      appliedGlobalBlocked: 0,
      effectiveAvailable: 6,
    },
    {
      warehouseId: "wh90",
      code: "WH90",
      priority: 20,
      onHand: 10,
      reserved: 0,
      blocked: 0,
      warehouseBlocked: 0,
      appliedGlobalBlocked: 0,
      effectiveAvailable: 8,
    },
  ]);

  assert.equal(result, 14);
});
