import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { taskApi } from '../../Service/taskApi';

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await taskApi.getTasks(params);
      return response.data || [];
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch tasks');
    }
  }
);

export const addTaskAsync = createAsyncThunk(
  'tasks/addTaskAsync',
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await taskApi.createTask(taskData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create task');
    }
  }
);

export const updateTaskStatusAsync = createAsyncThunk(
  'tasks/updateTaskStatusAsync',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await taskApi.updateTaskStatus(id, { status });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update task status');
    }
  }
);

export const deleteTaskAsync = createAsyncThunk(
  'tasks/deleteTaskAsync',
  async (id, { rejectWithValue }) => {
    try {
      await taskApi.deleteTask(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete task');
    }
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    tasks: [],
    viewMode: 'kanban', // 'kanban' | 'list'
    filterPriority: 'All',
    loading: true,
    error: null,
  },
  reducers: {
    addTask: (state, action) => {
      const randId = `TSK-${Math.floor(500 + Math.random() * 500)}`;
      state.tasks.unshift({
        _id: action.payload._id || randId,
        id: action.payload.taskId || randId,
        taskId: action.payload.taskId || randId,
        status: 'To Do',
        projectName: action.payload.project || 'General Project',
        assigneeName: action.payload.assignee || 'Unassigned',
        ...action.payload,
      });
    },
    updateTaskStatus: (state, action) => {
      const { id, status } = action.payload;
      const task = state.tasks.find((t) => t.id === id || t._id === id || t.taskId === id);
      if (task) {
        task.status = status;
      }
    },
    deleteTask: (state, action) => {
      state.tasks = state.tasks.filter(
        (t) => t.id !== action.payload && t._id !== action.payload && t.taskId !== action.payload
      );
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    setFilterPriority: (state, action) => {
      state.filterPriority = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        const list = Array.isArray(action.payload) ? action.payload : [];
        state.tasks = list.map((t) => ({
          ...t,
          id: t.taskId || t._id,
          project: t.projectName || (t.project && typeof t.project === 'object' ? t.project.name : (t.project || 'General Project')),
          assignee: t.assigneeName || (t.assignee && typeof t.assignee === 'object' ? `${t.assignee.firstName || ''} ${t.assignee.lastName || ''}`.trim() : (t.assignee || 'Unassigned')),
        }));
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addTaskAsync.fulfilled, (state, action) => {
        const t = action.payload;
        if (!t) return;
        const item = {
          ...t,
          id: t.taskId || t._id,
          project: t.projectName || (t.project && typeof t.project === 'object' ? t.project.name : (t.project || 'General Project')),
          assignee: t.assigneeName || (t.assignee && typeof t.assignee === 'object' ? `${t.assignee.firstName || ''} ${t.assignee.lastName || ''}`.trim() : (t.assignee || 'Unassigned')),
        };
        state.tasks.unshift(item);
      })
      .addCase(updateTaskStatusAsync.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.tasks.findIndex(
          (t) => t._id === updated._id || t.id === updated.taskId || t.taskId === updated.taskId
        );
        if (index !== -1) {
          state.tasks[index].status = updated.status;
        }
      })
      .addCase(deleteTaskAsync.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(
          (t) => t.id !== action.payload && t._id !== action.payload && t.taskId !== action.payload
        );
      });
  },
});

export const { addTask, updateTaskStatus, deleteTask, setViewMode, setFilterPriority } = taskSlice.actions;
export default taskSlice.reducer;
