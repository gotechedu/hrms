import { createSlice } from '@reduxjs/toolkit';

const initialProjects = [
  {
    id: 'PRJ-101',
    name: 'Enterprise School ERP & SIS Platform',
    client: 'St. Xavier Global Academy',
    category: 'Full-Stack Web & Mobile',
    lead: 'Priya Sundaram',
    teamSize: 8,
    progress: 82,
    status: 'In Progress',
    deadline: '30 Jun 2025',
    budget: '₹45,00,000',
    tags: ['Next.js', 'PostgreSQL', 'Tailwind', 'Docker'],
  },
  {
    id: 'PRJ-102',
    name: 'Autonomous Legal Contract Analyzer (LLM)',
    client: 'Lexis Nexis Advisory Corp',
    category: 'GenAI & Multi-Agent',
    lead: 'Rohan Mehra',
    teamSize: 5,
    progress: 65,
    status: 'In Progress',
    deadline: '15 Aug 2025',
    budget: '₹60,00,000',
    tags: ['LangGraph', 'Python', 'FastAPI', 'Qdrant'],
  },
  {
    id: 'PRJ-103',
    name: 'Multi-Cloud Kubernetes Zero-Downtime Migration',
    client: 'HealthPlus Telemedicine',
    category: 'Cloud DevOps',
    lead: 'Ananya Verma',
    teamSize: 4,
    progress: 95,
    status: 'Review & QA',
    deadline: '10 Jun 2025',
    budget: '₹35,00,000',
    tags: ['AWS EKS', 'Azure AKS', 'Terraform', 'Helm'],
  },
  {
    id: 'PRJ-104',
    name: 'FinTech SOC 2 Type II Security Hardening',
    client: 'PayStream Gateway India',
    category: 'Cybersecurity',
    lead: 'Arjun Dasgupta',
    teamSize: 6,
    progress: 40,
    status: 'In Progress',
    deadline: '30 Sep 2025',
    budget: '₹50,00,000',
    tags: ['SIEM', 'Zero-Trust', 'WAF', 'PenTest'],
  },
];

const projectSlice = createSlice({
  name: 'projects',
  initialState: {
    projects: initialProjects,
    filterStatus: 'All',
  },
  reducers: {
    addProject: (state, action) => {
      state.projects.unshift({
        id: `PRJ-${Math.floor(100 + Math.random() * 900)}`,
        progress: 0,
        status: 'In Progress',
        teamSize: 3,
        ...action.payload,
      });
    },
    updateProjectProgress: (state, action) => {
      const { id, progress, status } = action.payload;
      const proj = state.projects.find((p) => p.id === id);
      if (proj) {
        if (progress !== undefined) proj.progress = progress;
        if (status !== undefined) proj.status = status;
      }
    },
    setFilterStatus: (state, action) => {
      state.filterStatus = action.payload;
    },
  },
});

export const { addProject, updateProjectProgress, setFilterStatus } = projectSlice.actions;
export default projectSlice.reducer;
