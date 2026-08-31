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

const initialTasks = [
  {
    _id: 'tsk_501',
    id: 'TSK-501',
    taskId: 'TSK-501',
    title: 'Implement Multi-Tenant Row Level Security in PostgreSQL',
    project: null,
    projectName: 'Enterprise School ERP Platform',
    assignee: null,
    assigneeName: 'Priya Sundaram',
    priority: 'High',
    status: 'In Progress',
    deadline: '2025-06-15',
  },
  {
    _id: 'tsk_502',
    id: 'TSK-502',
    taskId: 'TSK-502',
    title: 'Benchmark Vector Embeddings retrieval speed with Qdrant',
    project: null,
    projectName: 'Autonomous Legal Contract Analyzer',
    assignee: null,
    assigneeName: 'Rohan Mehra',
    priority: 'Urgent',
    status: 'To Do',
    deadline: '2025-06-20',
  },
  {
    _id: 'tsk_503',
    id: 'TSK-503',
    taskId: 'TSK-503',
    title: 'Deploy EKS Autoscaling Worker Nodes with Karpenter',
    project: null,
    projectName: 'Multi-Cloud Kubernetes Automation',
    assignee: null,
    assigneeName: 'Ananya Verma',
    priority: 'Urgent',
    status: 'Review',
    deadline: '2025-06-10',
  },
  {
    _id: 'tsk_504',
    id: 'TSK-504',
    taskId: 'TSK-504',
    title: 'Conduct weekly SOC Telemetry log audit & generate report',
    project: null,
    projectName: 'FinTech SOC 2 Compliance Shield',
    assignee: null,
    assigneeName: 'Arjun Dasgupta',
    priority: 'Medium',
    status: 'Done',
    deadline: '2025-05-30',
  },
];

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    tasks: initialTasks,
    viewMode: 'kanban', // 'kanban' | 'list'
    filterPriority: 'All',
    loading: false,
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
        if (action.payload && action.payload.length > 0) {
          state.tasks = action.payload.map((t) => ({
            ...t,
            id: t.taskId || t._id,
            project: t.projectName || (t.project ? t.project.name : 'General Project'),
            assignee: t.assigneeName || (t.assignee ? `${t.assignee.firstName} ${t.assignee.lastName}` : 'Unassigned'),
          }));
        }
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addTaskAsync.fulfilled, (state, action) => {
        const t = action.payload;
        const item = {
          ...t,
          id: t.taskId || t._id,
          project: t.projectName || (t.project ? t.project.name : 'General Project'),
          assignee: t.assigneeName || (t.assignee ? `${t.assignee.firstName} ${t.assignee.lastName}` : 'Unassigned'),
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
