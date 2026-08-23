import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Newspaper,
  Plus,
  Calendar,
  Clock,
  Tag,
  User,
  Sparkles,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { addPost, deletePost, setSelectedCategory } from '../../redux/slices/blogSlice';
import Modal from '../../Components/Common/Modal';

const categories = ['All', 'Company Update', 'HR & People Ops', 'Engineering & Tech'];

export default function Blogs() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { posts, selectedCategory } = useSelector((state) => state.blogs);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const [form, setForm] = useState({
    title: '',
    category: 'Company Update',
    author: 'Vikramaditya Sharma',
    authorRole: 'HR Administrator',
    summary: '',
    content: '',
    tagsInput: 'Announcement, Policy',
  });

  const filteredPosts = posts.filter((p) => {
    if (selectedCategory === 'All') return true;
    return p.category === selectedCategory;
  });

  const handlePublish = (e) => {
    e.preventDefault();
    const tags = form.tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
    dispatch(
      addPost({
        title: form.title,
        category: form.category,
        author: user?.name || form.author,
        authorRole: user?.role || form.authorRole,
        summary: form.summary,
        content: form.content,
        tags,
      })
    );
    setIsModalOpen(false);
    setForm({
      title: '',
      category: 'Company Update',
      author: 'Vikramaditya Sharma',
      authorRole: 'HR Administrator',
      summary: '',
      content: '',
      tagsInput: 'Announcement, Policy',
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700">
            <Newspaper size={13} /> Corporate Communications
          </span>
          <h1 className="mt-2 font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
            Company Bulletins & Tech Blogs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Internal corporate announcements, HR benefits handbooks, and engineering architecture briefings
          </p>
        </div>

        {user?.role === 'HR Administrator' && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/25 transition hover:opacity-95 active:scale-95"
          >
            <Plus size={16} />
            <span>Publish Announcement</span>
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => dispatch(setSelectedCategory(cat))}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Blog Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className="group rounded-3xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs transition-all hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg flex flex-col justify-between"
          >
            <div>
              {/* Cover Image */}
              <div className="h-44 w-full overflow-hidden relative bg-slate-100">
                <img
                  src={post.cover}
                  alt={post.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute top-3 left-3 rounded-full bg-slate-900/80 backdrop-blur-md px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
                  {post.category}
                </span>
              </div>

              {/* Body */}
              <div className="p-5">
                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mb-2">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} /> {post.date}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {post.readTime}
                  </span>
                </div>

                <h3 className="font-heading text-base font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition">
                  {post.title}
                </h3>

                <p className="mt-2 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {post.summary}
                </p>

                {/* Tags */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {post.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-600"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Author Footer */}
            <div className="border-t border-slate-100 p-4 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={post.authorAvatar}
                  alt={post.author}
                  className="h-7 w-7 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900 truncate max-w-[120px]">{post.author}</p>
                  <p className="text-[9px] text-slate-400 truncate">{post.authorRole}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPost(post)}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                <span>Read Full</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Publish Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Publish Internal Bulletin"
        subtitle="Broadcast company newsletters, policy changes, and engineering blogs"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handlePublish} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
              Article Headline *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Q3 Health Insurance Renewal & Outpatient Benefits"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                Category *
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                <option value="Company Update">Company Update</option>
                <option value="HR & People Ops">HR & People Ops</option>
                <option value="Engineering & Tech">Engineering & Tech</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={form.tagsInput}
                onChange={(e) => setForm({ ...form, tagsInput: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
              Brief Summary *
            </label>
            <input
              type="text"
              required
              placeholder="1-2 sentences summarizing key takeaway"
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
              Full Content *
            </label>
            <textarea
              rows={5}
              required
              placeholder="Write the full announcement or tech article..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/25 hover:bg-blue-700"
            >
              Publish to Organization
            </button>
          </div>
        </form>
      </Modal>

      {/* Read Full Post Modal */}
      {selectedPost && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedPost(null)}
          title={selectedPost.title}
          subtitle={`Published by ${selectedPost.author} on ${selectedPost.date}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4">
            <img
              src={selectedPost.cover}
              alt={selectedPost.title}
              className="h-56 w-full object-cover rounded-2xl border border-slate-200"
            />

            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="rounded-full bg-blue-50 px-3 py-1 font-bold text-blue-700">
                {selectedPost.category}
              </span>
              <span>•</span>
              <span>{selectedPost.readTime}</span>
            </div>

            <p className="text-sm font-semibold text-slate-900 leading-relaxed">
              {selectedPost.summary}
            </p>

            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3 pt-2 border-t border-slate-100">
              <p>{selectedPost.content}</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
