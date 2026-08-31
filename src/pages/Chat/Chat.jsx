import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  Search,
  Send,
  Paperclip,
  Smile,
  Phone,
  Video,
  Info,
  ArrowLeft,
  LayoutDashboard,
  Users,
  CheckCheck,
  Circle,
  Mail,
  Building2,
  ShieldCheck,
  UserCheck,
  Sparkles,
  Loader2,
  X,
} from 'lucide-react';
import { setActiveChat, sendMessage, setSearchFilter, fetchChatEmployees } from '../../redux/slices/chatSlice';

export default function Chat() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { directMessages, messages, activeChatId, searchFilter, loadingEmployees } = useSelector(
    (state) => state.chat
  );

  const [inputMessage, setInputMessage] = useState('');
  const [showDetailsPane, setShowDetailsPane] = useState(false);
  const [mobileScreen, setMobileScreen] = useState('list'); // 'list' | 'conversation'
  const messagesEndRef = useRef(null);

  // Load real system employees on mount
  useEffect(() => {
    dispatch(fetchChatEmployees());
  }, [dispatch]);

  // Active chat metadata
  const activeDM = directMessages.find((d) => d.id === activeChatId) || directMessages[0];
  const currentChatName = activeDM?.name || 'Select Teammate';
  const currentChatRole = activeDM?.role || 'Staff Member';
  const currentChatAvatar = activeDM?.avatar;

  const currentMessages = activeChatId ? messages[activeChatId] || [] : [];

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, activeChatId]);

  const handleSelectChat = (id) => {
    dispatch(setActiveChat(id));
    setMobileScreen('conversation');
  };

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputMessage.trim() || !activeChatId) return;

    dispatch(
      sendMessage({
        chatId: activeChatId,
        text: inputMessage.trim(),
        senderName: user?.name || user?.firstName || 'System User',
        senderAvatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
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

  // Filter real system employees
  const filteredDMs = directMessages.filter(
    (d) =>
      d.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      d.role.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (d.department && d.department.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  return (
    <div className="flex h-screen w-screen bg-slate-100/90 text-slate-800 overflow-hidden font-sans antialiased">
      {/* 1. LEFT SIDEBAR: REAL SYSTEM EMPLOYEES DIRECTORY */}
      <aside
        className={`flex flex-col w-full md:w-80 lg:w-88 shrink-0 bg-white border-r border-slate-200/90 shadow-2xs z-20 transition-all ${
          mobileScreen === 'conversation' ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Header & Dashboard Navigation */}
        <div className="flex flex-col border-b border-slate-200/80 bg-slate-50/70 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 font-heading font-black text-base">
                GT
              </div>
              <div>
                <h1 className="font-heading text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                  GoTech<span className="text-blue-600">HRMS</span> Workspace
                </h1>
                <span className="text-[10px] font-mono font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Direct Employee Chat
                </span>
              </div>
            </div>
          </div>

          <Link
            to="/"
            className="mt-3.5 flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-slate-800 active:scale-98 transition"
          >
            <LayoutDashboard size={15} />
            <span>Return to Dashboard</span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search employee, designation, dept..."
              value={searchFilter}
              onChange={(e) => dispatch(setSearchFilter(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-9 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition"
            />
          </div>
        </div>

        {/* System Employee Contacts List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="flex items-center justify-between px-2 py-1.5 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Users size={12} className="text-blue-600" /> Active System Employees
            </span>
            <span className="rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[9px] font-mono font-bold text-blue-700">
              {filteredDMs.length} Online DB
            </span>
          </div>

          {loadingEmployees ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Loader2 size={24} className="animate-spin text-blue-600 mb-2" />
              <p className="text-xs font-medium">Loading real DB employees...</p>
            </div>
          ) : filteredDMs.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">
              No employees found matching standard records.
            </div>
          ) : (
            filteredDMs.map((dm) => {
              const isActive = activeChatId === dm.id;
              return (
                <button
                  key={dm.id}
                  type="button"
                  onClick={() => handleSelectChat(dm.id)}
                  className={`flex w-full items-center justify-between rounded-2xl px-3 py-2.5 transition cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={dm.avatar}
                        alt={dm.name}
                        className={`h-9 w-9 rounded-xl object-cover border ${
                          isActive ? 'border-white/40' : 'border-slate-200'
                        }`}
                      />
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 ${
                          isActive ? 'border-blue-600' : 'border-white'
                        } ${dm.online ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      />
                    </div>
                    <div className="flex flex-col text-left truncate">
                      <span className={`truncate text-xs ${isActive ? 'text-white font-bold' : 'font-semibold text-slate-900'}`}>
                        {dm.name}
                      </span>
                      <span className={`truncate text-[10px] ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>
                        {dm.role}
                      </span>
                    </div>
                  </div>

                  {dm.department && (
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-md truncate max-w-[80px] ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500 border border-slate-200/60'
                      }`}
                    >
                      {dm.department}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Logged in User Bar */}
        <div className="border-t border-slate-200/80 bg-slate-50/90 p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              {user?.name ? user.name[0] : 'U'}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-bold text-slate-900 truncate">{user?.name || 'Logged User'}</span>
              <span className="text-[10px] text-slate-500 truncate">{user?.role || 'Administrator'}</span>
            </div>
          </div>
          <ShieldCheck size={16} className="text-blue-600 shrink-0" />
        </div>
      </aside>

      {/* 2. MAIN CHAT AREA */}
      <main
        className={`flex flex-col flex-1 bg-slate-50/60 min-w-0 relative ${
          mobileScreen === 'list' ? 'hidden md:flex' : 'flex'
        }`}
      >
        {activeDM ? (
          <>
            {/* Header */}
            <header className="flex items-center justify-between border-b border-slate-200/90 bg-white px-6 py-3.5 shadow-2xs">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setMobileScreen('list')}
                  className="md:hidden rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                >
                  <ArrowLeft size={18} />
                </button>

                <div className="relative shrink-0">
                  <img
                    src={currentChatAvatar}
                    alt={currentChatName}
                    className="h-10 w-10 rounded-xl object-cover border border-slate-200 shadow-2xs"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                </div>

                <div className="truncate">
                  <h2 className="font-heading text-sm font-bold text-slate-900 flex items-center gap-2 truncate">
                    {currentChatName}
                    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                      System DB Verified
                    </span>
                  </h2>
                  <p className="text-[11px] text-slate-500 truncate">
                    {currentChatRole} • <strong className="text-slate-700">{activeDM.department || 'HRMS'}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  title="Voice Call"
                  className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:border-blue-300 hover:text-blue-600 transition"
                >
                  <Phone size={16} />
                </button>
                <button
                  type="button"
                  title="Video Meeting"
                  className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:border-blue-300 hover:text-blue-600 transition"
                >
                  <Video size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowDetailsPane(!showDetailsPane)}
                  className={`rounded-xl border p-2 transition ${
                    showDetailsPane
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300'
                  }`}
                >
                  <Info size={16} />
                </button>
              </div>
            </header>

            {/* Chat Messages Timeline */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="text-center my-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-slate-200/90 px-3.5 py-1 text-[11px] font-mono font-medium text-slate-500 shadow-2xs">
                  <UserCheck size={12} className="text-blue-600" /> Direct Messaging Channel with {currentChatName}
                </span>
              </div>

              {currentMessages.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-50 text-blue-600 mb-3 border border-blue-100">
                    <MessageSquare size={24} />
                  </div>
                  <h3 className="font-heading text-sm font-bold text-slate-800">Start Conversation</h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                    Send a direct work message to {currentChatName} ({currentChatRole}).
                  </p>
                </div>
              ) : (
                currentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${msg.isMe ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <img
                      src={msg.isMe ? (user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80') : currentChatAvatar}
                      alt={msg.sender}
                      className="h-8 w-8 rounded-xl object-cover border border-slate-200 shrink-0 mt-1 shadow-2xs"
                    />

                    <div className={`flex flex-col max-w-md ${msg.isMe ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-800">{msg.sender}</span>
                        <span className="text-[10px] font-mono text-slate-400">{msg.time}</span>
                      </div>
                      <div
                        className={`rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-2xs ${
                          msg.isMe
                            ? 'bg-blue-600 text-white rounded-tr-none font-medium'
                            : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="border-t border-slate-200/90 bg-white p-4">
              <form onSubmit={handleSend} className="flex items-center gap-2.5">
                <button
                  type="button"
                  className="rounded-xl border border-slate-200 p-2.5 text-slate-400 hover:text-slate-600 transition"
                >
                  <Paperclip size={16} />
                </button>

                <input
                  type="text"
                  placeholder={`Message ${currentChatName}...`}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="flex-1 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none transition"
                />

                <button
                  type="button"
                  className="rounded-xl border border-slate-200 p-2.5 text-slate-400 hover:text-slate-600 transition hidden sm:block"
                >
                  <Smile size={16} />
                </button>

                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-blue-600 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-40 transition"
                >
                  <span>Send</span>
                  <Send size={13} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Users size={36} className="mb-3 text-slate-300" />
            <p className="text-xs font-medium">Select an employee from the left panel to open chat.</p>
          </div>
        )}
      </main>

      {/* 3. RIGHT DETAILS DRAWER */}
      {showDetailsPane && activeDM && (
        <aside className="w-80 shrink-0 bg-white border-l border-slate-200/90 p-6 flex flex-col justify-between hidden lg:flex animate-fadeIn">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-heading text-sm font-bold text-slate-900">Employee Profile</h3>
              <button
                type="button"
                onClick={() => setShowDetailsPane(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-6 text-center">
              <img
                src={currentChatAvatar}
                alt={currentChatName}
                className="h-20 w-20 rounded-3xl object-cover border-2 border-blue-500/20 mx-auto shadow-md"
              />
              <h4 className="mt-3 font-heading text-base font-bold text-slate-900">{currentChatName}</h4>
              <span className="inline-block mt-1 rounded-full bg-blue-50 border border-blue-200 px-3 py-0.5 text-[11px] font-bold text-blue-700">
                {currentChatRole}
              </span>
            </div>

            <div className="mt-6 space-y-3.5 text-xs">
              <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-100">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
                  Department
                </span>
                <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <Building2 size={13} className="text-blue-600" /> {activeDM.department || 'Engineering'}
                </span>
              </div>

              {activeDM.email && (
                <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-100">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
                    Email Address
                  </span>
                  <span className="font-semibold text-slate-900 truncate block flex items-center gap-1.5">
                    <Mail size={13} className="text-blue-600" /> {activeDM.email}
                  </span>
                </div>
              )}

              <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-100">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
                  System Database Record
                </span>
                <span className="font-mono text-emerald-600 font-bold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Verified Record ({activeDM.employeeId || activeDM._id})
                </span>
              </div>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
