import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { OrderState, CartModel } from './OrderType';
import { fetchOrders, fetchOrderById, createOrder, updateOrder, deleteOrder } from './orderThunks';

const initialState: OrderState = {
  allOrders: [],
  currentOrder: null,
  isFetchedOrders: false,
  isLoadingOrders: false,
  isError: false,
  error: null,
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setCurrentOrder: (state, action: PayloadAction<CartModel | null>) => {
      state.currentOrder = action.payload;
    },
    clearOrderError: (state) => {
      state.isError = false;
      state.error = null;
    },
    resetOrderState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // Fetch All Orders
    builder.addCase(fetchOrders.pending, (state) => {
      state.isLoadingOrders = true;
      state.isError = false;
    });
    builder.addCase(fetchOrders.fulfilled, (state, action) => {
      state.isLoadingOrders = false;
      state.allOrders = action.payload;
      state.isFetchedOrders = true;
    });
    builder.addCase(fetchOrders.rejected, (state, action) => {
      state.isLoadingOrders = false;
      state.isError = true;
      state.error = action.payload as string;
    });

    // Fetch Order By Id
    builder.addCase(fetchOrderById.pending, (state) => {
      state.isLoadingOrders = true;
      state.isError = false;
    });
    builder.addCase(fetchOrderById.fulfilled, (state, action) => {
      state.isLoadingOrders = false;
      state.currentOrder = action.payload;
    });
    builder.addCase(fetchOrderById.rejected, (state, action) => {
      state.isLoadingOrders = false;
      state.isError = true;
      state.error = action.payload as string;
    });

    // Create Order
    builder.addCase(createOrder.pending, (state) => {
      state.isLoadingOrders = true;
      state.isError = false;
    });
    builder.addCase(createOrder.fulfilled, (state, action) => {
      state.isLoadingOrders = false;
      state.allOrders.push(action.payload);
      state.currentOrder = action.payload;
    });
    builder.addCase(createOrder.rejected, (state, action) => {
      state.isLoadingOrders = false;
      state.isError = true;
      state.error = action.payload as string;
    });

    // Update Order
    builder.addCase(updateOrder.pending, (state) => {
      state.isLoadingOrders = true;
      state.isError = false;
    });
    builder.addCase(updateOrder.fulfilled, (state, action) => {
      state.isLoadingOrders = false;
      const index = state.allOrders.findIndex(o => o.id === action.payload.id || o._id === action.payload._id);
      if (index !== -1) {
        state.allOrders[index] = action.payload;
      }
      if (state.currentOrder?.id === action.payload.id || state.currentOrder?._id === action.payload._id) {
        state.currentOrder = action.payload;
      }
    });
    builder.addCase(updateOrder.rejected, (state, action) => {
      state.isLoadingOrders = false;
      state.isError = true;
      state.error = action.payload as string;
    });

    // Delete Order
    builder.addCase(deleteOrder.pending, (state) => {
      state.isLoadingOrders = true;
      state.isError = false;
    });
    builder.addCase(deleteOrder.fulfilled, (state, action) => {
      state.isLoadingOrders = false;
      state.allOrders = state.allOrders.filter(o => o.id !== Number(action.payload) && o._id !== action.payload);
      if (state.currentOrder?.id === Number(action.payload) || state.currentOrder?._id === action.payload) {
        state.currentOrder = null;
      }
    });
    builder.addCase(deleteOrder.rejected, (state, action) => {
      state.isLoadingOrders = false;
      state.isError = true;
      state.error = action.payload as string;
    });
  },
});

export const { setCurrentOrder, clearOrderError, resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;
