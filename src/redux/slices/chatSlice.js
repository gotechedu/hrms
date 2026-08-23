import { createSlice } from '@reduxjs/toolkit';

const initialChannels = [
  { id: 'c-general', name: 'general-discussions', unread: 0, isChannel: true, description: 'Company-wide townhall updates, watercooler chat, and general announcements.' },
  { id: 'c-engineering', name: 'engineering-squad', unread: 2, isChannel: true, description: 'Next.js 16, PostgreSQL architecture, and sprint releases.' },
  { id: 'c-ai-rnd', name: 'ai-agents-rnd', unread: 1, isChannel: true, description: 'LLM fine-tuning, RAG vector pipelines, and prompt optimizations.' },
  { id: 'c-cloud', name: 'cloud-devops-sre', unread: 0, isChannel: true, description: 'Multi-cloud Kubernetes clusters, CI/CD pipelines, and uptime monitoring.' },
];

const initialDirectMessages = [
  {
    id: 'dm-priya',
    name: 'Priya Sundaram',
    role: 'Lead Next.js Architect',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    online: true,
    lastSeen: 'Active now',
    unread: 1,
    department: 'Engineering',
  },
  {
    id: 'dm-rohan',
    name: 'Rohan Mehra',
    role: 'Principal LLM Engineer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    online: true,
    lastSeen: 'Active now',
    unread: 0,
    department: 'AI & Data Science',
  },
  {
    id: 'dm-ananya',
    name: 'Ananya Verma',
    role: 'Senior SRE Architect',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    online: false,
    lastSeen: '15m ago',
    unread: 0,
    department: 'Cloud & DevOps',
  },
  {
    id: 'dm-arjun',
    name: 'Arjun Dasgupta',
    role: 'SOC Security Lead',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    online: true,
    lastSeen: 'Active now',
    unread: 0,
    department: 'Cybersecurity',
  },
  {
    id: 'dm-sneha',
    name: 'Sneha Kulkarni',
    role: 'Director of Growth Marketing',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    online: false,
    lastSeen: '2h ago',
    unread: 0,
    department: 'Marketing',
  },
];

const initialMessages = {
  'c-general': [
    {
      id: 1,
      sender: 'Aditya Rai',
      role: 'CEO',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      time: '10:15 AM',
      text: 'Good morning everyone! Great progress on the Q2 deliverables this week. Reminding all squad leads to review timesheets today.',
      isMe: false,
    },
    {
      id: 2,
      sender: 'Vikramaditya Sharma',
      role: 'HR Admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      time: '10:20 AM',
      text: 'All-Hands meeting is scheduled for Thursday at 4 PM IST. Calendar invites have been synced.',
      isMe: true,
    },
  ],
  'c-engineering': [
    {
      id: 1,
      sender: 'Priya Sundaram',
      role: 'Lead Next.js Architect',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      time: '11:05 AM',
      text: 'We just merged the multi-tenant row level security patch into the main branch. Zero downtime observed on staging.',
      isMe: false,
    },
    {
      id: 2,
      sender: 'Ananya Verma',
      role: 'SRE Lead',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      time: '11:12 AM',
      text: 'Verified EKS health checks. Pod auto-scaling responded in under 450ms. Great work squad!',
      isMe: false,
    },
  ],
  'c-ai-rnd': [
    {
      id: 1,
      sender: 'Rohan Mehra',
      role: 'Principal LLM Engineer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      time: '11:30 AM',
      text: 'The Qdrant vector embedding indexing benchmark completed: 100k legal contracts vectorized in 4.2 minutes with 98.6% recall accuracy.',
      isMe: false,
    },
  ],
  'c-cloud': [
    {
      id: 1,
      sender: 'Ananya Verma',
      role: 'Senior SRE Architect',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      time: '09:45 AM',
      text: 'Terraform multi-cloud state backups completed across both AWS ap-south-1 and Azure Central India.',
      isMe: false,
    },
  ],
  'dm-priya': [
    {
      id: 1,
      sender: 'Priya Sundaram',
      role: 'Lead Architect',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      time: '11:40 AM',
      text: 'Hi Vikram, could you check my submitted leave application for next Monday? Need 2 days for the Next.js conference.',
      isMe: false,
    },
    {
      id: 2,
      sender: 'Vikramaditya Sharma',
      role: 'HR Admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      time: '11:42 AM',
      text: 'Approved just now Priya! Have a great conference.',
      isMe: true,
    },
    {
      id: 3,
      sender: 'Priya Sundaram',
      role: 'Lead Architect',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      time: '11:45 AM',
      text: 'Thank you so much! Will share the architecture takeaways with the team on return.',
      isMe: false,
    },
  ],
};

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    channels: initialChannels,
    directMessages: initialDirectMessages,
    messages: initialMessages,
    activeChatId: 'c-engineering',
    searchFilter: '',
  },
  reducers: {
    setActiveChat: (state, action) => {
      state.activeChatId = action.payload;
      // Mark as read
      const ch = state.channels.find((c) => c.id === action.payload);
      if (ch) ch.unread = 0;
      const dm = state.directMessages.find((d) => d.id === action.payload);
      if (dm) dm.unread = 0;
    },
    sendMessage: (state, action) => {
      const { chatId, text, senderName, senderAvatar } = action.payload;
      if (!state.messages[chatId]) {
        state.messages[chatId] = [];
      }
      const now = new Date();
      state.messages[chatId].push({
        id: Date.now(),
        sender: senderName || 'Vikramaditya Sharma',
        role: 'You',
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
});

export const { setActiveChat, sendMessage, setSearchFilter } = chatSlice.actions;
export default chatSlice.reducer;
