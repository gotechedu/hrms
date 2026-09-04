import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  MessageSquare,
  Plus,
  Search,
  Filter,
  Pin,
  Heart,
  MessageCircle,
  Eye,
  CheckCircle2,
  Clock,
  Send,
  Loader2,
  Trash2,
  CheckSquare,
  Sparkles,
  Tag,
  AlertCircle,
  FolderKanban,
  X,
} from 'lucide-react';
import {
  fetchDiscussions,
  fetchDiscussionStats,
  createDiscussionAsync,
  updateDiscussionAsync,
  deleteDiscussionAsync,
  addReplyAsync,
  toggleLikeAsync,
  setSelectedCategory,
  setSelectedStatus,
  setSearchTerm,
  setActiveDiscussion,
  clearActiveDiscussion,
} from '../../redux/slices/discussionSlice';
import Modal from '../../Components/Common/Modal';

const CATEGORIES = [
  'All',
  'General',
  'Engineering & Tech',
  'Policy & HR',
  'Ideas & Feedback',
  'Announcements',
  'Project Collab',
];

const CATEGORY_COLORS = {
  General: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
  'Engineering & Tech': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Policy & HR': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'Ideas & Feedback': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  Announcements: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  'Project Collab': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
};

function formatTimeAgo(dateStr) {
  if (!dateStr) return 'Just now';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 30) {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  if (diffMin > 0) return `${diffMin}m ago`;
  return 'Just now';
}

