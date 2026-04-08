import { CartItem } from "@/store/slices/cart/cartSlice";

export const calculateValues = (item: CartItem, value: number, mode: string) => {
  let discount =  value;

  discount = typeof discount === "number" ? discount : parseFloat(discount);

  if (isNaN(discount)) {
    console.warn("Invalid discount value:", item);
    discount = 0;
  }

  const gst = item.gst || 0;
  const salP = item.mrp || 0;

  let LessGST = 0;
  let LessDiscountAmount = 0;
  let NetBillings = 0;
  let FinalBillValue = 0;


  // 🔹 Inclusive
  if (mode === "inclusive") {
    LessGST = parseFloat((salP - (100 * salP) / (100 + gst)).toFixed(2));
    LessDiscountAmount = parseFloat(((salP * discount) / 100).toFixed(2));
    NetBillings = parseFloat((salP - LessDiscountAmount - LessGST).toFixed(2));
    FinalBillValue = parseFloat((NetBillings + (gst * NetBillings) / 100).toFixed(2));
  }

  // 🔹 Exclusive
  if (mode === "exclusive") {
    LessGST = 0;
    LessDiscountAmount = parseFloat(((salP * discount) / 100).toFixed(2));
    NetBillings = parseFloat((salP - LessDiscountAmount).toFixed(2));
    FinalBillValue = parseFloat((NetBillings + (gst * NetBillings) / 100).toFixed(2));
  }

  // 🔹 Flat
  if (mode === "flat") {
    LessGST = 0;
    discount = 0;
    LessDiscountAmount = parseFloat(((salP * discount) / 100).toFixed(2));
    NetBillings = parseFloat((salP - LessDiscountAmount).toFixed(2));
    FinalBillValue = parseFloat(NetBillings.toFixed(2));
  }

  return {
    ...item,
    discount:discount,
    lessDiscount: LessDiscountAmount,
    lessGST:LessGST,
    netBilling:NetBillings,
    finalAmount:FinalBillValue,
  };
};