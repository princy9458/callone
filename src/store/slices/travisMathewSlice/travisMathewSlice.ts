import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProductExcelData } from '@/components/products/ProductType';
import { createTravisMathew, deleteTravisMathew, fetchTravisMathew, fetchTravisMathewById, updateTravisMathew } from './travisMathewThunks';
import { TravisMathewType } from '@/components/products/travismethew/TravisMethewType';
import { updateCartItemStock } from '../cart/cartSlice';

export interface TravisMathewState {
  travismathew: TravisMathewType[];
  selectedTravisMathew: TravisMathewType[];
  currentTravisMathew: TravisMathewType | null;
  isFetchedTravismathew: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: TravisMathewState = {
  travismathew: [],
  selectedTravisMathew: [],
  currentTravisMathew: null,
  isFetchedTravismathew: false,
  isLoading: false,
  error: null,
};

export const travisMathewSlice = createSlice({
  name: 'travisMathew',
  initialState,
  reducers: {
    setTravisMathew: (state, action: PayloadAction<ProductExcelData[]>) => {
      state.travismathew = action.payload;
    },
    updateStockTravisMathew: (state, action: PayloadAction<{ sku: string; stock88: number; stock90: number }>) => {
      const { sku, stock88, stock90 } = action.payload;
      const index = state.travismathew.findIndex((item) => item.sku === sku);
      if (index !== -1) {
        if (stock88 !== undefined) state.travismathew[index].stock_88 = stock88;
        if (stock90 !== undefined) state.travismathew[index].stock_90 = stock90;
      }
    },
    setSelectedTravisMathew: (state, action: PayloadAction<ProductExcelData[]>) => {
      state.selectedTravisMathew = action.payload;
    },
    setCurrentTravisMathew: (state, action: PayloadAction<ProductExcelData | null>) => {
      state.currentTravisMathew = action.payload;
    },
    setIsFetchedTravismathew: (state, action: PayloadAction<boolean>) => {
      state.isFetchedTravismathew = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearSelectedTravisMathew: (state) => {
      state.selectedTravisMathew = [];
    },
  },
  extraReducers: (builder) => {
    // updateCartItemStock
    builder.addCase(updateCartItemStock, (state, action) => {
      const { id, stock88, stock90 } = action.payload;
      const index = state.travismathew.findIndex((item) => item.sku === id || item._id === id);
      if (index !== -1) {
        if (stock88 !== undefined) state.travismathew[index].stock_88 = stock88;
        if (stock90 !== undefined) state.travismathew[index].stock_90 = stock90;
      }
    });

    // fetchTravisMathew
    builder.addCase(fetchTravisMathew.pending, (state) => {
      state.isLoading = true;
      state.isFetchedTravismathew = false;
      state.error = null;
    });
    builder.addCase(fetchTravisMathew.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isFetchedTravismathew = true;
      state.travismathew = action.payload;
    });
    builder.addCase(fetchTravisMathew.rejected, (state, action) => {
      state.isLoading = false;
      state.isFetchedTravismathew = false;
      state.error = action.payload as string;
    });

    // fetchTravisMathewById
    builder.addCase(fetchTravisMathewById.pending, (state) => {
      state.error = null;
    });
    builder.addCase(fetchTravisMathewById.fulfilled, (state, action) => {
      state.currentTravisMathew = action.payload;
    });
    builder.addCase(fetchTravisMathewById.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // createTravisMathew
    builder.addCase(createTravisMathew.fulfilled, (state, action) => {
      if (Array.isArray(action.payload)) {
        state.travismathew.push(...action.payload);
      } else {
        state.travismathew.push(action.payload);
      }
    });
    builder.addCase(createTravisMathew.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // updateTravisMathew
    builder.addCase(updateTravisMathew.fulfilled, (state, action) => {
      const updated = action.payload;
      const index = state.travismathew.findIndex((item) => item.sku=== updated.sku);
      if (index !== -1) {
        state.travismathew[index] = updated;
      }
      if (state.currentTravisMathew?.sku === updated.sku) {
        state.currentTravisMathew = updated;
      }
    });
    builder.addCase(updateTravisMathew.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // deleteTravisMathew
    builder.addCase(deleteTravisMathew.fulfilled, (state, action) => {
      const deletedBaseSku = action.payload;
      state.travismathew = state.travismathew.filter((item) => item.sku !== deletedBaseSku);
      state.selectedTravisMathew = state.selectedTravisMathew.filter(
        (item) => item.sku !== deletedBaseSku
      );
      if (state.currentTravisMathew?.sku === deletedBaseSku) {
        state.currentTravisMathew = null;
      }
    });
    builder.addCase(deleteTravisMathew.rejected, (state, action) => {
      state.error = action.payload as string;
    });
  },
});

export const {
  setTravisMathew,
  setSelectedTravisMathew,
  setCurrentTravisMathew,
  setIsFetchedTravismathew,
  setError,
  clearSelectedTravisMathew,
  updateStockTravisMathew
} = travisMathewSlice.actions;

export default travisMathewSlice.reducer;
