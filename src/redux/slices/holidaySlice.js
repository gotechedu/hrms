import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { holidayApi } from '../../Service/holidayApi';

export const fetchHolidays = createAsyncThunk(
  'holidays/fetchHolidays',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await holidayApi.getHolidays(params);
      return response.data || [];
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch holidays');
    }
  }
);

export const addHolidayAsync = createAsyncThunk(
  'holidays/addHolidayAsync',
  async (holidayData, { rejectWithValue }) => {
    try {
      const response = await holidayApi.createHoliday(holidayData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create holiday');
    }
  }
);

export const updateHolidayAsync = createAsyncThunk(
  'holidays/updateHolidayAsync',
  async ({ id, holidayData }, { rejectWithValue }) => {
    try {
      const response = await holidayApi.updateHoliday(id, holidayData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update holiday');
    }
  }
);

export const deleteHolidayAsync = createAsyncThunk(
  'holidays/deleteHolidayAsync',
  async (id, { rejectWithValue }) => {
    try {
      await holidayApi.deleteHoliday(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete holiday');
    }
  }
);

const holidaySlice = createSlice({
  name: 'holidays',
  initialState: {
    holidays: [],
    selectedYear: '2025',
    loading: true,
    error: null,
  },
  reducers: {
    setSelectedYear: (state, action) => {
      state.selectedYear = action.payload;
    },
    addHoliday: (state, action) => {
      const newH = {
        _id: action.payload._id || `h_${Date.now()}`,
        id: action.payload.id || `h_${Date.now()}`,
        ...action.payload,
      };
      state.holidays.push(newH);
      state.holidays.sort((a, b) => new Date(a.date) - new Date(b.date));
    },
    deleteHoliday: (state, action) => {
      state.holidays = state.holidays.filter(
        (h) => h._id !== action.payload && h.id !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHolidays.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHolidays.fulfilled, (state, action) => {
        state.loading = false;
        state.holidays = (action.payload || []).map((h) => ({
          ...h,
          id: h._id || h.id,
        }));
      })
      .addCase(fetchHolidays.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addHolidayAsync.fulfilled, (state, action) => {
        const item = { ...action.payload, id: action.payload._id || action.payload.id };
        state.holidays.push(item);
        state.holidays.sort((a, b) => new Date(a.date) - new Date(b.date));
      })
      .addCase(updateHolidayAsync.fulfilled, (state, action) => {
        const updated = { ...action.payload, id: action.payload._id || action.payload.id };
        const idx = state.holidays.findIndex((h) => h._id === updated._id || h.id === updated.id);
        if (idx !== -1) {
          state.holidays[idx] = updated;
        } else {
          state.holidays.push(updated);
        }
        state.holidays.sort((a, b) => new Date(a.date) - new Date(b.date));
      })
      .addCase(deleteHolidayAsync.fulfilled, (state, action) => {
        state.holidays = state.holidays.filter(
          (h) => h._id !== action.payload && h.id !== action.payload
        );
      });
  },
});

export const { setSelectedYear, addHoliday, deleteHoliday } = holidaySlice.actions;
export default holidaySlice.reducer;
