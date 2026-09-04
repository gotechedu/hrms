import { createSlice } from '@reduxjs/toolkit';

const accusationSlice = createSlice({
  name: 'accusations',
  initialState: {
    accusations: [],
    selectedCategory: 'All',
  },
  reducers: {
    addAccusation: (state, action) => {
      state.accusations.unshift({
        id: `GRV-${Math.floor(300 + Math.random() * 700)}`,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        status: 'Under Investigation',
        assignedTo: 'HR Ethics Committee',
        ...action.payload,
      });
    },
    updateAccusationStatus: (state, action) => {
      const { id, status, resolutionNotes } = action.payload;
      const target = state.accusations.find((item) => item.id === id);
      if (target) {
        if (status) target.status = status;
        if (resolutionNotes) target.resolutionNotes = resolutionNotes;
      }
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
  },
});

export const { addAccusation, updateAccusationStatus, setSelectedCategory } = accusationSlice.actions;
export default accusationSlice.reducer;
