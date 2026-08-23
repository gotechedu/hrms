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
  Menu,
  X,
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
  const [showDetailsPane, setShowDetailsPane] = useState(false);
  const [mobileScreen, setMobileScreen] = useState('list'); // 'list' | 'conversation'
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

  const handleSelectChat = (id) => {
    dispatch(setActiveChat(id));
    setMobileScreen('conversation');
  };

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
  const filteredDMs = directMessages.filter(
    (d) =>
      d.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      d.role.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="flex h-screen w-screen bg-slate-100 text-slate-800 overflow-hidden font-sans antialiased">
      {/* 1. LEFT NAVIGATION PANE (Channels & Direct Messages) */}
      <aside
        className={`flex flex-col w-full md:w-80 lg:w-88 shrink-0 bg-white border-r border-slate-200/90 shadow-xs z-20 transition-all ${
          mobileScreen === 'conversation' ? 'hidden md:flex' : 'flex'
        }`}
      >
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
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-mono font-bold text-slate-600">
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
                    onClick={() => handleSelectChat(channel.id)}
                    className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold transition cursor-pointer ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Hash size={15} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                      <span className="truncate">{channel.name}</span>
                    </div>

                    {channel.unread > 0 && (
                      <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold text-white shrink-0">
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
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-mono font-bold text-slate-600">
                {filteredDMs.length}
              </span>
            </div>

            <div className="space-y-0.5">
              {filteredDMs.map((dm) => {
                const isActive = activeChatId === dm.id;
                return (
                  <button
                    key={dm.id}
                    type="button"
                    onClick={() => handleSelectChat(dm.id)}
                    className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 transition cursor-pointer ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-bold'
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
              src={
                user?.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
              }
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
      <main
        className={`flex-1 flex flex-col min-w-0 bg-white ${
          mobileScreen === 'list' ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Chat Room Top Bar */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 px-4 sm:px-6 bg-white/95 backdrop-blur-xs shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile Back Button */}
            <button
              type="button"
              onClick={() => setMobileScreen('list')}
              className="flex md:hidden h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>

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

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-sm sm:text-base font-bold text-slate-900 truncate">
                  {currentChatName}
                </h2>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-500 font-bold hidden sm:inline">
                  {currentChatRole}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md">
                {isChannel ? activeChannel?.description : `${activeDM?.department} • ${activeDM?.lastSeen}`}
              </p>
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => alert(`Starting audio call with ${currentChatName}...`)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              title="Start Audio Call"
            >
              <Phone size={15} />
            </button>
            <button
              type="button"
              onClick={() => alert(`Starting HD video meeting with ${currentChatName}...`)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              title="Start Video Call"
            >
              <Video size={15} />
            </button>
            <button
              type="button"
              onClick={() => setShowDetailsPane(!showDetailsPane)}
              className={`flex h-9 w-9 items-center justify-center rounded-xl border transition cursor-pointer ${
                showDetailsPane
                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title="Toggle Info Pane"
            >
              <Info size={15} />
            </button>
          </div>
        </header>

        {/* Message Feed Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
          {/* Welcome Encrypted Banner */}
          <div className="mx-auto max-w-sm rounded-2xl border border-slate-200/80 bg-white p-3.5 text-center shadow-2xs">
            <ShieldCheck size={18} className="mx-auto text-emerald-500 mb-1" />
            <p className="text-xs font-bold text-slate-800">End-to-End Enterprise Encryption</p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Messages within {currentChatName} are retained and protected under GoTechEdu security guidelines.
            </p>
          </div>

          {currentMessages.map((msg) => {
            const isMe = msg.senderName === user?.name || msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-xl ${isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {!isMe && (
                  <img
                    src={
                      msg.senderAvatar ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(msg.senderName || 'Staff')}`
                    }
                    alt={msg.senderName}
                    className="h-8 w-8 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                  />
                )}

                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {!isMe && (
                    <span className="text-[11px] font-semibold text-slate-500 mb-1 ml-1">
                      {msg.senderName}
                    </span>
                  )}

                  <div
                    className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-2xs leading-relaxed ${
                      isMe
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-tr-xs'
                        : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>

                  <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                    <span>{msg.timestamp || 'Just now'}</span>
                    {isMe && <CheckCheck size={12} className="text-blue-500" />}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Rich Input Editor Box */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-white shrink-0">
          <form onSubmit={handleSend} className="relative rounded-2xl border border-slate-200 bg-slate-50/80 p-2 focus-within:border-blue-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-600/10 transition">
            <textarea
              rows={2}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={`Message ${currentChatName}... (Enter to send)`}
              className="w-full resize-none bg-transparent px-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />

            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <div className="flex items-center gap-1 text-slate-400">
                <button
                  type="button"
                  onClick={() => alert('Attachments dialog opened')}
                  className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-600 transition"
                  title="Attach File"
                >
                  <Paperclip size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setInputMessage((prev) => `${prev} 👍`)}
                  className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-600 transition"
                  title="Emoji"
                >
                  <Smile size={15} />
                </button>
              </div>

              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 active:scale-95 disabled:opacity-40 transition cursor-pointer"
              >
                <span>Send</span>
                <Send size={13} />
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* 3. RIGHT DETAILS DRAWER PANE */}
      {showDetailsPane && (
        <aside className="hidden lg:flex flex-col w-72 shrink-0 bg-white border-l border-slate-200/90 p-5 overflow-y-auto animate-fadeIn">
          <div className="text-center pb-5 border-b border-slate-100">
            {isChannel ? (
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-3">
                <Hash size={32} />
              </div>
            ) : (
              <img
                src={currentChatAvatar}
                alt={currentChatName}
                className="mx-auto h-16 w-16 rounded-2xl object-cover border-2 border-blue-500 shadow-md mb-3"
              />
            )}
            <h3 className="font-heading text-base font-bold text-slate-900">{currentChatName}</h3>
            <p className="text-xs text-blue-600 font-semibold">{currentChatRole}</p>
          </div>

          <div className="mt-5 space-y-4 text-xs">
            <div>
              <span className="font-mono text-[10px] font-bold uppercase text-slate-400">About</span>
              <p className="mt-1 text-slate-600 leading-relaxed">
                {isChannel
                  ? activeChannel?.description
                  : `${activeDM?.name} is part of the ${activeDM?.department} division at GoTechEdu.`}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
              <span className="font-mono text-[10px] font-bold uppercase text-slate-400">Shared Files</span>
              <p className="mt-1 font-semibold text-slate-700 flex items-center gap-1">
                <FileText size={13} className="text-blue-500" /> sprint_q3_report.pdf
              </p>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
