import { createSlice } from '@reduxjs/toolkit';

const initialLogs = [
  { id: 1, date: '2025-05-19', checkIn: '09:02 AM', checkOut: '06:14 PM', workingHours: '9h 12m', status: 'Present', mode: 'Office Biometric' },
  { id: 2, date: '2025-05-18', checkIn: '09:15 AM', checkOut: '06:30 PM', workingHours: '9h 15m', status: 'Present', mode: 'Office Biometric' },
  { id: 3, date: '2025-05-17', checkIn: '08:55 AM', checkOut: '05:58 PM', workingHours: '9h 03m', status: 'Present', mode: 'Remote Geo-Punch' },
  { id: 4, date: '2025-05-16', checkIn: '—', checkOut: '—', workingHours: '0h 00m', status: 'Paid Leave', mode: 'Casual Leave Approved' },
  { id: 5, date: '2025-05-15', checkIn: '09:05 AM', checkOut: '06:10 PM', workingHours: '9h 05m', status: 'Present', mode: 'Office Biometric' },
  { id: 6, date: '2025-05-14', checkIn: '09:40 AM', checkOut: '06:45 PM', workingHours: '9h 05m', status: 'Late', mode: 'Office Biometric' },
];

const initialLeaves = [
  { id: 'LR-201', type: 'Casual Leave', from: '2025-06-02', to: '2025-06-03', days: 2, reason: 'Family engagement and travel', status: 'Approved', appliedOn: '2025-05-15' },
  { id: 'LR-202', type: 'Medical Leave', from: '2025-05-16', to: '2025-05-16', days: 1, reason: 'Routine health checkup', status: 'Approved', appliedOn: '2025-05-14' },
  { id: 'LR-203', type: 'Privilege Leave', from: '2025-07-10', to: '2025-07-15', days: 5, reason: 'Annual vacation with family', status: 'Pending Review', appliedOn: '2025-05-18' },
];

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: {
    isCheckedIn: true,
    lastCheckInTime: '09:02 AM',
    lastCheckOutTime: null,
    totalWorkMinutesToday: 320,
    leaveBalances: {
      casual: { total: 12, used: 3, available: 9 },
      medical: { total: 10, used: 1, available: 9 },
      privilege: { total: 15, used: 4, available: 11 },
      compensatory: { total: 4, used: 0, available: 4 },
    },
    logs: initialLogs,
    leaveRequests: initialLeaves,
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
