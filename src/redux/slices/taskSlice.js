import { createSlice } from '@reduxjs/toolkit';

const initialTasks = [
  {
    id: 'TSK-501',
    title: 'Implement Multi-Tenant Row Level Security in PostgreSQL',
    project: 'Enterprise School ERP',
    assignee: 'Priya Sundaram',
    assigneeAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    priority: 'High',
    status: 'In Progress',
    deadline: '28 May 2025',
    subtasks: { completed: 3, total: 4 },
  },
  {
    id: 'TSK-502',
    title: 'Benchmark Vector Embeddings retrieval speed with Qdrant',
    project: 'Autonomous Legal Contract Analyzer',
    assignee: 'Rohan Mehra',
    assigneeAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    priority: 'Urgent',
    status: 'In Progress',
    deadline: '26 May 2025',
    subtasks: { completed: 2, total: 3 },
  },
  {
    id: 'TSK-503',
    title: 'Setup automated daily Terraform state backup to encrypted S3',
    project: 'Multi-Cloud Kubernetes',
    assignee: 'Ananya Verma',
    assigneeAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    priority: 'Medium',
    status: 'To Do',
    deadline: '30 May 2025',
    subtasks: { completed: 0, total: 2 },
  },
  {
    id: 'TSK-504',
    title: 'Conduct weekly SOC Telemetry log audit & generate report',
    project: 'FinTech SOC 2',
    assignee: 'Arjun Dasgupta',
    assigneeAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    priority: 'High',
    status: 'Review',
    deadline: '25 May 2025',
    subtasks: { completed: 5, total: 5 },
  },
  {
    id: 'TSK-505',
    title: 'Draft Q2 Product Release Tech Blog & LinkedIn Carousels',
    project: 'Marketing & Brand',
    assignee: 'Sneha Kulkarni',
    assigneeAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    priority: 'Normal',
    status: 'Done',
    deadline: '20 May 2025',
    subtasks: { completed: 4, total: 4 },
  },
];

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    tasks: initialTasks,
    viewMode: 'kanban', // 'kanban' | 'list'
    filterPriority: 'All',
  },
  reducers: {
    addTask: (state, action) => {
      state.tasks.unshift({
        id: `TSK-${Math.floor(500 + Math.random() * 500)}`,
        status: 'To Do',
        subtasks: { completed: 0, total: 1 },
        assigneeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        ...action.payload,
      });
    },
    updateTaskStatus: (state, action) => {
      const { id, status } = action.payload;
      const task = state.tasks.find((t) => t.id === id);
      if (task) {
        task.status = status;
      }
    },
    deleteTask: (state, action) => {
      state.tasks = state.tasks.filter((t) => t.id !== action.payload);
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    setFilterPriority: (state, action) => {
      state.filterPriority = action.payload;
    },
  },
});

export const { addTask, updateTaskStatus, deleteTask, setViewMode, setFilterPriority } = taskSlice.actions;
export default taskSlice.reducer;
