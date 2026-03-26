import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProductExcelData } from '@/components/products/ProductType';
import { createTravisMathew, deleteTravisMathew, fetchTravisMathew, fetchTravisMathewById, updateTravisMathew } from './travisMathewThunks';

export interface TravisMathewState {
  travismathew: ProductExcelData[];
  selectedTravisMathew: ProductExcelData[];
  currentTravisMathew: ProductExcelData | null;
  isFetchedTravismathew: boolean;
  error: string | null;
}

const initialState: TravisMathewState = {
  travismathew: [],
  selectedTravisMathew: [],
  currentTravisMathew: null,
  isFetchedTravismathew: false,
  error: null,
};

export const travisMathewSlice = createSlice({
  name: 'travisMathew',
  initialState,
  reducers: {
    setTravisMathew: (state, action: PayloadAction<ProductExcelData[]>) => {
      state.travismathew = action.payload;
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
    // fetchTravisMathew
    builder.addCase(fetchTravisMathew.pending, (state) => {
      state.isFetchedTravismathew = false;
      state.error = null;
    });
    builder.addCase(fetchTravisMathew.fulfilled, (state, action) => {
      state.isFetchedTravismathew = true;
      state.travismathew = action.payload;
    });
    builder.addCase(fetchTravisMathew.rejected, (state, action) => {
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
} = travisMathewSlice.actions;

export default travisMathewSlice.reducer;
