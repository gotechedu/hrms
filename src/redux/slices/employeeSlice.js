import { createSlice } from '@reduxjs/toolkit';

const initialEmployees = [
  {
    id: 'GTE-101',
    name: 'Priya Sundaram',
    email: 'priya.s@gotechedu.com',
    phone: '+91 98450 12345',
    department: 'Engineering',
    role: 'Lead Next.js Architect',
    type: 'Full-Time',
    status: 'Active',
    joinDate: '10 Feb 2022',
    salary: '₹24,00,000 PA',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    location: 'Gurugram, HQ',
  },
  {
    id: 'GTE-102',
    name: 'Rohan Mehra',
    email: 'rohan.m@gotechedu.com',
    phone: '+91 97120 54321',
    department: 'AI & Data Science',
    role: 'Principal LLM Engineer',
    type: 'Full-Time',
    status: 'Active',
    joinDate: '18 Jul 2022',
    salary: '₹28,00,000 PA',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    location: 'Remote (Bengaluru)',
  },
  {
    id: 'GTE-103',
    name: 'Ananya Verma',
    email: 'ananya.v@gotechedu.com',
    phone: '+91 96540 98765',
    department: 'Cloud & DevOps',
    role: 'Senior Kubernetes SRE',
    type: 'Full-Time',
    status: 'On Leave',
    joinDate: '05 Jan 2023',
    salary: '₹20,00,000 PA',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    location: 'Gurugram, HQ',
  },
  {
    id: 'GTE-104',
    name: 'Arjun Dasgupta',
    email: 'arjun.d@gotechedu.com',
    phone: '+91 98111 22334',
    department: 'Cybersecurity',
    role: 'Security Operations Lead',
    type: 'Full-Time',
    status: 'Active',
    joinDate: '12 Nov 2021',
    salary: '₹22,00,000 PA',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    location: 'Hybrid (Noida)',
  },
  {
    id: 'GTE-105',
    name: 'Sneha Kulkarni',
    email: 'sneha.k@gotechedu.com',
    phone: '+91 99200 44556',
    department: 'Marketing & Growth',
    role: 'Director of Growth Marketing',
    type: 'Full-Time',
    status: 'Active',
    joinDate: '01 Mar 2023',
    salary: '₹18,00,000 PA',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    location: 'Gurugram, HQ',
  },
  {
    id: 'GTE-106',
    name: 'Devendra Rao',
    email: 'devendra.r@gotechedu.com',
    phone: '+91 98330 66778',
    department: 'People Operations & HR',
    role: 'Talent Acquisition Specialist',
    type: 'Contract',
    status: 'Active',
    joinDate: '15 Aug 2023',
    salary: '₹12,00,000 PA',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    location: 'Gurugram, HQ',
  },
];

const employeeSlice = createSlice({
  name: 'employee',
  initialState: {
    employees: initialEmployees,
    selectedEmployee: null,
    searchQuery: '',
    selectedDepartment: 'All',
    selectedStatus: 'All',
  },
  reducers: {
    addEmployee: (state, action) => {
      state.employees.unshift({
        id: `GTE-${Math.floor(100 + Math.random() * 900)}`,
        joinDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        status: 'Active',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(action.payload.name)}`,
        ...action.payload,
      });
    },
    updateEmployee: (state, action) => {
      const idx = state.employees.findIndex((e) => e.id === action.payload.id);
      if (idx !== -1) {
        state.employees[idx] = { ...state.employees[idx], ...action.payload };
      }
    },
    deleteEmployee: (state, action) => {
      state.employees = state.employees.filter((e) => e.id !== action.payload);
    },
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
  },
});

export const {
  addEmployee,
  updateEmployee,
  deleteEmployee,
  selectEmployee,
  setSearchQuery,
  setSelectedDepartment,
  setSelectedStatus,
} = employeeSlice.actions;
export default employeeSlice.reducer;
