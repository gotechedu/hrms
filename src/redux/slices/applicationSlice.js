import { createSlice } from '@reduxjs/toolkit';

const applicationSlice = createSlice({
  name: 'applications',
  initialState: {
    candidates: [],
    selectedStage: 'All',
  },
  reducers: {
    addCandidate: (state, action) => {
      state.candidates.unshift({
        id: `APP-${Math.floor(800 + Math.random() * 200)}`,
        stage: 'Applied',
        rating: 4.5,
        appliedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        ...action.payload,
      });
    },
    updateCandidateStage: (state, action) => {
      const { id, stage } = action.payload;
      const c = state.candidates.find((item) => item.id === id);
      if (c) {
        c.stage = stage;
      }
    },
    deleteCandidate: (state, action) => {
      state.candidates = state.candidates.filter((item) => item.id !== action.payload);
    },
    setSelectedStage: (state, action) => {
      state.selectedStage = action.payload;
    },
  },
});

export const { addCandidate, updateCandidateStage, deleteCandidate, setSelectedStage } = applicationSlice.actions;
export default applicationSlice.reducer;
