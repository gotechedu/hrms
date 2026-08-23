import { createSlice } from '@reduxjs/toolkit';

const initialUser = {
  id: 'EMP-001',
  name: 'Vikramaditya Sharma',
  email: 'vikram.sharma@gotechedu.com',
  role: 'HR Administrator', // 'HR Administrator' | 'Employee' | 'Project Manager'
  department: 'People Operations & HR',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  employeeId: 'GTE-2024-889',
  joiningDate: '15 Jan 2022',
  phone: '+91 98765 43210',
};

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: true,
    user: initialUser,
    loading: false,
    error: null,
    passwordResetSent: false,
  },
  reducers: {
    login: (state, action) => {
      const { email, role = 'HR Administrator' } = action.payload;
      state.isAuthenticated = true;
      state.user = {
        ...initialUser,
        email: email || initialUser.email,
        role: role,
        name: role === 'Employee' ? 'Aarav Patel' : 'Vikramaditya Sharma',
      };
      state.error = null;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
    },
    switchRole: (state, action) => {
      if (state.user) {
        state.user.role = action.payload;
      }
    },
    requestPasswordReset: (state) => {
      state.passwordResetSent = true;
    },
    clearPasswordReset: (state) => {
      state.passwordResetSent = false;
    },
    updateUserAvatar: (state, action) => {
      if (state.user) {
        state.user.avatar = action.payload;
      }
    },
  },
});

export const { login, logout, switchRole, requestPasswordReset, clearPasswordReset, updateUserAvatar } = authSlice.actions;
export default authSlice.reducer;
