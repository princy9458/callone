import { CartItem } from "../cart/cartSlice";

export interface NoteModel{
  message?: string;
  name?: string;
  date?: string;
  user_id?: number;
  access?: string;
  type?: string;
  }
export interface CartModel {
  _id?: string,
  id?: number,
  order_date?: string,
  items?: CartItem[],
  discount_type?: string,
  discount_percent?: number,
  total_value?: number,
  status?: string,
 manager_id?: number | null,
  retailer_id?: number,
  salesrep_id?: number,
  user_id?: number,

  brand_id?: number;
  created_at?: string;

  note?: NoteModel;
  totalAmount?: number,
  discountAmount?: number
  total_val_pre_discount?: number,
  discount_amount?: number,

  updated_at?: string;
}

export interface OrderState {
  allOrders: CartModel[];
  currentOrder: CartModel | null;
  isFetchedOrders: boolean;
  isLoadingOrders: boolean;
  isError: boolean;
  error: string | null;
}