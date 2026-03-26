import { createAsyncThunk } from '@reduxjs/toolkit';
import { ProductExcelData } from '@/components/products/ProductType';

const API_URL = '/api/admin/products/travismethew';

export const fetchTravisMathew = createAsyncThunk<ProductExcelData[], void, { rejectValue: string }>(
  'travisMathew/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch TravisMathew products');
      const data = await response.json();
      return data.data as ProductExcelData[];
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while fetching TravisMathew products');
    }
  }
);

export const fetchTravisMathewById = createAsyncThunk<ProductExcelData, string, { rejectValue: string }>(
  'travisMathew/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/${id}`);
      if (!response.ok) throw new Error('Failed to fetch TravisMathew product');
      const data = await response.json();
      return data.data as ProductExcelData;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while fetching the TravisMathew product');
    }
  }
);

export const createTravisMathew = createAsyncThunk<
  ProductExcelData | ProductExcelData[],
  ProductExcelData | ProductExcelData[],
  { rejectValue: string }
>(
  'travisMathew/create',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to create TravisMathew product(s)');
      const data = await response.json();
      return data.data as ProductExcelData | ProductExcelData[];
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while creating TravisMathew product(s)');
    }
  }
);

export const updateTravisMathew = createAsyncThunk<
  ProductExcelData,
  { sku: string; data: Partial<ProductExcelData> },
  { rejectValue: string }
>(
  'travisMathew/update',
  async ({ sku, data }, { rejectWithValue }) => {
    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{ ...data, sku }]),
      });
      if (!response.ok) throw new Error('Failed to update TravisMathew product');
      const responseData = await response.json();
      return responseData.data as ProductExcelData;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while updating the TravisMathew product');
    }
  }
);

export const deleteTravisMathew = createAsyncThunk<string, string, { rejectValue: string }>(
  'travisMathew/delete',
  async (sku, { rejectWithValue }) => {
    try {
      const response = await fetch(API_URL, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([sku]),
      });
      if (!response.ok) throw new Error('Failed to delete TravisMathew product');
      return sku;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while deleting the TravisMathew product');
    }
  }
);
