import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Hash,
  Search,
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Video,
  Info,
  ArrowLeft,
  LayoutDashboard,
  Users,
  CheckCheck,
  Circle,
  FileText,
  Image,
  Pin,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { setActiveChat, sendMessage, setSearchFilter } from '../../redux/slices/chatSlice';

export default function Chat() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { channels, directMessages, messages, activeChatId, searchFilter } = useSelector(
    (state) => state.chat
  );

  const [inputMessage, setInputMessage] = useState('');
  const [showDetailsPane, setShowDetailsPane] = useState(true);
  const messagesEndRef = useRef(null);

  // Active chat metadata
  const activeChannel = channels.find((c) => c.id === activeChatId);
  const activeDM = directMessages.find((d) => d.id === activeChatId);
  const isChannel = Boolean(activeChannel);
  const currentChatName = isChannel ? `#${activeChannel.name}` : activeDM?.name;
  const currentChatRole = isChannel ? 'Channel' : activeDM?.role;
  const currentChatAvatar = isChannel ? null : activeDM?.avatar;

  const currentMessages = messages[activeChatId] || [];

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, activeChatId]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputMessage.trim()) return;

    dispatch(
      sendMessage({
        chatId: activeChatId,
        text: inputMessage.trim(),
        senderName: user?.name,
        senderAvatar: user?.avatar,
      })
    );
    setInputMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Filter channels & DMs
  const filteredChannels = channels.filter((c) =>
    c.name.toLowerCase().includes(searchFilter.toLowerCase())
  );
  const filteredDMs = directMessages.filter((d) =>
    d.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    d.role.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="flex h-screen w-screen bg-slate-100 text-slate-800 overflow-hidden font-sans antialiased">
      {/* 1. LEFT NAVIGATION PANE (Channels & Direct Messages) */}
      <aside className="flex flex-col w-72 sm:w-80 md:w-88 shrink-0 bg-white border-r border-slate-200/90 shadow-xs z-20">
        {/* Workspace Brand & Back to Dashboard Section */}
        <div className="flex flex-col border-b border-slate-200/80 bg-slate-50/70 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/20 font-heading font-black text-sm">
                GT
              </div>
              <div>
                <h1 className="font-heading text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                  GoTech<span className="text-blue-600">Edu</span> Connect
                </h1>
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-600 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Workspace Live
                </span>
              </div>
            </div>
          </div>

          {/* DEDICATED BUTTON TO MOVE TO DASHBOARD */}
          <Link
            to="/"
            className="mt-3.5 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/20 hover:opacity-95 active:scale-98 transition"
          >
            <LayoutDashboard size={15} />
            <span>Return to HRMS Dashboard</span>
          </Link>
        </div>

        {/* Search Filter Box */}
        <div className="p-3 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Jump to channel or colleague..."
              value={searchFilter}
              onChange={(e) => dispatch(setSearchFilter(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8.5 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition"
            />
          </div>
        </div>

        {/* Channel and DM List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5">
          {/* Channels Section */}
          <div>
            <div className="flex items-center justify-between px-2 mb-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Squad Channels
              </span>
              <span className="text-[10px] font-mono font-semibold text-slate-400">
                {filteredChannels.length}
              </span>
            </div>

            <div className="space-y-0.5">
              {filteredChannels.map((channel) => {
                const isActive = activeChatId === channel.id;
                return (
                  <button
                    key={channel.id}
                    type="button"
                    onClick={() => dispatch(setActiveChat(channel.id))}
                    className={`w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold transition ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-bold shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Hash
                        size={15}
                        className={isActive ? 'text-blue-600' : 'text-slate-400'}
                      />
                      <span className="truncate">{channel.name}</span>
                    </div>
                    {channel.unread > 0 && (
                      <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                        {channel.unread}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Direct Messages Section */}
          <div>
            <div className="flex items-center justify-between px-2 mb-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Direct Teammates
              </span>
              <span className="text-[10px] font-mono font-semibold text-slate-400">
                {filteredDMs.length}
              </span>
            </div>

            <div className="space-y-1">
              {filteredDMs.map((dm) => {
                const isActive = activeChatId === dm.id;
                return (
                  <button
                    key={dm.id}
                    type="button"
                    onClick={() => dispatch(setActiveChat(dm.id))}
                    className={`w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-xs transition ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-bold shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={dm.avatar}
                          alt={dm.name}
                          className="h-7 w-7 rounded-lg object-cover border border-slate-200"
                        />
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${
                            dm.online ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}
                        />
                      </div>
                      <div className="flex flex-col text-left truncate">
                        <span className="truncate text-xs font-semibold">{dm.name}</span>
                        <span className="truncate text-[10px] text-slate-400">{dm.role}</span>
                      </div>
                    </div>

                    {dm.unread > 0 && (
                      <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold text-white shrink-0">
                        {dm.unread}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Current User Bar */}
        <div className="border-t border-slate-100 p-3 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={user?.name}
              className="h-8 w-8 rounded-full border border-slate-200 object-cover"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-slate-900 truncate">{user?.name}</span>
              <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Online
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. CENTER CHAT CONVERSATION WORKSPACE */}
      <main className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Chat Room Top Bar */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 px-6 bg-white/95 backdrop-blur-xs shrink-0">
          <div className="flex items-center gap-3">
            {isChannel ? (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Hash size={20} />
              </div>
            ) : (
              <div className="relative">
                <img
                  src={currentChatAvatar}
                  alt={currentChatName}
                  className="h-10 w-10 rounded-xl object-cover border border-slate-200"
                />
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
                    activeDM?.online ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-base font-bold text-slate-900">
                  {currentChatName}
                </h2>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-500 font-bold">
                  {currentChatRole}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-md">
                {isChannel ? activeChannel?.description : activeDM?.department + ' • ' + activeDM?.lastSeen}
              </p>
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => alert(`Starting encrypted audio call with ${currentChatName}...`)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
              title="Start Audio Call"
            >
              <Phone size={16} />
            </button>
            <button
              type="button"
              onClick={() => alert(`Starting HD Video Meeting with ${currentChatName}...`)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
              title="Start Video Meeting"
            >
              <Video size={16} />
            </button>
            <button
              type="button"
              onClick={() => setShowDetailsPane(!showDetailsPane)}
              className={`flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 transition ${
                showDetailsPane ? 'bg-blue-50 text-blue-600 border-blue-200' : 'text-slate-600 hover:bg-slate-50'
              }`}
              title="Toggle Info Pane"
            >
              <Info size={16} />
            </button>
          </div>
        </header>

        {/* Message Thread Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/50">
          {/* Welcome Message Banner */}
          <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50/40 p-4 text-center">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white mb-2 shadow-xs">
              <Sparkles size={18} />
            </div>
            <h3 className="font-heading text-sm font-bold text-slate-900">
              Welcome to {currentChatName}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 max-w-sm mx-auto">
              This conversation is protected by 256-bit enterprise audit compliance.
            </p>
          </div>

          {/* Messages */}
          {currentMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.isMe ? 'flex-row-reverse' : ''}`}
            >
              <img
                src={msg.avatar}
                alt={msg.sender}
                className="h-8 w-8 rounded-xl object-cover border border-slate-200 shrink-0 mt-0.5"
              />

              <div className={`flex flex-col max-w-lg ${msg.isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1 text-[11px]">
                  <span className="font-bold text-slate-900">{msg.sender}</span>
                  <span className="font-mono text-slate-400">{msg.time}</span>
                </div>

                <div
                  className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                    msg.isMe
                      ? 'bg-blue-600 text-white rounded-tr-xs'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Rich Chat Input Box */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-2 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 transition"
          >
            <button
              type="button"
              onClick={() => alert('File upload dialog opened.')}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              title="Attach File"
            >
              <Paperclip size={18} />
            </button>

            <input
              type="text"
              placeholder={`Message ${currentChatName}...`}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1 bg-transparent px-2 py-1.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />

            <button
              type="button"
              onClick={() => setInputMessage((prev) => prev + ' 🚀')}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              title="Add Emoji"
            >
              <Smile size={18} />
            </button>

            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${
                inputMessage.trim()
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 hover:bg-blue-700'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </main>

      {/* 3. RIGHT DETAILS & RESOURCES PANE (Collapsible) */}
      {showDetailsPane && (
        <aside className="hidden lg:flex flex-col w-72 shrink-0 bg-white border-l border-slate-200 p-5 space-y-6 overflow-y-auto">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Conversation Dossier
            </span>
            <h3 className="font-heading text-base font-bold text-slate-900 mt-1">
              {currentChatName}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isChannel ? 'Company Squad Channel' : 'Direct 1:1 Encrypted Message'}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => alert('Search in conversation activated')}
              className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-center font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              🔍 Search
            </button>
            <button
              type="button"
              onClick={() => alert('Notifications muted for 8 hours')}
              className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-center font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              🔕 Mute
            </button>
          </div>

          {/* Pinned Resources */}
          <div className="space-y-2.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Shared Documents & Assets
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                <FileText size={16} className="text-blue-600 shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 truncate">Q2_Sprint_Architecture.pdf</p>
                  <p className="text-[10px] text-slate-400">1.8 MB • Priya S.</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                <Image size={16} className="text-emerald-600 shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 truncate">System_Topology_Diagram.png</p>
                  <p className="text-[10px] text-slate-400">3.4 MB • Ananya V.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Navigation to Dashboard */}
          <div className="mt-auto pt-4 border-t border-slate-100 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
            >
              ← Back to HRMS Main Dashboard
            </Link>
          </div>
        </aside>
      )}
    </div>
  );
}
