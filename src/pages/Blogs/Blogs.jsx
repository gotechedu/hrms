import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  FileText,
  Plus,
  Search,
  Calendar,
  Clock,
  Trash2,
  Edit2,
  Sparkles,
  CheckCircle2,
  X,
  RefreshCw,
  Eye,
  Tag,
  ArrowUpRight,
} from 'lucide-react';
import { blogApi } from '../../Service';

export default function Blogs() {
  const { user } = useSelector((state) => state.auth);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);

  const userRole = (user?.role || '').toLowerCase();
  const canManage = ['superadmin', 'admin', 'hr', 'manager', 'teamlead', 'employee'].includes(userRole);

  const initialForm = {
    title: '',
    category: 'Technology',
    readTime: '5 min read',
    coverImage: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80',
    badge: 'Featured Insight',
    description: '',
    content: '',
    tags: 'AI, Next.js, Engineering, Cloud',
    status: 'Published',
  };
  const [form, setForm] = useState(initialForm);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await blogApi.getBlogs({
        category: selectedCategory,
        search: searchQuery,
      });
      if (res && res.blogs) {
        setBlogs(res.blogs);
      }
    } catch (err) {
      console.error('Fetch Blogs Error:', err);
      setError(err.message || 'Failed to load blogs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [selectedCategory]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBlogs();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSaveBlog = async (e) => {
    e.preventDefault();
    try {
      if (editingBlog) {
        await blogApi.updateBlog(editingBlog._id, form);
      } else {
        await blogApi.createBlog({
          ...form,
          author: {
            name: user?.name || 'Editorial Team',
            role: user?.role?.toUpperCase() || 'Tech Author',
            initials: (user?.name || 'ET').split(' ').map((n) => n[0]).join('').substring(0, 2),
            avatarBg: 'bg-blue-600',
          },
        });
      }
      setIsModalOpen(false);
      setEditingBlog(null);
      setForm(initialForm);
      fetchBlogs();
    } catch (err) {
      alert(err.message || 'Error saving blog publication');
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Delete blog post '${title}'?`)) {
      try {
        await blogApi.deleteBlog(id);
        fetchBlogs();
      } catch (err) {
        alert(err.message || 'Error deleting blog');
      }
    }
  };

  const openEditModal = (b) => {
    setEditingBlog(b);
    setForm({
      ...b,
      tags: Array.isArray(b.tags) ? b.tags.join(', ') : b.tags,
    });
    setIsModalOpen(true);
  };

  const categories = ['All', 'AI', 'Cloud', 'Technology', 'Cybersecurity', 'Education'];

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700">
            <FileText size={13} /> Corporate Insights & Thought Leadership
          </span>
          <h1 className="mt-2 font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
            Publications & Blog Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Create, curate, and publish technical insights displayed live on the official website blog feed
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={() => {
              setEditingBlog(null);
              setForm(initialForm);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/25 transition hover:opacity-95 active:scale-95 cursor-pointer"
          >
            <Plus size={16} />
            <span>Write New Article</span>
          </button>
        )}
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
          <span className="text-[11px] font-mono font-bold uppercase text-slate-400">Total Publications</span>
          <p className="text-xl font-heading font-black text-slate-900 mt-1">{blogs.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
          <span className="text-[11px] font-mono font-bold uppercase text-emerald-600">Published Live</span>
          <p className="text-xl font-heading font-black text-emerald-600 mt-1">
            {blogs.filter((b) => b.status === 'Published').length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
          <span className="text-[11px] font-mono font-bold uppercase text-blue-600">Official Portal</span>
          <p className="text-xs font-bold text-blue-700 uppercase mt-2 font-mono">/blog</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
          <span className="text-[11px] font-mono font-bold uppercase text-purple-600">Sync Engine</span>
          <p className="text-xs font-bold text-purple-700 uppercase mt-2 font-mono">Real-Time MongoDB</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
        <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search articles by title, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Blogs Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-3 text-xs text-slate-500 font-mono">Loading blog catalog from database...</p>
        </div>
      ) : blogs.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-2xs">
          <FileText size={36} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Publications Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Click "Write New Article" above to draft and publish industry insights.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <div
              key={blog._id}
              className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs transition-all hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
            >
              <div>
                {/* Cover Image */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                  <img
                    src={blog.coverImage || 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80'}
                    alt={blog.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="rounded-md bg-white/90 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase text-slate-800 shadow-xs">
                      {blog.category}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold backdrop-blur-xs shadow-xs ${
                        blog.status === 'Published'
                          ? 'bg-emerald-500/90 text-white'
                          : 'bg-amber-500/90 text-white'
                      }`}
                    >
                      {blog.status}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} /> {blog.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {blog.readTime}
                    </span>
                  </div>

                  <h3 className="mt-2 font-heading text-base font-bold text-slate-900 group-hover:text-blue-600 transition line-clamp-2">
                    {blog.title}
                  </h3>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {blog.description}
                  </p>

                  {/* Tags */}
                  <div className="mt-3.5 flex flex-wrap gap-1">
                    {(blog.tags || []).slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Author Strip & Actions */}
              <div className="border-t border-slate-100 p-4 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white text-[10px] font-bold">
                    {blog.author?.initials || 'ET'}
                  </div>
                  <span className="text-xs font-semibold text-slate-700 truncate max-w-[120px]">
                    {blog.author?.name || 'Editorial Team'}
                  </span>
                </div>

                {canManage && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(blog)}
                      className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:border-blue-400 hover:text-blue-600 transition bg-white cursor-pointer"
                      title="Edit Article"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(blog._id, blog.title)}
                      className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:border-rose-400 hover:text-rose-600 transition bg-white cursor-pointer"
                      title="Delete Article"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading text-lg font-bold text-slate-900">
                {editingBlog ? 'Edit Technical Article' : 'Compose New Thought Leadership Article'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveBlog} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                  Article Headline Title *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Next.js 16 App Router vs Traditional Single Page Apps"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none"
                  >
                    <option value="AI">AI</option>
                    <option value="Cloud">Cloud</option>
                    <option value="Technology">Technology</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="Education">Education</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Estimated Read Time
                  </label>
                  <input
                    type="text"
                    value={form.readTime}
                    onChange={(e) => setForm({ ...form, readTime: e.target.value })}
                    placeholder="5 min read"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                  Cover Image URL
                </label>
                <input
                  type="text"
                  value={form.coverImage}
                  onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="Next.js 16, React 19, Performance, Web Architecture"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                  Executive Excerpt / Short Summary *
                </label>
                <textarea
                  required
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="A concise 2-sentence teaser summarizing the core insight..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                  Article Body / Deep-Dive Content
                </label>
                <textarea
                  rows={4}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Full article content, benchmarks, code references, and conclusions..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/25 transition hover:opacity-95 cursor-pointer"
                >
                  {editingBlog ? 'Save Changes' : 'Publish Article Live'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
