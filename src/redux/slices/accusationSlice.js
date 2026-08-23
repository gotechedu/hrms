import { createSlice } from '@reduxjs/toolkit';

const initialAccusations = [
  {
    id: 'GRV-301',
    subject: 'Workplace Noise & Meeting Room Scheduling Conflict',
    category: 'Workplace Environment',
    filedBy: 'Anonymous Employee',
    department: 'Engineering',
    date: '14 May 2025',
    severity: 'Low',
    status: 'Resolved', // 'Under Investigation' | 'Review by HR' | 'Resolved' | 'Action Taken'
    assignedTo: 'Vikramaditya Sharma (HR Lead)',
    summary: 'Frequent overlap in 4th Floor meeting pods causing sprint standup disruptions.',
    resolutionNotes: 'Updated Google Calendar resource quotas and added acoustic privacy baffles.',
  },
  {
    id: 'GRV-302',
    subject: 'Overtime Compensation & Off-Hours Deployment Reimbursement',
    category: 'Payroll & Overtime',
    filedBy: 'Cloud DevOps Squad',
    department: 'Cloud & DevOps',
    date: '16 May 2025',
    severity: 'Medium',
    status: 'Review by HR',
    assignedTo: 'Finance & HR Committee',
    summary: 'Weekend production maintenance windows compensation guidelines clarification needed.',
    resolutionNotes: 'HR policy addendum under review with CFO.',
  },
  {
    id: 'GRV-303',
    subject: 'Hardware Upgrade Request for Local LLM Model Fine-Tuning',
    category: 'Equipment & Infrastructure',
    filedBy: 'AI Research Team',
    department: 'AI & Data',
    date: '18 May 2025',
    severity: 'Medium',
    status: 'Action Taken',
    assignedTo: 'IT Operations',
    summary: 'Requirement for high-VRAM workstation GPU cards to support unquantized weights evaluation.',
    resolutionNotes: 'Approved 2x RTX 4090 GPU workstations; PO issued.',
  },
];

const accusationSlice = createSlice({
  name: 'accusations',
  initialState: {
    accusations: initialAccusations,
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
