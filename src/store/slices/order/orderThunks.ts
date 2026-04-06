import { createAsyncThunk } from '@reduxjs/toolkit';
import { CartModel } from './OrderType';

const API_URL = '/api/admin/orders';

export const fetchOrders = createAsyncThunk<
  CartModel[],
  void,
  { rejectValue: string }
>(
  'orders/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      return data.data as CartModel[];
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while fetching orders');
    }
  }
);

export const fetchOrderById = createAsyncThunk<
  CartModel,
  string,
  { rejectValue: string }
>(
  'orders/fetchById',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/${orderId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch order with ID: ${orderId}`);
      }
      const data = await response.json();
      return data.data as CartModel;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while fetching the order');
    }
  }
);

export const createOrder = createAsyncThunk<
  CartModel,
  Partial<CartModel>,
  { rejectValue: string }
>(
  'orders/create',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      if (!response.ok) {
        throw new Error('Failed to create order');
      }
      const data = await response.json();
      return data.data as CartModel;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while creating the order');
    }
  }
);

export const updateOrder = createAsyncThunk<
  CartModel,
  { id: string; data: Partial<CartModel> },
  { rejectValue: string }
>(
  'orders/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`Failed to update order with ID: ${id}`);
      }
      const updatedData = await response.json();
      return updatedData.data as CartModel;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while updating the order');
    }
  }
);

export const deleteOrder = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  'orders/delete',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/${orderId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Failed to delete order with ID: ${orderId}`);
      }
      return orderId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while deleting the order');
    }
  }
);