export default function Discussions() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const {
    discussions,
    activeDiscussion,
    stats,
    loading,
    selectedCategory,
    selectedStatus,
    searchTerm,
  } = useSelector((state) => state.discussion);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    category: 'General',
    tags: '',
    isPinned: false,
    content: '',
  });

  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [submittingPost, setSubmittingPost] = useState(false);

  const role = (user?.role || '').toLowerCase();
  const isSuperadminOrHr =
    role === 'superadmin' ||
    role === 'admin' ||
    role === 'hr' ||
    user?.role === 'System Administrator' ||
    user?.role === 'HR Administrator';

  useEffect(() => {
    dispatch(fetchDiscussions({ category: selectedCategory, status: selectedStatus, search: searchTerm }));
    dispatch(fetchDiscussionStats());
  }, [dispatch, selectedCategory, selectedStatus, searchTerm]);

  // Handle create new discussion
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.content.trim()) return;

    setSubmittingPost(true);
    try {
      const tagsArray = newPost.tags
        ? newPost.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [];

      await dispatch(
        createDiscussionAsync({
          title: newPost.title,
          category: newPost.category,
          tags: tagsArray,
          isPinned: newPost.isPinned,
          content: newPost.content,
        })
      ).unwrap();

      setIsCreateModalOpen(false);
      setNewPost({
        title: '',
        category: 'General',
        tags: '',
        isPinned: false,
        content: '',
      });
    } catch (err) {
      console.error('Failed to create discussion:', err);
    } finally {
      setSubmittingPost(false);
    }
  };

  // Handle post reply
  const handlePostReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeDiscussion) return;

    setSubmittingReply(true);
    try {
      await dispatch(
        addReplyAsync({
          id: activeDiscussion._id,
          content: replyText,
        })
      ).unwrap();
      setReplyText('');
    } catch (err) {
      console.error('Failed to post reply:', err);
    } finally {
      setSubmittingReply(false);
    }
  };

  // Handle toggle resolution status
  const handleToggleStatus = (discussion) => {
    const newStatus = discussion.status === 'Resolved' ? 'Open' : 'Resolved';
    dispatch(
      updateDiscussionAsync({
        id: discussion._id,
        data: { status: newStatus },
      })
    );
  };

  // Handle delete
  const handleDeleteDiscussion = (id, e) => {
    e?.stopPropagation();
    if (window.confirm('Are you sure you want to move this discussion to the Recycle Bin?')) {
      dispatch(deleteDiscussionAsync(id));
      if (activeDiscussion?._id === id) {
        dispatch(clearActiveDiscussion());
      }
    }
  };

  // Handle like toggle
  const handleToggleLike = (id, e) => {
    e?.stopPropagation();
    dispatch(toggleLikeAsync(id));
  };

  const filteredDiscussions = discussions.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.tags || []).some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || d.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || d.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fadeIn p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700">
            <MessageSquare size={14} /> Team Discussions & Ideation Hub
          </span>
          <h1 className="mt-2 font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
            Corporate Discussions & Community Forum
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Collaborate, ask questions, share announcements, brainstorm tech solutions, and align on company policies
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-500/25 transition hover:shadow-xl hover:opacity-95 active:scale-95 cursor-pointer"
        >
          <Plus size={16} />
          <span>Start Discussion</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50/70 via-cyan-50/40 to-white p-5 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20 text-lg">
              💬
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 block">Total Topics</span>
              <h3 className="font-heading text-xl font-bold text-slate-900">{stats.total} Discussions</h3>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-white p-5 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20 text-lg">
              🟢
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 block">Active / Open</span>
              <h3 className="font-heading text-xl font-bold text-slate-900">{stats.open} Threads</h3>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-purple-100 bg-gradient-to-br from-purple-50/70 via-indigo-50/40 to-white p-5 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-md shadow-purple-500/20 text-lg">
              ✓
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 block">Resolved Topics</span>
              <h3 className="font-heading text-xl font-bold text-slate-900">{stats.resolved} Solved</h3>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-white p-5 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/20 text-lg">
              💡
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 block">Community Replies</span>
              <h3 className="font-heading text-xl font-bold text-slate-900">{stats.totalReplies} Contributions</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-3 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs">
        {/* Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => dispatch(setSelectedCategory(cat))}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Status Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="relative w-full sm:w-96">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search topics, questions, tags..."
              value={searchTerm}
              onChange={(e) => dispatch(setSearchTerm(e.target.value))}
              className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <Filter size={14} className="text-slate-400" />
            <select
              value={selectedStatus}
              onChange={(e) => dispatch(setSelectedStatus(e.target.value))}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-blue-600 focus:outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open Threads</option>
              <option value="Resolved">Resolved Topics</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Discussions Feed */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-slate-200" />
                <div className="space-y-1.5">
                  <div className="h-4 w-32 rounded bg-slate-200" />
                  <div className="h-3 w-20 rounded bg-slate-100" />
                </div>
              </div>
              <div className="h-5 w-3/4 rounded bg-slate-200 mb-2" />
              <div className="h-4 w-full rounded bg-slate-100 mb-4" />
              <div className="flex gap-2">
                <div className="h-6 w-16 rounded-full bg-slate-200" />
                <div className="h-6 w-16 rounded-full bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredDiscussions.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center">
          <MessageSquare size={44} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Discussion Threads Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm || selectedCategory !== 'All'
              ? 'No topics match your current filter criteria. Try adjusting keywords.'
              : 'Be the first to start a conversation with the team! Click "Start Discussion" above.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredDiscussions.map((disc) => {
            const catStyle = CATEGORY_COLORS[disc.category] || CATEGORY_COLORS.General;
            const isResolved = disc.status === 'Resolved';
            const likesCount = disc._likesCount !== undefined ? disc._likesCount : (disc.likes?.length || 0);
            const repliesCount = disc.replies?.length || 0;

            return (
              <div
                key={disc._id}
                onClick={() => dispatch(setActiveDiscussion(disc))}
                className={`group rounded-3xl border transition-all p-5 sm:p-6 bg-white shadow-2xs hover:shadow-md hover:border-blue-300 cursor-pointer ${
                  disc.isPinned ? 'border-amber-200 bg-amber-50/20' : 'border-slate-200/90'
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  {/* Author info & tags */}
                  <div className="flex items-start gap-3">
                    <img
                      src={
                        disc.authorAvatar ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(disc.authorName || 'User')}`
                      }
                      alt={disc.authorName}
                      className="h-10 w-10 rounded-2xl bg-slate-100 object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{disc.authorName}</span>
                        <span className="text-[11px] text-slate-400">• {disc.authorRole}</span>
                        <span className="text-[11px] text-slate-400">• {formatTimeAgo(disc.createdAt)}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        {disc.isPinned && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-[10px] font-bold">
                            <Pin size={10} className="fill-amber-700" /> Pinned
                          </span>
                        )}
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                        >
                          {disc.category}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            isResolved ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {disc.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions for Admin / Author */}
                  <div className="flex items-center gap-1 self-end sm:self-auto" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(disc)}
                      className={`p-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        isResolved
                          ? 'text-emerald-700 hover:bg-emerald-50'
                          : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                      }`}
                      title={isResolved ? 'Mark as Open' : 'Mark as Resolved'}
                    >
                      <CheckCircle2 size={16} className={isResolved ? 'fill-emerald-100 text-emerald-600' : ''} />
                    </button>

                    {(isSuperadminOrHr || disc.author === user?._id) && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteDiscussion(disc._id, e)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Move to Recycle Bin"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="mt-3">
                  <h3 className="font-heading text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition">
                    {disc.title}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {disc.content}
                  </p>
                </div>

                {/* Tags */}
                {disc.tags && disc.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {disc.tags.map((tag) => (
                      <span key={tag} className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-600">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer Metrics */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={(e) => handleToggleLike(disc._id, e)}
                      className="inline-flex items-center gap-1.5 hover:text-rose-600 transition cursor-pointer font-medium"
                    >
                      <Heart size={14} className={likesCount > 0 ? 'text-rose-500 fill-rose-500' : ''} />
                      <span>{likesCount} Likes</span>
                    </button>

                    <div className="inline-flex items-center gap-1.5 font-medium">
                      <MessageCircle size={14} />
                      <span>{repliesCount} Replies</span>
                    </div>

                    <div className="inline-flex items-center gap-1.5 font-medium">
                      <Eye size={14} />
                      <span>{disc.views || 0} Views</span>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold text-blue-600 group-hover:underline">
                    View Thread →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Discussion Details Modal / Thread Reader */}
      {activeDiscussion && (
        <Modal
          isOpen={Boolean(activeDiscussion)}
          onClose={() => dispatch(clearActiveDiscussion())}
          title={activeDiscussion.title}
          subtitle={`Started by ${activeDiscussion.authorName} (${activeDiscussion.authorRole}) • ${formatTimeAgo(activeDiscussion.createdAt)}`}
        >
          <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
            {/* Category & Status Pills */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 text-xs font-bold">
                  {activeDiscussion.category}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    activeDiscussion.status === 'Resolved'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {activeDiscussion.status}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleToggleStatus(activeDiscussion)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition cursor-pointer"
              >
                <CheckCircle2 size={14} />
                <span>{activeDiscussion.status === 'Resolved' ? 'Reopen Discussion' : 'Mark as Resolved'}</span>
              </button>
            </div>

            {/* Original Post Content */}
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={
                    activeDiscussion.authorAvatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(activeDiscussion.authorName || 'User')}`
                  }
                  alt={activeDiscussion.authorName}
                  className="h-9 w-9 rounded-full bg-white object-cover border border-slate-200"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{activeDiscussion.authorName}</h4>
                  <p className="text-[10px] text-slate-500">{activeDiscussion.authorRole}</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                {activeDiscussion.content}
              </p>

              {activeDiscussion.tags && activeDiscussion.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {activeDiscussion.tags.map((tag) => (
                    <span key={tag} className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-mono text-slate-600">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Replies Timeline */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <MessageCircle size={14} />
                <span>Replies & Discussion ({activeDiscussion.replies?.length || 0})</span>
              </h4>

              {(!activeDiscussion.replies || activeDiscussion.replies.length === 0) ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                  No replies yet. Be the first to share your input below!
                </div>
              ) : (
                <div className="space-y-3">
                  {activeDiscussion.replies.map((rep, idx) => (
                    <div key={rep._id || idx} className="rounded-2xl border border-slate-100 bg-white p-3.5 shadow-2xs">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={
                              rep.authorAvatar ||
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(rep.authorName || 'User')}`
                            }
                            alt={rep.authorName}
                            className="h-7 w-7 rounded-full bg-slate-100 object-cover border border-slate-200"
                          />
                          <div>
                            <span className="text-xs font-bold text-slate-900">{rep.authorName}</span>
                            <span className="text-[10px] text-slate-400 ml-1.5">• {rep.authorRole}</span>
                          </div>
                        </div>

                        <span className="text-[10px] text-slate-400">
                          {formatTimeAgo(rep.createdAt)}
                        </span>
                      </div>

                      <p className="mt-2 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap pl-9">
                        {rep.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reply Input Box */}
            <form onSubmit={handlePostReply} className="pt-3 border-t border-slate-100">
              <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                Post Your Response
              </label>
              <div className="relative">
                <textarea
                  rows={3}
                  required
                  placeholder="Type your insights, solution, or follow-up question here..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 p-3 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="mt-2.5 flex justify-end">
                <button
                  type="submit"
                  disabled={submittingReply || !replyText.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/25 hover:bg-blue-700 disabled:opacity-50 transition cursor-pointer"
                >
                  {submittingReply ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  <span>Post Reply</span>
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* Start Discussion Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Start New Discussion"
        subtitle="Open a discussion topic, ask for assistance, or share an announcement with colleagues"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
              Discussion Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Best practices for caching Redis layers in Next.js 16"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                Category Track *
              </label>
              <select
                value={newPost.category}
                onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none cursor-pointer"
              >
                {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                Tags (Comma-Separated)
              </label>
              <input
                type="text"
                placeholder="e.g. architecture, nextjs, backend"
                value={newPost.tags}
                onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
              Discussion Body & Details *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Describe your question, topic outline, or thoughts clearly..."
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          {isSuperadminOrHr && (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isPinned"
                checked={newPost.isPinned}
                onChange={(e) => setNewPost({ ...newPost, isPinned: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isPinned" className="text-xs font-semibold text-slate-700 cursor-pointer">
                Pin to top of forum feed (Priority Announcement)
              </label>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingPost}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/25 hover:bg-blue-700 disabled:opacity-50 transition cursor-pointer"
            >
              {submittingPost && <Loader2 size={14} className="animate-spin" />}
              <span>Publish Discussion</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
