import { configureStore } from '@reduxjs/toolkit';
import brandReducer from './slices/brandSlice/brandSlice';
import attributeReducer from './slices/attributeSlice/attributeSlice';

import travisMathewReducer from './slices/travisMathewSlice/travisMathewSlice';
import ogioReducer from './slices/ogioSlice/ogioSlice';

export const store = configureStore({
  reducer: {
    brand: brandReducer,
    attribute: attributeReducer,
    travisMathew: travisMathewReducer,
    ogio: ogioReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

