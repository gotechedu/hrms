import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { employeeApi } from '../../Service/employeeApi';

/**
 * Fetch real system employees from MongoDB API
 */
export const fetchChatEmployees = createAsyncThunk(
  'chat/fetchChatEmployees',
  async (_, { rejectWithValue }) => {
    try {
      const response = await employeeApi.getEmployees({ limit: 100 });
      // Employee API returns { success: true, count, employees: [...] }
      const employees = response.employees || response.data || (Array.isArray(response) ? response : []);
      return employees;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch chat employees');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    channels: [],
    directMessages: [],
    messages: {},
    activeChatId: null,
    searchFilter: '',
    loadingEmployees: false,
    error: null,
  },
  reducers: {
    setActiveChat: (state, action) => {
      state.activeChatId = action.payload;
      const dm = state.directMessages.find((d) => d.id === action.payload);
      if (dm) dm.unread = 0;
    },
    sendMessage: (state, action) => {
      const { chatId, text, senderName, senderAvatar } = action.payload;
      if (!chatId) return;
      if (!state.messages[chatId]) {
        state.messages[chatId] = [];
      }
      const now = new Date();
      state.messages[chatId].push({
        id: Date.now(),
        sender: senderName || 'You',
        role: 'Team Member',
        avatar: senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text,
        isMe: true,
      });
    },
    setSearchFilter: (state, action) => {
      state.searchFilter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatEmployees.pending, (state) => {
        state.loadingEmployees = true;
        state.error = null;
      })
      .addCase(fetchChatEmployees.fulfilled, (state, action) => {
        state.loadingEmployees = false;
        const employees = action.payload;
        if (Array.isArray(employees) && employees.length > 0) {
          state.directMessages = employees.map((emp) => {
            const fullName = emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Employee';
            return {
              id: `dm-${emp._id || emp.employeeId}`,
              _id: emp._id,
              employeeId: emp.employeeId,
              name: fullName,
              role: emp.designation || emp.role || 'Staff Member',
              avatar:
                emp.profilePicture ||
                emp.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=2563eb&color=fff`,
              online: emp.status === 'Active',
              lastSeen: emp.status === 'Active' ? 'Active now' : 'Offline',
              unread: 0,
              department: emp.department || 'General',
              email: emp.email,
              phone: emp.phone,
            };
          });

          // Set default active chat to first real DB employee if not set or invalid
          if (!state.activeChatId || !state.directMessages.some((d) => d.id === state.activeChatId)) {
            state.activeChatId = state.directMessages[0].id;
          }
        }
      })
      .addCase(fetchChatEmployees.rejected, (state, action) => {
        state.loadingEmployees = false;
        state.error = action.payload;
      });
  },
});

export const { setActiveChat, sendMessage, setSearchFilter } = chatSlice.actions;
export default chatSlice.reducer;
