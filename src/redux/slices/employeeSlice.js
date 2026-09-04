import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { employeeApi } from '../../Service';



// Async Thunks
export const fetchEmployees = createAsyncThunk(
  'employee/fetchEmployees',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await employeeApi.getEmployees(params);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch employee list');
    }
  }
);

export const fetchEmployeeStats = createAsyncThunk(
  'employee/fetchEmployeeStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await employeeApi.getStats();
      return response.stats;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load employee statistics');
    }
  }
);

export const fetchDepartments = createAsyncThunk(
  'employee/fetchDepartments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await employeeApi.getDepartments();
      return response.departments;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load departments');
    }
  }
);

export const createNewEmployee = createAsyncThunk(
  'employee/createNewEmployee',
  async (employeeData, { rejectWithValue }) => {
    try {
      const response = await employeeApi.createEmployee(employeeData);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create employee profile');
    }
  }
);

export const updateExistingEmployee = createAsyncThunk(
  'employee/updateExistingEmployee',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await employeeApi.updateEmployee(id, data);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update employee details');
    }
  }
);

export const removeEmployee = createAsyncThunk(
  'employee/removeEmployee',
  async (id, { rejectWithValue }) => {
    try {
      const response = await employeeApi.deleteEmployee(id);
      return { id, message: response.message };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete employee profile');
    }
  }
);

const employeeSlice = createSlice({
  name: 'employee',
  initialState: {
    employees: [],
    stats: {
      total: 0,
      active: 0,
      onLeave: 0,
      probation: 0,
      inactive: 0,
    },
    departments: [
      'All',
      'Engineering',
      'AI & Data Science',
      'Cloud & DevOps',
      'Cybersecurity',
      'Marketing & Growth',
      'People Operations & HR',
    ],
    selectedEmployee: null,
    searchQuery: '',
    selectedDepartment: 'All',
    selectedStatus: 'All',
    selectedRole: 'All',
    loading: false,
    error: null,
    actionSuccessMessage: null,
  },
  reducers: {
    selectEmployee: (state, action) => {
      state.selectedEmployee = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSelectedDepartment: (state, action) => {
      state.selectedDepartment = action.payload;
    },
    setSelectedStatus: (state, action) => {
      state.selectedStatus = action.payload;
    },
    setSelectedRole: (state, action) => {
      state.selectedRole = action.payload;
    },
    clearActionMessage: (state) => {
      state.actionSuccessMessage = null;
      state.error = null;
    },
    // Local optimistic fallbacks
    addEmployee: (state, action) => {
      const newEmp = {
        _id: `temp-${Date.now()}`,
        id: `GTE-${Math.floor(1000 + Math.random() * 9000)}`,
        employeeId: `GTE-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'Active',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(action.payload.name)}`,
        ...action.payload,
      };
      state.employees.unshift(newEmp);
    },
    updateEmployee: (state, action) => {
      const idx = state.employees.findIndex((e) => e._id === action.payload._id || e.employeeId === action.payload.employeeId);
      if (idx !== -1) {
        state.employees[idx] = { ...state.employees[idx], ...action.payload };
      }
    },
    deleteEmployee: (state, action) => {
      state.employees = state.employees.filter((e) => e._id !== action.payload && e.employeeId !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Employees
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.employees) {
          state.employees = action.payload.employees.map((emp) => ({
            ...emp,
            id: emp.employeeId || emp._id,
            avatar: emp.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(emp.name)}`,
          }));
        }
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Stats
      .addCase(fetchEmployeeStats.fulfilled, (state, action) => {
        if (action.payload) {
          state.stats = action.payload;
        }
      })

      // Fetch Departments
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        if (action.payload && Array.isArray(action.payload)) {
          state.departments = action.payload;
        }
      })

      // Create Employee
      .addCase(createNewEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.actionSuccessMessage = 'Employee created successfully!';
        if (action.payload && action.payload.employee) {
          const emp = action.payload.employee;
          state.employees.unshift({
            ...emp,
            id: emp.employeeId || emp._id,
            avatar: emp.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(emp.name)}`,
          });
        }
      })
      .addCase(createNewEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Employee
      .addCase(updateExistingEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExistingEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.actionSuccessMessage = 'Employee updated successfully!';
        if (action.payload && action.payload.employee) {
          const updated = action.payload.employee;
          const idx = state.employees.findIndex((e) => e._id === updated._id || e.employeeId === updated.employeeId);
          if (idx !== -1) {
            state.employees[idx] = {
              ...state.employees[idx],
              ...updated,
              id: updated.employeeId || updated._id,
            };
          }
        }
      })
      .addCase(updateExistingEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Remove Employee
      .addCase(removeEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.actionSuccessMessage = 'Employee deleted successfully!';
        state.employees = state.employees.filter(
          (e) => e._id !== action.payload.id && e.employeeId !== action.payload.id
        );
      })
      .addCase(removeEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  selectEmployee,
  setSearchQuery,
  setSelectedDepartment,
  setSelectedStatus,
  setSelectedRole,
  clearActionMessage,
  addEmployee,
  updateEmployee,
  deleteEmployee,
} = employeeSlice.actions;

export default employeeSlice.reducer;
