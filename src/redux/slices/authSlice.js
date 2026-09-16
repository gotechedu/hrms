import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../../Service';

// Retrieve stored session if available
const storedToken = localStorage.getItem('gotech_hrms_token') || null;
let storedUser = null;
try {
  const rawUser = localStorage.getItem('gotech_hrms_user');
  if (rawUser) storedUser = JSON.parse(rawUser);
} catch {
  storedUser = null;
}



// Async Thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      if (response.token) {
        localStorage.setItem('gotech_hrms_token', response.token);
        localStorage.setItem('gotech_hrms_user', JSON.stringify(response.user));
      }
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Login failed. Please check your credentials.');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { dispatch }) => {
    try {
      await authApi.logout();
    } catch (e) {
      console.warn('Logout API error:', e.message);
    } finally {
      dispatch(authSlice.actions.logout());
    }
    return { success: true };
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getMe();
      if (response.user) {
        localStorage.setItem('gotech_hrms_user', JSON.stringify(response.user));
      }
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to authenticate session.');
    }
  }
);

export const requestForgotPassword = createAsyncThunk(
  'auth/requestForgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authApi.forgotPassword(email);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to request password reset code.');
    }
  }
);

export const verifyOtpCode = createAsyncThunk(
  'auth/verifyOtpCode',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await authApi.verifyOtp(email, otp);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Invalid or expired OTP code.');
    }
  }
);

export const resetPasswordWithOtp = createAsyncThunk(
  'auth/resetPasswordWithOtp',
  async ({ email, otp, newPassword }, { rejectWithValue }) => {
    try {
      const response = await authApi.resetPassword(email, otp, newPassword);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to reset password.');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: storedToken,
    user: storedUser ,
    isAuthenticated: Boolean(storedToken || storedUser),
    loading: false,
    error: null,
    forgotPasswordSuccess: false,
    otpVerified: false,
    resetPasswordSuccess: false,
    demoOtp: null,
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('gotech_hrms_token');
      localStorage.removeItem('gotech_hrms_user');
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    switchRole: (state, action) => {
      if (state.user) {
        state.user.role = action.payload.toLowerCase();
      }
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    resetForgotState: (state) => {
      state.forgotPasswordSuccess = false;
      state.otpVerified = false;
      state.resetPasswordSuccess = false;
      state.demoOtp = null;
      state.error = null;
    },
    updateUserAvatar: (state, action) => {
      if (state.user) {
        state.user.avatar = action.payload;
        if (state.user.employeeProfile) {
          state.user.employeeProfile.avatar = action.payload;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login authentication failed';
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })

      // Fetch Me
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        localStorage.removeItem('gotech_hrms_token');
        localStorage.removeItem('gotech_hrms_user');
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
      })

      // Forgot Password
      .addCase(requestForgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.forgotPasswordSuccess = false;
      })
      .addCase(requestForgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.forgotPasswordSuccess = true;
        state.demoOtp = action.payload.otp || null;
        state.error = null;
      })
      .addCase(requestForgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Verify OTP
      .addCase(verifyOtpCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtpCode.fulfilled, (state) => {
        state.loading = false;
        state.otpVerified = true;
        state.error = null;
      })
      .addCase(verifyOtpCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Reset Password
      .addCase(resetPasswordWithOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPasswordWithOtp.fulfilled, (state) => {
        state.loading = false;
        state.resetPasswordSuccess = true;
        state.error = null;
      })
      .addCase(resetPasswordWithOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  logout,
  switchRole,
  clearAuthError,
  resetForgotState,
  updateUserAvatar,
} = authSlice.actions;

export default authSlice.reducer;
