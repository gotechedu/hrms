import { createSlice } from '@reduxjs/toolkit';

const blogSlice = createSlice({
  name: 'blogs',
  initialState: {
    posts: [],
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
