import { createSlice } from '@reduxjs/toolkit';

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: {
    isCheckedIn: false,
    lastCheckInTime: null,
    lastCheckOutTime: null,
    totalWorkMinutesToday: 0,
    leaveBalances: {
      casual: { total: 12, used: 0, available: 12 },
      medical: { total: 10, used: 0, available: 10 },
      privilege: { total: 15, used: 0, available: 15 },
      compensatory: { total: 0, used: 0, available: 0 },
    },
    logs: [],
    leaveRequests: [],
  },
  reducers: {
    toggleClockInOut: (state) => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateStr = now.toISOString().split('T')[0];

      if (state.isCheckedIn) {
        state.isCheckedIn = false;
        state.lastCheckOutTime = timeStr;
        const existingIdx = state.logs.findIndex((l) => l.date === dateStr);
        if (existingIdx !== -1) {
          state.logs[existingIdx].checkOut = timeStr;
          state.logs[existingIdx].workingHours = '8h 45m';
        }
      } else {
        state.isCheckedIn = true;
        state.lastCheckInTime = timeStr;
        state.logs.unshift({
          id: Date.now(),
          date: dateStr,
          checkIn: timeStr,
          checkOut: 'In Progress',
          workingHours: 'Live',
          status: 'Present',
          mode: 'Web Portal Punch',
        });
      }
    },
    applyLeave: (state, action) => {
      const newLeave = {
        id: `LR-${Math.floor(200 + Math.random() * 800)}`,
        status: 'Pending Review',
        appliedOn: new Date().toISOString().split('T')[0],
        ...action.payload,
      };
      state.leaveRequests.unshift(newLeave);
    },
    updateLeaveStatus: (state, action) => {
      const { id, status } = action.payload;
      const target = state.leaveRequests.find((l) => l.id === id);
      if (target) {
        target.status = status;
      }
    },
  },
});

export const { toggleClockInOut, applyLeave, updateLeaveStatus } = attendanceSlice.actions;
export default attendanceSlice.reducer;
