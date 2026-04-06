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
  qty?: number;
  mrp?: number;
  gst?: number;
  amount?: number;
  discount?: number;
  lessDiscount?: number;
  netBilling?: number;
  finalAmount?: number;
}



interface CartState {
  selectedRetailer: UserInterface | null;
  selectedManager: UserInterface | null;
  selectedSalesRep: UserInterface | null;
  items: CartItem[];
  discountType: 'inclusive' | 'exclusive' | 'flat' | 'none';
  discountValue: number;
}

const initialState: CartState = {
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
        const existingItemIndex = state.items.findIndex(
          (item) => item.sku === newItem.sku
        );

        if (existingItemIndex !== -1) {
          state.items[existingItemIndex] = {
            ...state.items[existingItemIndex],
            ...newItem,
          };
        } else {
          state.items.push(newItem);
        }
      });
    },
    removeFromCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    updateCartItemQty(state, action: PayloadAction<{ id: string, qty88?: number, qty90?: number }>) {
      const item = state.items.find(item => item.id === action.payload.id);
      if (item) {
        if (action.payload.qty88 !== undefined) item.qty88 = action.payload.qty88;
        if (action.payload.qty90 !== undefined) item.qty90 = action.payload.qty90;
      }
    },
    clearCart(state) {
      state.items = [];
    },
    setDiscount(state, action: PayloadAction<{ type: CartState['discountType'], value: number }>) {
      state.discountType = action.payload.type;
      state.discountValue = action.payload.value;
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
  clearCart,
  setDiscount
} = cartSlice.actions;

export default cartSlice.reducer;
