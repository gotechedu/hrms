import { createSlice } from '@reduxjs/toolkit';

const initialBlogs = [
  {
    id: 'BLG-101',
    title: 'GoTechEdu Q2 2025 All-Hands Summary & Enterprise Milestones',
    category: 'Company Update',
    author: 'Aditya Rai (Founder & CEO)',
    authorRole: 'Executive Leadership',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    date: '18 May 2025',
    readTime: '4 min read',
    tags: ['Townhall', 'Growth', 'Strategy'],
    cover: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
    summary: 'Key highlights from our quarterly roadmap: 40% enterprise revenue growth, SOC 2 Type II audit completion, and global customer expansions.',
    content: 'We are thrilled to celebrate unprecedented achievements across our engineering squads and corporate learning programs. Our AI automation solutions have enabled 15+ Fortune 500 partners to compress operational workflows.',
  },
  {
    id: 'BLG-102',
    title: 'Updated Hybrid Work Policy & Comprehensive Health Insurance Enhancements',
    category: 'HR & People Ops',
    author: 'Vikramaditya Sharma',
    authorRole: 'HR Administrator',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    date: '12 May 2025',
    readTime: '3 min read',
    tags: ['Policy', 'Benefits', 'Wellness'],
    cover: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
    summary: 'Announcing enhanced ₹15,00,000 OPD + IPD medical coverage for employees and direct family members with cashless network across 8,000+ hospitals.',
    content: 'At GoTechEdu, people are our highest leverage asset. We are proud to expand physical and mental wellness reimbursements, annual executive master health checkups, and gym stipend allowances.',
  },
  {
    id: 'BLG-103',
    title: 'Engineering Tech Briefing: Transitioning to React 19 & Next.js Server Actions',
    category: 'Engineering & Tech',
    author: 'Priya Sundaram',
    authorRole: 'Lead Architect',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    date: '05 May 2025',
    readTime: '6 min read',
    tags: ['React 19', 'Next.js', 'Performance'],
    cover: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
    summary: 'Best practices, migration benchmarks, and architectural takeaways from our frontend modernisation across multi-tenant enterprise dashboards.',
    content: 'By replacing heavy client state hydration with lightweight Server Components and streaming SSR, we observed a 45% decrease in First Contentful Paint (FCP).',
  },
];

const blogSlice = createSlice({
  name: 'blogs',
  initialState: {
    posts: initialBlogs,
    selectedCategory: 'All',
  },
  reducers: {
    addPost: (state, action) => {
      state.posts.unshift({
        id: `BLG-${Date.now()}`,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        readTime: '3 min read',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        cover: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
        ...action.payload,
      });
    },
    deletePost: (state, action) => {
      state.posts = state.posts.filter((p) => p.id !== action.payload);
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
  },
});

export const { addPost, deletePost, setSelectedCategory } = blogSlice.actions;
export default blogSlice.reducer;
