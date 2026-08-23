import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import employeeReducer from './slices/employeeSlice';
import attendanceReducer from './slices/attendanceSlice';
import timesheetReducer from './slices/timesheetSlice';
import projectReducer from './slices/projectSlice';
import taskReducer from './slices/taskSlice';
import holidayReducer from './slices/holidaySlice';
import applicationReducer from './slices/applicationSlice';
import accusationReducer from './slices/accusationSlice';
import blogReducer from './slices/blogSlice';
import profileReducer from './slices/profileSlice';
import uiReducer from './slices/uiSlice';
import chatReducer from './slices/chatSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    employee: employeeReducer,
    attendance: attendanceReducer,
    timesheets: timesheetReducer,
    projects: projectReducer,
    tasks: taskReducer,
    holidays: holidayReducer,
    applications: applicationReducer,
    accusations: accusationReducer,
    blogs: blogReducer,
    profile: profileReducer,
    ui: uiReducer,
    chat: chatReducer,
  },
});

export default store;
