export type WarehouseAvailabilityInput = {
  warehouseId: string;
  code?: string;
  priority: number;
  onHand: number;
  reserved: number;
  blocked: number;
  warehouseBlocked: number;
};

export type WarehouseAvailability = WarehouseAvailabilityInput & {
  appliedGlobalBlocked: number;
  effectiveAvailable: number;
};

function normalizeQuantity(value: number) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

export function buildWarehouseAvailability(
  levels: WarehouseAvailabilityInput[],
  globalBlocked: number
) {
  const sortedLevels = [...levels].sort(
    (left, right) =>
      left.priority - right.priority || left.code?.localeCompare(right.code ?? "") || 0
  );

  let remainingGlobalBlocked = normalizeQuantity(globalBlocked);

  return sortedLevels.map<WarehouseAvailability>((level) => {
    const intrinsicAvailable = Math.max(
      0,
      normalizeQuantity(level.onHand) -
        normalizeQuantity(level.reserved) -
        normalizeQuantity(level.blocked) -
        normalizeQuantity(level.warehouseBlocked)
    );
    const appliedGlobalBlocked = Math.min(intrinsicAvailable, remainingGlobalBlocked);
    remainingGlobalBlocked -= appliedGlobalBlocked;

    return {
      ...level,
      appliedGlobalBlocked,
      effectiveAvailable: Math.max(0, intrinsicAvailable - appliedGlobalBlocked),
    };
  });
}

export function selectWarehouseForQuantity(
  levels: WarehouseAvailability[],
  quantity: number
) {
  const requestedQuantity = normalizeQuantity(quantity);

  return (
    [...levels]
      .sort(
        (left, right) =>
          left.priority - right.priority ||
          right.effectiveAvailable - left.effectiveAvailable ||
          left.code?.localeCompare(right.code ?? "") ||
          0
      )
      .find((level) => level.effectiveAvailable >= requestedQuantity) ?? null
  );
}

export function sumEffectiveAvailability(levels: WarehouseAvailability[]) {
  return levels.reduce(
    (total, level) => total + normalizeQuantity(level.effectiveAvailable),
    0
  );
}
