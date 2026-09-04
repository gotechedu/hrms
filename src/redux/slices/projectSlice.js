import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { projectApi } from '../../Service/projectApi';

export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await projectApi.getProjects(params);
      return response.data || [];
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch projects');
    }
  }
);

export const addProjectAsync = createAsyncThunk(
  'projects/addProjectAsync',
  async (projectData, { rejectWithValue }) => {
    try {
      const response = await projectApi.createProject(projectData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create project');
    }
  }
);

export const updateProjectProgressAsync = createAsyncThunk(
  'projects/updateProjectProgressAsync',
  async ({ id, progress, status }, { rejectWithValue }) => {
    try {
      const response = await projectApi.updateProjectProgress(id, { progress, status });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update progress');
    }
  }
);

export const deleteProjectAsync = createAsyncThunk(
  'projects/deleteProjectAsync',
  async (id, { rejectWithValue }) => {
    try {
      await projectApi.deleteProject(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete project');
    }
  }
);

const projectSlice = createSlice({
  name: 'projects',
  initialState: {
    projects: [],
    filterStatus: 'All',
    loading: true,
    error: null,
  },
  reducers: {
    addProject: (state, action) => {
      const randId = `PRJ-${Math.floor(100 + Math.random() * 900)}`;
      state.projects.unshift({
        _id: action.payload._id || randId,
        id: action.payload.projectId || randId,
        projectId: action.payload.projectId || randId,
        progress: 0,
        status: 'In Progress',
        tags: action.payload.tags || ['Web'],
        ...action.payload,
      });
    },
    updateProjectProgress: (state, action) => {
      const { id, progress, status } = action.payload;
      const proj = state.projects.find((p) => p.id === id || p._id === id || p.projectId === id);
      if (proj) {
        if (progress !== undefined) proj.progress = progress;
        if (status !== undefined) proj.status = status;
      }
    },
    deleteProject: (state, action) => {
      state.projects = state.projects.filter(
        (p) => p.id !== action.payload && p._id !== action.payload && p.projectId !== action.payload
      );
    },
    setFilterStatus: (state, action) => {
      state.filterStatus = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.length > 0) {
          state.projects = action.payload.map((p) => ({
            ...p,
            id: p.projectId || p._id,
            lead: p.leadName || (p.lead ? `${p.lead.firstName} ${p.lead.lastName}` : 'Lead Architect'),
          }));
        }
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addProjectAsync.fulfilled, (state, action) => {
        const p = action.payload;
        const item = {
          ...p,
          id: p.projectId || p._id,
          lead: p.leadName || (p.lead ? `${p.lead.firstName} ${p.lead.lastName}` : 'Lead Architect'),
        };
        state.projects.unshift(item);
      })
      .addCase(updateProjectProgressAsync.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.projects.findIndex(
          (p) => p._id === updated._id || p.id === updated.projectId || p.projectId === updated.projectId
        );
        if (index !== -1) {
          state.projects[index] = {
            ...state.projects[index],
            ...updated,
            id: updated.projectId || updated._id,
            lead: updated.leadName || (updated.lead ? `${updated.lead.firstName} ${updated.lead.lastName}` : state.projects[index].lead),
          };
        }
      })
      .addCase(deleteProjectAsync.fulfilled, (state, action) => {
        state.projects = state.projects.filter(
          (p) => p.id !== action.payload && p._id !== action.payload && p.projectId !== action.payload
        );
      });
  },
});

export const { addProject, updateProjectProgress, deleteProject, setFilterStatus } = projectSlice.actions;
export default projectSlice.reducer;
