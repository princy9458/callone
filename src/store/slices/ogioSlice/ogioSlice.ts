import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProductExcelData } from '@/components/products/ProductType';
import { createOgio, deleteOgio, fetchOgio, fetchOgioById, updateOgio } from './ogioThunks';
import { OgioType } from '@/components/products/Ogio/OgioType';
import { updateCartItemStock } from '../cart/cartSlice';

export interface OgioState {
  ogio: OgioType[];
  selectedOgio: OgioType[];
  currentOgio: OgioType | null;
  isFetchedOgio: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: OgioState = {
  ogio: [],
  selectedOgio: [],
  currentOgio: null,
  isFetchedOgio: false,
  isLoading: false,
  error: null,
};

export const ogioSlice = createSlice({
  name: 'ogio',
  initialState,
  reducers: {
    setOgio: (state, action: PayloadAction<OgioType[]>) => {
      state.ogio = action.payload;
    },

    updateStockOgio: (state, action) => {
        const { sku, stock90 } = action.payload;
        debugger
        const index = state.ogio.findIndex((item) => item.sku === sku);
        if (index !== -1 && stock90 !== undefined) {
          state.ogio[index] = {
            ...state.ogio[index],
            stock_90: stock90
          };
        }
        },
    setSelectedOgio: (state, action: PayloadAction<OgioType[]>) => {
      state.selectedOgio = action.payload;
    },
    setCurrentOgio: (state, action: PayloadAction<OgioType | null>) => {
      state.currentOgio = action.payload;
    },
    setIsFetchedOgio: (state, action: PayloadAction<boolean>) => {
      state.isFetchedOgio = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearSelectedOgio: (state) => {
      state.selectedOgio = [];
    },
  },
  extraReducers: (builder) => {
    // updateCartItemStock
    builder.addCase(updateCartItemStock, (state, action) => {
      const { id, stock90 } = action.payload;
      debugger
      const index = state.ogio.findIndex((item) => item.sku === id || item._id === id);
      if (index !== -1 && stock90 !== undefined) {
        state.ogio[index] = {
            ...state.ogio[index],
            stock_90: stock90
        };
      }
    });

    // fetchOgio
    builder.addCase(fetchOgio.pending, (state) => {
      state.isLoading = true;
      state.isFetchedOgio = false;
      state.error = null;
    });
    builder.addCase(fetchOgio.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isFetchedOgio = true;
      state.ogio = action.payload;
    });
    builder.addCase(fetchOgio.rejected, (state, action) => {
      state.isLoading = false;
      state.isFetchedOgio = false;
      state.error = action.payload as string;
    });

    // fetchOgioById
    builder.addCase(fetchOgioById.pending, (state) => {
      state.error = null;
    });
    builder.addCase(fetchOgioById.fulfilled, (state, action) => {
      state.currentOgio = action.payload;
    });
    builder.addCase(fetchOgioById.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // createOgio
    builder.addCase(createOgio.fulfilled, (state, action) => {
      if (Array.isArray(action.payload)) {
        state.ogio.push(...(action.payload as OgioType[]));
      } else {
        state.ogio.push(action.payload as OgioType);
      }
    });
    builder.addCase(createOgio.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // updateOgio
    builder.addCase(updateOgio.fulfilled, (state, action) => {
      const updated = action.payload as OgioType;
      const index = state.ogio.findIndex((item) => item.sku === updated.sku);
      if (index !== -1) {
        state.ogio[index] = updated;
      }
      if (state.currentOgio?.sku === updated.sku) {
        state.currentOgio = updated;
      }
    });
    builder.addCase(updateOgio.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // deleteOgio
    builder.addCase(deleteOgio.fulfilled, (state, action) => {
      const deletedBaseSku = action.payload;
      state.ogio = state.ogio.filter((item) => item.sku !== deletedBaseSku);
      state.selectedOgio = state.selectedOgio.filter(
        (item) => item.sku !== deletedBaseSku
      );
      if (state.currentOgio?.sku === deletedBaseSku) {
        state.currentOgio = null;
      }
    });
    builder.addCase(deleteOgio.rejected, (state, action) => {
      state.error = action.payload as string;
    });
  },
});

export const {
  setOgio,
  setSelectedOgio,
  setCurrentOgio,
  setIsFetchedOgio,
  setError,
  clearSelectedOgio,
  updateStockOgio
} = ogioSlice.actions;

export default ogioSlice.reducer;
