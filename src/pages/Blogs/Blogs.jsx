import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
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
  UploadCloud,
  Link2,
  Image as ImageIcon,
  Loader2,
  Check,
  ExternalLink,
} from 'lucide-react';
import { blogApi } from '../../Service';
import { usePermissions } from '../../utils/usePermissions';

export default function Blogs() {
  const { user } = useSelector((state) => state.auth);
  const { hasPermission, can, isSuperAdmin, role } = usePermissions();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);

  // Cloudinary image upload & URL options state
  const [imageTab, setImageTab] = useState('upload'); // 'upload' | 'url'
  const [uploadingImage, setUploadingImage] = useState(false);
  const [optimizingUrl, setOptimizingUrl] = useState(false);
  const fileInputRef = useRef(null);

  const userRole = (role || user?.role || '').toLowerCase();
  const canManage =
    isSuperAdmin ||
    hasPermission('manage_blogs') ||
    hasPermission('manage_blog') ||
    hasPermission('blogs') ||
    hasPermission('create_blog') ||
    can('manage', 'blogs') ||
    can('create', 'blogs');

  const initialForm = {
    title: '',
    category: 'Technology',
    readTime: '5 min read',
    coverImage: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80',
    coverImagePublicId: '',
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

  // Handle direct file upload to Cloudinary
  const handleFileUpload = async (file) => {
    if (!file) return;

    // Validate size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit. Please upload a smaller image.');
      return;
    }

    try {
      setUploadingImage(true);
      const res = await blogApi.uploadCoverImage(file);
      if (res && res.url) {
        setForm((prev) => ({
          ...prev,
          coverImage: res.url,
          coverImagePublicId: res.public_id || '',
        }));
        toast.success('Cover image uploaded to Cloudinary CDN!');
      } else {
        throw new Error(res.message || 'Failed to upload image');
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      toast.error(err.message || 'Error uploading image to Cloudinary');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle optimizing/caching an external URL into Cloudinary
  const handleOptimizeUrlToCloudinary = async () => {
    if (!form.coverImage || !form.coverImage.trim()) {
      toast.error('Please enter a valid image URL first');
      return;
    }

    try {
      setOptimizingUrl(true);
      const res = await blogApi.uploadCoverImage(form.coverImage.trim(), true);
      if (res && res.url) {
        setForm((prev) => ({
          ...prev,
          coverImage: res.url,
          coverImagePublicId: res.public_id || '',
        }));
        toast.success('External image cached & optimized on Cloudinary CDN!');
      } else {
        throw new Error(res.message || 'Could not cache image to Cloudinary');
      }
    } catch (err) {
      console.error('Optimize URL failed:', err);
      toast.error(err.message || 'Error caching image to Cloudinary');
    } finally {
      setOptimizingUrl(false);
    }
  };

  const handleSaveBlog = async (e) => {
    e.preventDefault();
    try {
      if (editingBlog) {
        await blogApi.updateBlog(editingBlog._id, form);
        toast.success('Blog publication updated successfully!');
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
        toast.success('New article published and synced live to official portal!');
      }
      setIsModalOpen(false);
      setEditingBlog(null);
      setForm(initialForm);
      fetchBlogs();
    } catch (err) {
      toast.error(err.message || 'Error saving blog publication');
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Delete blog post '${title}'?`)) {
      try {
        await blogApi.deleteBlog(id);
        toast.success('Blog post moved to Recycle Bin');
        fetchBlogs();
      } catch (err) {
        toast.error(err.message || 'Error deleting blog');
      }
    }
  };

  const openEditModal = (b) => {
    setEditingBlog(b);
    setForm({
      ...b,
      coverImagePublicId: b.coverImagePublicId || '',
      tags: Array.isArray(b.tags) ? b.tags.join(', ') : b.tags,
    });
    // Auto select URL or Upload tab based on whether it is Cloudinary
    setImageTab(b.coverImage?.includes('cloudinary.com') ? 'upload' : 'url');
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

              {/* Professional Cloudinary Image Selector (Upload File or Paste URL) */}
              <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/70 pb-2.5">
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-slate-800">
                      Publication Cover Image
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Upload directly to Cloudinary or paste an external image link
                    </p>
                  </div>

                  {/* Mode Selector Tabs */}
                  <div className="flex items-center gap-1 rounded-xl bg-slate-200/80 p-1 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setImageTab('upload')}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition cursor-pointer ${
                        imageTab === 'upload'
                          ? 'bg-white text-blue-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <UploadCloud size={13} />
                      <span>Upload File</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageTab('url')}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition cursor-pointer ${
                        imageTab === 'url'
                          ? 'bg-white text-blue-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Link2 size={13} />
                      <span>Paste URL</span>
                    </button>
                  </div>
                </div>

                {/* TAB 1: DIRECT FILE UPLOAD TO CLOUDINARY */}
                {imageTab === 'upload' && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                    />

                    <div
                      onClick={() => !uploadingImage && fileInputRef.current?.click()}
                      className={`group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition cursor-pointer ${
                        uploadingImage
                          ? 'border-blue-400 bg-blue-50/50 cursor-wait'
                          : 'border-slate-300 bg-white hover:border-blue-500 hover:bg-blue-50/30'
                      }`}
                    >
                      {uploadingImage ? (
                        <div className="flex flex-col items-center py-2">
                          <Loader2 size={28} className="animate-spin text-blue-600 mb-2" />
                          <span className="text-xs font-bold text-blue-700 font-mono">
                            Uploading to Cloudinary CDN...
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5">
                            Optimizing format and global delivery routes
                          </span>
                        </div>
                      ) : (
                        <>
                          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 group-hover:scale-110 transition">
                            <UploadCloud size={20} />
                          </div>
                          <span className="text-xs font-bold text-slate-800">
                            Click or drag image file here to upload
                          </span>
                          <span className="mt-1 text-[11px] text-slate-400 font-mono">
                            JPEG, PNG, WEBP, GIF, SVG (Max: 10MB)
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 2: PASTE URL */}
                {imageTab === 'url' && (
                  <div className="space-y-2">
                    <div className="relative">
                      <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                      <input
                        type="url"
                        value={form.coverImage}
                        onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                        placeholder="https://images.unsplash.com/... or https://..."
                        className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-24 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                      />
                      {form.coverImage && !form.coverImage.includes('cloudinary.com') && (
                        <button
                          type="button"
                          disabled={optimizingUrl}
                          onClick={handleOptimizeUrlToCloudinary}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition cursor-pointer disabled:opacity-60"
                          title="Save this external image to Cloudinary CDN for permanent high-speed hosting"
                        >
                          {optimizingUrl ? (
                            <>
                              <Loader2 size={10} className="animate-spin" />
                              <span>Caching...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles size={10} />
                              <span>Cloudinary</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400">
                      💡 Tip: Click "Cloudinary" to cache and serve external images directly from high-speed Cloudinary CDN.
                    </p>
                  </div>
                )}

                {/* ACTIVE IMAGE PREVIEW CARD */}
                {form.coverImage && (
                  <div className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs">
                    <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-200">
                      <img
                        src={form.coverImage}
                        alt="Preview"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src =
                            'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {form.coverImage.includes('cloudinary.com') ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-mono font-bold uppercase text-emerald-700">
                            <Check size={10} /> Cloudinary CDN Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 border border-sky-200 px-2 py-0.5 text-[10px] font-mono font-bold uppercase text-sky-700">
                            <ExternalLink size={10} /> External Image Link
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-1 font-mono">
                        {form.coverImage}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <a
                        href={form.coverImage}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition"
                        title="View Full Resolution"
                      >
                        <Eye size={14} />
                      </a>
                      <button
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            coverImage:
                              'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80',
                            coverImagePublicId: '',
                          })
                        }
                        className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Reset to Default Image"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                )}
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
