import { createAsyncThunk } from '@reduxjs/toolkit';
import { ProductExcelData } from '@/components/products/ProductType';
import { OgioType } from '@/components/products/Ogio/OgioType';

const API_URL = '/api/admin/products/ogio';

export const fetchOgio = createAsyncThunk<OgioType[], void, { rejectValue: string }>(
  'ogio/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}?limit=5000`);
      if (!response.ok) throw new Error('Failed to fetch Ogio products');
      const data = await response.json();
      return data.data as OgioType[];
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while fetching Ogio products');
    }
  }
);

export const fetchOgioById = createAsyncThunk<OgioType, string, { rejectValue: string }>(
  'ogio/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/${id}`);
      if (!response.ok) throw new Error('Failed to fetch Ogio product');
      const data = await response.json();
      return data.data as OgioType;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while fetching the Ogio product');
    }
  }
);

export const createOgio = createAsyncThunk<
  OgioType | OgioType[],
  OgioType | OgioType[],
  { rejectValue: string }
>(
  'ogio/create',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to create Ogio product(s)');
      const data = await response.json();
      return data as ProductExcelData | ProductExcelData[];
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while creating Ogio product(s)');
    }
  }
);

export const updateOgio = createAsyncThunk<
  ProductExcelData,
  { sku: string; data: Partial<ProductExcelData> },
  { rejectValue: string }
>(
  'ogio/update',
  async ({ sku, data }, { rejectWithValue }) => {
    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{ ...data, sku }]),
      });
      if (!response.ok) throw new Error('Failed to update Ogio product');
      const responseData = await response.json();
      return responseData.data as ProductExcelData;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while updating the Ogio product');
    }
  }
);

export const deleteOgio = createAsyncThunk<string, string, { rejectValue: string }>(
  'ogio/delete',
  async (sku, { rejectWithValue }) => {
    try {
      const response = await fetch(API_URL, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([sku]),
      });
      if (!response.ok) throw new Error('Failed to delete Ogio product');
      return sku;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while deleting the Ogio product');
    }
  }
);
