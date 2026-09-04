import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { discussionApi } from '../../Service/discussionApi';

export const fetchDiscussions = createAsyncThunk(
  'discussion/fetchDiscussions',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await discussionApi.getDiscussions(params);
      return response.data || [];
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch discussions');
    }
  }
);

export const fetchDiscussionStats = createAsyncThunk(
  'discussion/fetchDiscussionStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await discussionApi.getStats();
      return response.stats;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch discussion stats');
    }
  }
);

export const fetchDiscussionById = createAsyncThunk(
  'discussion/fetchDiscussionById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await discussionApi.getDiscussionById(id);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch discussion thread');
    }
  }
);

export const createDiscussionAsync = createAsyncThunk(
  'discussion/createDiscussionAsync',
  async (data, { rejectWithValue }) => {
    try {
      const response = await discussionApi.createDiscussion(data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create discussion');
    }
  }
);

export const updateDiscussionAsync = createAsyncThunk(
  'discussion/updateDiscussionAsync',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await discussionApi.updateDiscussion(id, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update discussion');
    }
  }
);

export const deleteDiscussionAsync = createAsyncThunk(
  'discussion/deleteDiscussionAsync',
  async (id, { rejectWithValue }) => {
    try {
      await discussionApi.deleteDiscussion(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete discussion');
    }
  }
);

export const addReplyAsync = createAsyncThunk(
  'discussion/addReplyAsync',
  async ({ id, content }, { rejectWithValue }) => {
    try {
      const response = await discussionApi.addReply(id, content);
      return { discussionId: id, discussion: response.data, reply: response.reply };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to post reply');
    }
  }
);

export const toggleLikeAsync = createAsyncThunk(
  'discussion/toggleLikeAsync',
  async (id, { rejectWithValue }) => {
    try {
      const response = await discussionApi.toggleLike(id);
      return { id, liked: response.liked, likesCount: response.likesCount };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to toggle like');
    }
  }
);

const discussionSlice = createSlice({
  name: 'discussion',
  initialState: {
    discussions: [],
    activeDiscussion: null,
    stats: {
      total: 0,
      open: 0,
      resolved: 0,
      totalReplies: 0,
    },
    loading: true,
    statsLoading: false,
    selectedCategory: 'All',
    selectedStatus: 'All',
    searchTerm: '',
    error: null,
  },
  reducers: {
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    setSelectedStatus: (state, action) => {
      state.selectedStatus = action.payload;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setActiveDiscussion: (state, action) => {
      state.activeDiscussion = action.payload;
    },
    clearActiveDiscussion: (state) => {
      state.activeDiscussion = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch discussions
      .addCase(fetchDiscussions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDiscussions.fulfilled, (state, action) => {
        state.loading = false;
        state.discussions = action.payload || [];
      })
      .addCase(fetchDiscussions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch stats
      .addCase(fetchDiscussionStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(fetchDiscussionStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        if (action.payload) {
          state.stats = action.payload;
        }
      })
      .addCase(fetchDiscussionStats.rejected, (state) => {
        state.statsLoading = false;
      })

      // Fetch by ID
      .addCase(fetchDiscussionById.fulfilled, (state, action) => {
        state.activeDiscussion = action.payload;
        const idx = state.discussions.findIndex((d) => d._id === action.payload._id);
        if (idx !== -1) {
          state.discussions[idx] = action.payload;
        }
      })

      // Create discussion
      .addCase(createDiscussionAsync.fulfilled, (state, action) => {
        state.discussions.unshift(action.payload);
        state.stats.total += 1;
        if (action.payload.status === 'Open') {
          state.stats.open += 1;
        }
      })

      // Update discussion
      .addCase(updateDiscussionAsync.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.discussions.findIndex((d) => d._id === updated._id);
        if (idx !== -1) {
          state.discussions[idx] = updated;
        }
        if (state.activeDiscussion && state.activeDiscussion._id === updated._id) {
          state.activeDiscussion = updated;
        }
      })

      // Delete discussion
      .addCase(deleteDiscussionAsync.fulfilled, (state, action) => {
        state.discussions = state.discussions.filter((d) => d._id !== action.payload);
        state.stats.total = Math.max(0, state.stats.total - 1);
        if (state.activeDiscussion && state.activeDiscussion._id === action.payload) {
          state.activeDiscussion = null;
        }
      })

      // Add reply
      .addCase(addReplyAsync.fulfilled, (state, action) => {
        const { discussionId, discussion } = action.payload;
        const idx = state.discussions.findIndex((d) => d._id === discussionId);
        if (idx !== -1) {
          state.discussions[idx] = discussion;
        }
        if (state.activeDiscussion && state.activeDiscussion._id === discussionId) {
          state.activeDiscussion = discussion;
        }
        state.stats.totalReplies += 1;
      })

      // Toggle like
      .addCase(toggleLikeAsync.fulfilled, (state, action) => {
        const { id, likesCount } = action.payload;
        const disc = state.discussions.find((d) => d._id === id);
        if (disc) {
          disc._likesCount = likesCount;
        }
        if (state.activeDiscussion && state.activeDiscussion._id === id) {
          state.activeDiscussion._likesCount = likesCount;
        }
      });
  },
});

export const {
  setSelectedCategory,
  setSelectedStatus,
  setSearchTerm,
  setActiveDiscussion,
  clearActiveDiscussion,
} = discussionSlice.actions;

export default discussionSlice.reducer;
