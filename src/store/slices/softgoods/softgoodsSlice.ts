import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SoftGoodInterface } from './SoftGoodType';
import {
  createSoftGood,
  deleteSoftGood,
  fetchSoftGoods,
  fetchSoftGoodById,
  updateSoftGood,
} from './softgoodsThunks';
import { updateCartItemStock } from '../cart/cartSlice';

export interface SoftGoodsState {
  softgoods: SoftGoodInterface[];
  selectedSoftGoods: SoftGoodInterface[];
  currentSoftGood: SoftGoodInterface | null;
  isFetchedSoftGoods: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: SoftGoodsState = {
  softgoods: [],
  selectedSoftGoods: [],
  currentSoftGood: null,
  isFetchedSoftGoods: false,
  isLoading: false,
  error: null,
};

export const softgoodsSlice = createSlice({
  name: 'softgoods',
  initialState,
  reducers: {
    setSoftGoods: (state, action: PayloadAction<SoftGoodInterface[]>) => {
      state.softgoods = action.payload;
    },
    updateStockSoftgoods: (state, action: PayloadAction<{ sku: string; stock88: number; stock90: number }>) => {
        const { sku, stock88, stock90 } = action.payload;
        const index = state.softgoods.findIndex((item) => item.sku === sku);
        if (index !== -1) {
            if (stock88 !== undefined) state.softgoods[index].stock_88 = stock88;
            if (stock90 !== undefined) state.softgoods[index].stock_90 = stock90;
        }
    },
    setSelectedSoftGoods: (state, action: PayloadAction<SoftGoodInterface[]>) => {
      state.selectedSoftGoods = action.payload;
    },
    setCurrentSoftGood: (state, action: PayloadAction<SoftGoodInterface | null>) => {
      state.currentSoftGood = action.payload;
    },
    setIsFetchedSoftGoods: (state, action: PayloadAction<boolean>) => {
      state.isFetchedSoftGoods = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearSelectedSoftGoods: (state) => {
      state.selectedSoftGoods = [];
    },
  },
  extraReducers: (builder) => {
    // updateCartItemStock
    builder.addCase(updateCartItemStock, (state, action) => {
      const { id, stock88, stock90 } = action.payload;
      const index = state.softgoods.findIndex((item) => item.sku === id || item._id === id);
      if (index !== -1) {
        if (stock88 !== undefined) state.softgoods[index].stock_88 = stock88;
        if (stock90 !== undefined) state.softgoods[index].stock_90 = stock90;
      }
    });

    // fetchSoftGoods
    builder.addCase(fetchSoftGoods.pending, (state) => {
      state.isLoading = true;
      state.isFetchedSoftGoods = false;
      state.error = null;
    });
    builder.addCase(fetchSoftGoods.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isFetchedSoftGoods = true;
      state.softgoods = action.payload;
    });
    builder.addCase(fetchSoftGoods.rejected, (state, action) => {
      state.isLoading = false;
      state.isFetchedSoftGoods = false;
      state.error = action.payload as string;
    });

    // fetchSoftGoodById
    builder.addCase(fetchSoftGoodById.pending, (state) => {
      state.error = null;
    });
    builder.addCase(fetchSoftGoodById.fulfilled, (state, action) => {
      state.currentSoftGood = action.payload;
    });
    builder.addCase(fetchSoftGoodById.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // createSoftGood
    builder.addCase(createSoftGood.fulfilled, (state, action) => {
      const data = action.payload.data;
      if (Array.isArray(data)) {
        state.softgoods.push(...data);
      } else {
        state.softgoods.push(data);
      }
    });
    builder.addCase(createSoftGood.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // updateSoftGood
    builder.addCase(updateSoftGood.fulfilled, (state, action) => {
      const updated = action.payload;
      const index = state.softgoods.findIndex((item) => item.sku === updated.sku);
      if (index !== -1) {
        state.softgoods[index] = updated;
      }
      if (state.currentSoftGood?.sku === updated.sku) {
        state.currentSoftGood = updated;
      }
    });
    builder.addCase(updateSoftGood.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // deleteSoftGood
    builder.addCase(deleteSoftGood.fulfilled, (state, action) => {
      const deletedSku = action.payload;
      state.softgoods = state.softgoods.filter((item) => item.sku !== deletedSku);
      state.selectedSoftGoods = state.selectedSoftGoods.filter(
        (item) => item.sku !== deletedSku
      );
      if (state.currentSoftGood?.sku === deletedSku) {
        state.currentSoftGood = null;
      }
    });
    builder.addCase(deleteSoftGood.rejected, (state, action) => {
      state.error = action.payload as string;
    });
  },
});

export const {
  setSoftGoods,
  setSelectedSoftGoods,
  setCurrentSoftGood,
  setIsFetchedSoftGoods,
  setError,
  clearSelectedSoftGoods,
  updateStockSoftgoods
} = softgoodsSlice.actions;

export default softgoodsSlice.reducer;
