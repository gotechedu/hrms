import { createSlice } from '@reduxjs/toolkit';

const initialNotifications = [
  { id: 1, title: 'New Leave Request', desc: 'Arjun Dasgupta submitted medical leave for approval.', time: '10 min ago', unread: true, type: 'leave' },
  { id: 2, title: 'Timesheet Reminder', desc: 'Q2 Week 21 timesheet submission deadline today at 6 PM.', time: '1 hour ago', unread: true, type: 'timesheet' },
  { id: 3, title: 'Project Milestone Reached', desc: 'School ERP V3 reached 82% completion ahead of schedule.', time: '3 hours ago', unread: false, type: 'project' },
  { id: 4, title: 'Holiday Announcement', desc: 'Public Holiday on Monday for Buddha Purnima.', time: '1 day ago', unread: false, type: 'holiday' },
];

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarCollapsed: false,
    mobileSidebarOpen: false,
    notifications: initialNotifications,
    showNotificationsDropdown: false,
    searchModalOpen: false,
  },
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload;
    },
    toggleMobileSidebar: (state) => {
      state.mobileSidebarOpen = !state.mobileSidebarOpen;
    },
    setMobileSidebarOpen: (state, action) => {
      state.mobileSidebarOpen = action.payload;
    },
    toggleNotifications: (state) => {
      state.showNotificationsDropdown = !state.showNotificationsDropdown;
    },
    markAllNotificationsRead: (state) => {
      state.notifications.forEach((n) => {
        n.unread = false;
      });
    },
    setSearchModalOpen: (state, action) => {
      state.searchModalOpen = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  toggleMobileSidebar,
  setMobileSidebarOpen,
  toggleNotifications,
  markAllNotificationsRead,
  setSearchModalOpen,
} = uiSlice.actions;
export default uiSlice.reducer;
