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

const initialHolidays = [
  { _id: 'h1', id: 'h1', name: 'New Year Day', date: '2025-01-01', day: 'Wednesday', type: 'Public Holiday', isOptional: false },
  { _id: 'h2', id: 'h2', name: 'Republic Day', date: '2025-01-26', day: 'Sunday', type: 'National Holiday', isOptional: false },
  { _id: 'h3', id: 'h3', name: 'Maha Shivratri', date: '2025-02-26', day: 'Wednesday', type: 'Restricted Holiday', isOptional: true },
  { _id: 'h4', id: 'h4', name: 'Holi (Festival of Colors)', date: '2025-03-14', day: 'Friday', type: 'Public Holiday', isOptional: false },
  { _id: 'h5', id: 'h5', name: 'Eid-ul-Fitr', date: '2025-03-31', day: 'Monday', type: 'Public Holiday', isOptional: false },
  { _id: 'h6', id: 'h6', name: 'Good Friday', date: '2025-04-18', day: 'Friday', type: 'Public Holiday', isOptional: false },
  { _id: 'h7', id: 'h7', name: 'Independence Day', date: '2025-08-15', day: 'Friday', type: 'National Holiday', isOptional: false },
  { _id: 'h8', id: 'h8', name: 'Gandhi Jayanti', date: '2025-10-02', day: 'Thursday', type: 'National Holiday', isOptional: false },
  { _id: 'h9', id: 'h9', name: 'Dussehra (Vijayadashami)', date: '2025-10-02', day: 'Thursday', type: 'Public Holiday', isOptional: false },
  { _id: 'h10', id: 'h10', name: 'Diwali (Deepavali)', date: '2025-10-20', day: 'Monday', type: 'Public Holiday', isOptional: false },
  { _id: 'h11', id: 'h11', name: 'Guru Nanak Jayanti', date: '2025-11-05', day: 'Wednesday', type: 'Public Holiday', isOptional: false },
  { _id: 'h12', id: 'h12', name: 'Christmas Day', date: '2025-12-25', day: 'Thursday', type: 'Public Holiday', isOptional: false },
];

const holidaySlice = createSlice({
  name: 'holidays',
  initialState: {
    holidays: initialHolidays,
    selectedYear: '2025',
    loading: false,
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
        if (action.payload && action.payload.length > 0) {
          state.holidays = action.payload.map((h) => ({
            ...h,
            id: h._id || h.id,
          }));
        }
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
      .addCase(deleteHolidayAsync.fulfilled, (state, action) => {
        state.holidays = state.holidays.filter(
          (h) => h._id !== action.payload && h.id !== action.payload
        );
      });
  },
});

export const { setSelectedYear, addHoliday, deleteHoliday } = holidaySlice.actions;
export default holidaySlice.reducer;
