import { useState, useEffect, useRef } from "react";

const SUGGESTIONS = [
  { icon: "⚡", label: "Explain recursion", sub: "with a simple example" },
  { icon: "🔍", label: "What is Big O notation?", sub: "and how to use it" },
  { icon: "🛠️", label: "Debug my Python loop", sub: "step by step" },
  { icon: "📦", label: "How does async/await work?", sub: "in JavaScript" },
];

function formatChatTime(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOfDay(new Date()) - startOfDay(date)) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return date.toLocaleDateString(undefined, { weekday: "short" });
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function toList(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    return value
      .split(/\n+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function ExplanationSection({ title, items }) {
  if (items.length === 0) return null;
  return (
    <div className="rounded-xl border border-white/5 bg-white/5 p-4">
      <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-lavender-300">{title}</h3>
      {items.length > 1 ? (
        <ul className="list-disc space-y-1 pl-4 text-sm leading-relaxed text-gray-200">
          {items.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm leading-relaxed text-gray-200">{items[0]}</p>
      )}
    </div>
  );
}

function ExplanationSections({ explanation }) {
  if (!explanation) return null;
  return (
    <div className="flex flex-col gap-3">
      <ExplanationSection title="Summary" items={toList(explanation.summary)} />
      <ExplanationSection title="Breakdown" items={toList(explanation.breakdown)} />
      <ExplanationSection title="Key Points" items={toList(explanation.key_points)} />
      <ExplanationSection title="Limitations" items={toList(explanation.limitations)} />
    </div>
  );
}

export default function ExplainThis({
  messages,
  loading,
  error,
  input,
  onInputChange,
  onSubmit,
  onNewChat,
  savedInput,
  onDelete,
  onSelectChat,
  activeChatId,
  dailyCapReached,
  lockTimer,
}) {
  const [showWelcome, setShowWelcome] = useState(() => {
    try {
      return !sessionStorage.getItem("hasSeenWelcome");
    } catch {
      return true;
    }
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const textareaRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!showWelcome) return;
    const timer = setTimeout(() => {
      setShowWelcome(false);
      try {
        sessionStorage.setItem("hasSeenWelcome", "1");
      } catch {
        // ignore storage errors (e.g. private browsing)
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }

  function handleSend(text) {
    const value = text ?? input;
    if (!value.trim() || dailyCapReached) return;
    onSubmit(text);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const hasMessages = messages.length > 0;

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-[#0e0c14] font-[Inter,sans-serif]">
      {/* Welcome Overlay */}
      {showWelcome && (
        <div className="pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center">
          <div className="absolute inset-0 bg-[#0e0c14]/80 backdrop-blur-sm" />
          <div className="animate-welcome relative flex flex-col items-center gap-4 px-6 text-center">
            <div
              className="absolute -inset-16 rounded-full"
              style={{
                background: "radial-gradient(ellipse, rgba(139,92,246,0.18) 0%, transparent 70%)",
                animation: "pulse-ring 3s ease-in-out infinite",
              }}
            />
            <span className="font-[Outfit,sans-serif] text-4xl font-light tracking-widest text-lavender-300 sm:text-5xl md:text-6xl shimmer-text">
              Welcome to
            </span>
            <span className="font-[Outfit,sans-serif] text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl">
              ExplainThis<span className="text-lavender-400">.Dev</span>
            </span>
            <p className="mt-2 font-[Inter,sans-serif] text-base font-light tracking-wide text-gray-400 sm:text-lg">
              Your AI guide to understanding code
            </p>
          </div>
        </div>
      )}

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-lavender-300/10
          bg-[#13111c] transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 md:flex
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-4 py-5">
          <span className="font-[Outfit,sans-serif] text-lg font-semibold tracking-tight text-white">
            Explain<span className="text-lavender-400">This</span>
          </span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-gray-500 transition hover:bg-white/5 hover:text-gray-300 md:hidden"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* New Chat button */}
        <div className="px-3 pb-3">
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) setSidebarOpen(false);
            }}
            className="flex w-full items-center gap-3 rounded-xl border border-lavender-400/25 bg-lavender-500/10 px-4 py-3 text-sm font-medium text-lavender-300 transition-all duration-200 hover:border-lavender-400/50 hover:bg-lavender-500/20 hover:text-lavender-200 active:scale-[0.98]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </button>
        </div>

        {/* Divider */}
        <div className="mx-4 border-t border-white/5" />

        {/* Previous chats */}
        <div className="flex flex-1 flex-col overflow-hidden px-3 py-3">
          <p className="mb-2 px-2 text-xs font-medium uppercase tracking-widest text-gray-600">Recent</p>
          <div className="flex-1 space-y-0.5 overflow-y-auto">
            {savedInput.length === 0 ? (
              <p className="px-2 text-xs text-gray-600">No saved chats</p>
            ) : (
              savedInput.map((chat) => (
                <div
                  key={chat.id}
                  className={`
                    group flex w-full items-center gap-1 rounded-lg transition-all duration-150
                    ${activeChatId === chat.id ? "bg-lavender-500/15 text-lavender-200" : "text-gray-400 hover:bg-white/5 hover:text-gray-200"}
                  `}
                >
                  <button
                    onClick={() => {
                      onSelectChat(chat);
                      if (window.innerWidth < 768) setSidebarOpen(false);
                    }}
                    className="flex min-w-0 flex-1 flex-col rounded-lg px-3 py-2.5 text-left"
                  >
                    <span className="truncate text-sm leading-snug">{chat.text}</span>
                    <span className="mt-0.5 text-xs text-gray-600">{formatChatTime(chat.createdAt)}</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(chat.id);
                    }}
                    aria-label="Delete chat"
                    className="mr-2 shrink-0 rounded p-1 text-gray-600 opacity-0 transition hover:text-gray-300 group-hover:opacity-100"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar footer */}
        <div className="border-t border-white/5 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-lavender-500/20 text-xs font-semibold text-lavender-300">
              U
            </div>
            <span className="text-sm text-gray-400">Your Account</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="relative flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-14 items-center justify-between border-b border-white/5 px-4 md:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-white/5 hover:text-gray-300 md:hidden"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="hidden font-[Outfit,sans-serif] text-sm font-medium text-gray-500 md:block">
            ExplainThis<span className="text-lavender-400">.Dev</span>
          </div>
          <div className="flex items-center gap-2 md:ml-auto">
            <span className="rounded-full border border-lavender-400/20 bg-lavender-500/10 px-3 py-1 text-xs font-medium text-lavender-300">
              AI Coding Guide
            </span>
          </div>
        </header>

        {/* Chat / Home area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {!hasMessages ? (
            /* Empty state */
            <div className="flex flex-1 flex-col items-center justify-center gap-8 overflow-y-auto px-4 py-12 sm:px-8">
              {/* Ambient glow */}
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-72 opacity-30"
                style={{
                  background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(139,92,246,0.35), transparent)",
                }}
              />

              <div className="animate-fade-in-up relative text-center" style={{ animationDelay: "0.1s", opacity: 0 }}>
                <h1 className="font-[Outfit,sans-serif] text-3xl font-semibold text-white sm:text-4xl md:text-5xl">
                  What can I explain
                  <span className="shimmer-text"> for you?</span>
                </h1>
                <p className="mt-3 text-sm text-gray-500 sm:text-base">
                  Ask me anything about code — I'll break it down clearly.
                </p>
              </div>

              {/* Suggestion chips */}
              <div
                className="animate-fade-in-up grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2"
                style={{ animationDelay: "0.25s", opacity: 0 }}
              >
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(s.label)}
                    disabled={dailyCapReached}
                    className="glass group flex items-start gap-3 rounded-2xl p-4 text-left transition-all duration-200 hover:border-lavender-400/30 hover:bg-white/10 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span className="mt-0.5 text-xl">{s.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-200 group-hover:text-white">{s.label}</p>
                      <p className="mt-0.5 text-xs text-gray-500">{s.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Messages */
            <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
              <div className="mx-auto flex max-w-2xl flex-col gap-6">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    {msg.role === "assistant" && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lavender-500/20 text-sm">
                        ✦
                      </div>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "max-w-[80%] border border-lavender-400/20 bg-lavender-500/15 text-gray-100"
                          : "max-w-full text-gray-300"
                      }`}
                    >
                      {msg.role === "user" ? msg.text : <ExplanationSections explanation={msg.explanation} />}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lavender-500/20 text-sm">
                      ✦
                    </div>
                    <div className="flex items-center gap-1.5 rounded-2xl px-4 py-4">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="h-2 w-2 rounded-full bg-lavender-400/60"
                          style={{ animation: `pulse-ring 1.2s ease-in-out ${i * 0.2}s infinite` }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            </div>
          )}

          {/* Input bar */}
          <div className="border-t border-white/5 bg-[#0e0c14] px-4 py-4 sm:px-6">
            <div className="mx-auto max-w-2xl">
              {error && (
                <p className="mb-2 rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 text-center text-xs text-red-300">
                  {error}
                </p>
              )}
              <div className="input-glow glass flex items-end gap-3 rounded-2xl px-4 py-3 transition-all duration-200">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={input}
                  onChange={(e) => {
                    onInputChange(e.target.value);
                    autoResize();
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me to explain any coding concept..."
                  disabled={dailyCapReached}
                  className="flex-1 resize-none bg-transparent text-sm text-gray-200 placeholder-gray-600 outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ fontFamily: "Inter, sans-serif", lineHeight: "1.5", minHeight: "24px" }}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || dailyCapReached}
                  className={`mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
                    input.trim() && !dailyCapReached
                      ? "bg-lavender-500 text-white hover:bg-lavender-400 active:scale-90"
                      : "bg-white/5 text-gray-600"
                  }`}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              {dailyCapReached && lockTimer > 0 ? (
                <p className="mt-2 text-center text-xs text-gray-600">
                  Please wait {lockTimer} second{lockTimer > 1 ? "s" : ""} before submitting.
                </p>
              ) : (
                <p className="mt-2 text-center text-xs text-gray-700">
                  ExplainThis.Dev · AI can make mistakes — verify important code
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
