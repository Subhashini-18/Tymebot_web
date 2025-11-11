import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiService } from "@/services/api/apiservice";
import { getAuthData } from "@/utils/auth";

const BASE_API_PATH = import.meta.env.VITE_IAM_API_PATH || "/api/tyme/idam/v1/";
const BASE_PORT = import.meta.env.VITE_BASE_IDAM_PORT || "8080";

export interface MenuState {
  overAll: any[];
  loading: boolean;
  error: string | null;
}

const initialState: MenuState = {
  overAll: [],
  loading: false,
  error: null,
};

// Async thunk to fetch menu from backend
export const fetchMenu = createAsyncThunk(
  "menu/fetchMenu",
  async (roleName: string, { rejectWithValue }) => {
    try {
      // Optionally get token or user info if needed
      const auth = getAuthData();
      // If you need to pass userId or token, add here
      const url = `${BASE_API_PATH}get_user_menu`;
      // paiservice.get(url, params, port)
      const response: any = await apiService.get(url, { roleName }, BASE_PORT);
      // Expecting response.data to be the menu array for the role
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch menu");
    }
  }
);

const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    clearMenu(state) {
      state.overAll = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenu.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMenu.fulfilled, (state, action) => {
        if (
          Array.isArray(action.payload) &&
          action.payload.length >= 0 &&
          action.payload[0].menu
        ) {
          state.overAll = action.payload[0].menu;
        } else {
          state.overAll = action.payload;
          console.log(action.payload);
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchMenu.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearMenu } = menuSlice.actions;
export default menuSlice.reducer;
