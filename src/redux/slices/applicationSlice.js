import { createSlice } from '@reduxjs/toolkit';

const initialCandidates = [
  {
    id: 'APP-801',
    name: 'Siddharth Roy',
    email: 'siddharth.roy@gmail.com',
    phone: '+91 98760 11223',
    role: 'Senior React / Next.js Engineer',
    department: 'Engineering',
    experience: '4.5 Years',
    currentCompany: 'Infosys FinTech',
    stage: 'Technical Round 2', // 'Applied' | 'Screening' | 'Technical Round' | 'HR Round' | 'Offer Sent' | 'Rejected'
    rating: 4.8,
    appliedDate: '14 May 2025',
    resumeUrl: '#',
    noticePeriod: '30 Days',
    expectedCTC: '₹18 LPA',
  },
  {
    id: 'APP-802',
    name: 'Kavita Menon',
    email: 'kavita.m@gmail.com',
    phone: '+91 97654 33445',
    role: 'Generative AI & LLM Engineer',
    department: 'AI & Data',
    experience: '3 Years',
    currentCompany: 'Cognizant AI Labs',
    stage: 'Offer Sent',
    rating: 5.0,
    appliedDate: '10 May 2025',
    resumeUrl: '#',
    noticePeriod: '15 Days',
    expectedCTC: '₹22 LPA',
  },
  {
    id: 'APP-803',
    name: 'Nikhil Kashyap',
    email: 'nikhil.k@gmail.com',
    phone: '+91 98450 77889',
    role: 'DevOps & SRE Specialist',
    department: 'Cloud & DevOps',
    experience: '5 Years',
    currentCompany: 'TCS Cloud Services',
    stage: 'Screening',
    rating: 4.2,
    appliedDate: '18 May 2025',
    resumeUrl: '#',
    noticePeriod: '60 Days',
    expectedCTC: '₹20 LPA',
  },
  {
    id: 'APP-804',
    name: 'Meera Chawla',
    email: 'meera.c@gmail.com',
    phone: '+91 99321 00998',
    role: 'Digital Growth Lead',
    department: 'Marketing',
    experience: '2.5 Years',
    currentCompany: 'GrowthX Agency',
    stage: 'Applied',
    rating: 4.0,
    appliedDate: '19 May 2025',
    resumeUrl: '#',
    noticePeriod: 'Immediate',
    expectedCTC: '₹12 LPA',
  },
];

const applicationSlice = createSlice({
  name: 'applications',
  initialState: {
    candidates: initialCandidates,
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
