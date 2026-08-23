import { createSlice } from '@reduxjs/toolkit';

const initialTimesheets = [
  {
    id: 'TS-2025-W20',
    week: '12 May 2025 – 18 May 2025',
    project: 'Enterprise ERP Suite V3',
    client: 'Apex Global Logistics',
    mon: 8, tue: 8.5, wed: 8, thu: 7.5, fri: 8, sat: 0, sun: 0,
    totalHours: 40,
    billable: 38,
    status: 'Approved',
    submittedOn: '18 May 2025',
  },
  {
    id: 'TS-2025-W21',
    week: '19 May 2025 – 25 May 2025',
    project: 'Autonomous AI Copilot Engine',
    client: 'FinTech Innovations Ltd',
    mon: 8.5, tue: 8, wed: 9, thu: 8, fri: 7.5, sat: 0, sun: 0,
    totalHours: 41,
    billable: 40,
    status: 'Submitted',
    submittedOn: '25 May 2025',
  },
  {
    id: 'TS-2025-W22',
    week: '26 May 2025 – 01 Jun 2025',
    project: 'Cloud Security Audit & Zero-Trust',
    client: 'MediCare Health Systems',
    mon: 7, tue: 8, wed: 8, thu: 8, fri: 8, sat: 0, sun: 0,
    totalHours: 39,
    billable: 36,
    status: 'Draft',
    submittedOn: '—',
  },
];

const timesheetSlice = createSlice({
  name: 'timesheets',
  initialState: {
    timesheets: initialTimesheets,
    selectedWeek: 'Current Week',
  },
  reducers: {
    addTimesheet: (state, action) => {
      state.timesheets.unshift({
        id: `TS-${Date.now()}`,
        status: 'Submitted',
        submittedOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        ...action.payload,
      });
    },
    updateTimesheetStatus: (state, action) => {
      const { id, status } = action.payload;
      const item = state.timesheets.find((t) => t.id === id);
      if (item) {
        item.status = status;
      }
    },
  },
});

export const { addTimesheet, updateTimesheetStatus } = timesheetSlice.actions;
export default timesheetSlice.reducer;
