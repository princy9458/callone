import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserInterface } from '../users/userSlice';

export interface CartItem {
  id?: string; // This will be the SKU or variant ID
  sku?: string;
  brand?: string;
  description?: string;
  image?: string;
  qty88?: number;
  qty90?: number;
  stock88?: number;
  stock90?: number;
  qty?: number;
  mrp?: number;
  gst?: number;
  amount?: number;
  discount?: number;
  lessDiscount?: number;
  gstRate?: number;
  lessGst?: number;
  discountAmt?: number;
  netBilling?: number;
  finalAmount?: number;
  finalBillValue?: number;
}



interface CartState {
  currentCartId: string | null;
  selectedRetailer: UserInterface | null;
  selectedManager: UserInterface | null;
  selectedSalesRep: UserInterface | null;
  items: CartItem[];
  discountType: 'inclusive' | 'exclusive' | 'flat' | 'none';
  discountValue: number;
}

const initialState: CartState = {
  currentCartId: null,
  selectedRetailer: null,
  selectedManager: null,
  selectedSalesRep: null,
  items: [],
  discountType: 'inclusive',
  discountValue: 22,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setSelectedRetailer(state, action: PayloadAction<UserInterface | null>) {
      state.selectedRetailer = action.payload;
    },
    setSelectedManager(state, action: PayloadAction<UserInterface | null>) {
      state.selectedManager = action.payload;
    },
    setSelectedSalesRep(state, action: PayloadAction<UserInterface | null>) {
      state.selectedSalesRep = action.payload;
    },
    addToCart(state, action: PayloadAction<CartItem | CartItem[]>) {
      const payloads = Array.isArray(action.payload) ? action.payload : [action.payload];
      
      payloads.forEach((newItem) => {
        const itemId = newItem.id || newItem.sku;
        const existingItemIndex = state.items.findIndex(
          (item) => item.sku === newItem.sku || (item.id === itemId && itemId !== undefined)
        );

        if (existingItemIndex !== -1) {
          state.items[existingItemIndex] = {
            ...state.items[existingItemIndex],
            ...newItem,
            id: itemId, // Ensure id is set
          };
        } else {
          state.items.push({ ...newItem, id: itemId });
        }
      });
    },
    removeFromCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    updateCartItemQty(state, action: PayloadAction<{ id?: string, sku?: string, qty88?: number, qty90?: number }>) {
      const { id, sku, qty88, qty90 } = action.payload;
      const item = state.items.find(item => 
        (id && item.id === id) || (sku && item.sku === sku)
      );
      if (item) {
        if (qty88 !== undefined) item.qty88 = qty88;
        if (qty90 !== undefined) item.qty90 = qty90;
      }
    },
    updateCartItemStock(state, action: PayloadAction<{ id: string, stock88?: number, stock90?: number }>) {
      const item = state.items.find(item => item.id === action.payload.id);
      if (item) {
        if (action.payload.stock88 !== undefined) item.stock88 = action.payload.stock88;
        if (action.payload.stock90 !== undefined) item.stock90 = action.payload.stock90;
      }
    },
    clearCart(state) {
      state.items = [];
    },
    setDiscount(state, action: PayloadAction<{ type: CartState['discountType'], value: number }>) {
      state.discountType = action.payload.type;
      state.discountValue = action.payload.value;
    },
    setCartFromOrder(state, action: PayloadAction<{
      items: CartItem[];
      selectedRetailer: UserInterface | null;
      selectedManager: UserInterface | null;
      selectedSalesRep: UserInterface | null;
      discountType?: string;
      discountValue?: number;
      cartId?: string;
    }>) {
      state.items = action.payload.items;
      state.selectedRetailer = action.payload.selectedRetailer;
      state.selectedManager = action.payload.selectedManager;
      state.selectedSalesRep = action.payload.selectedSalesRep;
      if (action.payload.discountType) {
        state.discountType = action.payload.discountType as any;
      }
      if (action.payload.discountValue !== undefined) {
        state.discountValue = action.payload.discountValue;
      }
      state.currentCartId = action.payload.cartId || null;
    }
  },
});

export const {
  setSelectedRetailer,
  setSelectedManager,
  setSelectedSalesRep,
  addToCart,
  removeFromCart,
  updateCartItemQty,
  updateCartItemStock,
  clearCart,
  setDiscount,
  setCartFromOrder
} = cartSlice.actions;

export default cartSlice.reducer;
