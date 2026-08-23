import { createSlice } from '@reduxjs/toolkit';

const initialHolidays = [
  { id: 1, name: 'New Year Day', date: '2025-01-01', day: 'Wednesday', type: 'Public Holiday', isOptional: false },
  { id: 2, name: 'Republic Day', date: '2025-01-26', day: 'Sunday', type: 'National Holiday', isOptional: false },
  { id: 3, name: 'Maha Shivratri', date: '2025-02-26', day: 'Wednesday', type: 'Restricted Holiday', isOptional: true },
  { id: 4, name: 'Holi (Festival of Colors)', date: '2025-03-14', day: 'Friday', type: 'Public Holiday', isOptional: false },
  { id: 5, name: 'Eid-ul-Fitr', date: '2025-03-31', day: 'Monday', type: 'Public Holiday', isOptional: false },
  { id: 6, name: 'Good Friday', date: '2025-04-18', day: 'Friday', type: 'Public Holiday', isOptional: false },
  { id: 7, name: 'Independence Day', date: '2025-08-15', day: 'Friday', type: 'National Holiday', isOptional: false },
  { id: 8, name: 'Gandhi Jayanti', date: '2025-10-02', day: 'Thursday', type: 'National Holiday', isOptional: false },
  { id: 9, name: 'Dussehra (Vijayadashami)', date: '2025-10-02', day: 'Thursday', type: 'Public Holiday', isOptional: false },
  { id: 10, name: 'Diwali (Deepavali)', date: '2025-10-20', day: 'Monday', type: 'Public Holiday', isOptional: false },
  { id: 11, name: 'Guru Nanak Jayanti', date: '2025-11-05', day: 'Wednesday', type: 'Public Holiday', isOptional: false },
  { id: 12, name: 'Christmas Day', date: '2025-12-25', day: 'Thursday', type: 'Public Holiday', isOptional: false },
];

const holidaySlice = createSlice({
  name: 'holidays',
  initialState: {
    holidays: initialHolidays,
    selectedYear: '2025',
  },
  reducers: {
    addHoliday: (state, action) => {
      state.holidays.push({
        id: Date.now(),
        ...action.payload,
      });
      state.holidays.sort((a, b) => new Date(a.date) - new Date(b.date));
    },
    deleteHoliday: (state, action) => {
      state.holidays = state.holidays.filter((h) => h.id !== action.payload);
    },
  },
});

export const { addHoliday, deleteHoliday } = holidaySlice.actions;
export default holidaySlice.reducer;
