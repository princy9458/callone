export type DiscountMode = "inclusive" | "exclusive" | "flat" | "none";

export type DiscountInput = {
  amount: number;
  gstRate: number;
  discountType: DiscountMode;
  discountValue: number;
};

export type DiscountBreakdown = {
  discountType: DiscountMode;
  discountValue: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  finalAmount: number;
};

function round(value: number) {
  return Number(value.toFixed(2));
}

export function calculateDiscountBreakdown({
  amount,
  gstRate,
  discountType,
  discountValue,
}: DiscountInput): DiscountBreakdown {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const safeGstRate = Number.isFinite(gstRate) ? gstRate : 0;
  const safeDiscountValue = Number.isFinite(discountValue) ? discountValue : 0;

  if (discountType === "none" || safeDiscountValue <= 0) {
    const taxableAmount = round(
      safeGstRate > 0 ? safeAmount / (1 + safeGstRate / 100) : safeAmount
    );
    const taxAmount = round(safeAmount - taxableAmount);
    return {
      discountType,
      discountValue: safeDiscountValue,
      discountAmount: 0,
      taxableAmount,
      taxAmount,
      finalAmount: round(safeAmount),
    };
  }

  if (discountType === "inclusive") {
    const extractedTax = round(safeAmount - (100 * safeAmount) / (100 + safeGstRate));
    const discountAmount = round((safeAmount * safeDiscountValue) / 100);
    const taxableAmount = round(safeAmount - discountAmount - extractedTax);
    const taxAmount = round((safeGstRate * taxableAmount) / 100);
    return {
      discountType,
      discountValue: safeDiscountValue,
      discountAmount,
      taxableAmount,
      taxAmount,
      finalAmount: round(taxableAmount + taxAmount),
    };
  }

  if (discountType === "exclusive") {
    const discountAmount = round((safeAmount * safeDiscountValue) / 100);
    const taxableAmount = round(safeAmount - discountAmount);
    const taxAmount = round((safeGstRate * taxableAmount) / 100);
    return {
      discountType,
      discountValue: safeDiscountValue,
      discountAmount,
      taxableAmount,
      taxAmount,
      finalAmount: round(taxableAmount + taxAmount),
    };
  }

  const discountAmount = round((safeAmount * safeDiscountValue) / 100);
  const taxableAmount = round(safeAmount - discountAmount);
  return {
    discountType,
    discountValue: safeDiscountValue,
    discountAmount,
    taxableAmount,
    taxAmount: 0,
    finalAmount: taxableAmount,
  };
}

export function sumDiscountBreakdowns(items: DiscountBreakdown[]) {
  return items.reduce(
    (accumulator, item) => ({
      discountAmount: round(accumulator.discountAmount + item.discountAmount),
      taxableAmount: round(accumulator.taxableAmount + item.taxableAmount),
      taxAmount: round(accumulator.taxAmount + item.taxAmount),
      finalAmount: round(accumulator.finalAmount + item.finalAmount),
    }),
    {discountAmount: 0, taxableAmount: 0, taxAmount: 0, finalAmount: 0}
  );
}
