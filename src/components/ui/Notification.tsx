import {
  Bell,
  X,
  CheckCheck,
  Check,
  BellRing,
  LoaderCircle,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface NotificationItem {
  id: number;
  title?: string;
  message: string;
  level: number;
  createdAt?: string;
  otn?: boolean;
}

const levelColors: Record<number, string> = {
  1: "border-gray-500 bg-gray-800",
  2: "border-yellow-500 bg-yellow-800/60",
  3: "border-red-500 bg-red-900/60",
};

const Notification: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [modalNotif, setModalNotif] = useState<NotificationItem | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/uvapi/notifs/unread");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
        }
      } catch {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const markRead = async (id: number) => {
    try {
      await fetch("/api/uvapi/notifs/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await fetch("/api/uvapi/notifs/mark-all-read");
      setNotifications((prev) => prev.filter((n) => n.level === 3));
    } catch {}
  };

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (modalNotif) setModalNotif(null);
        else setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open, modalNotif]);

  const unread = notifications.length > 0;

  return (
    <div className="relative inline-block z-50">
      {/* 🔔 Bell */}
      <button
        className="focus:outline-none group relative"
        onClick={() => setOpen((o) => !o)}
        aria-label="Show notifications"
        tabIndex={0}
      >
        {unread ? (
          <>
            <BellRing
              size={28}
              className="p-1 rounded-lg border text-gray-300 border-gray-700 group-hover:bg-gray-200 group-hover:text-gray-900 transition-colors shadow shadow-gray-700 bg-gray-600/60"
            />
            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
          </>
        ) : (
          <Bell
            size={28}
            className="p-1 rounded-lg border text-gray-300 border-gray-700 group-hover:bg-gray-200 group-hover:text-gray-900 transition-colors shadow shadow-gray-700 bg-gray-600/60"
          />
        )}
      </button>

      {/* 📥 Panel */}
      <div
        ref={panelRef}
        className={`
          absolute right-0 mt-2 w-80 max-h-[22rem] overflow-y-auto
          bg-black/50 border border-gray-300 rounded-xl shadow-2xl shadow-gray-600 backdrop-blur-md
          transition-all duration-200 ease-out transform
          ${open ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"}
        `}
      >
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <span className="text-gray-100 font-semibold">Notifications</span>
          <button
            className="text-xs flex items-center gap-1 px-2 py-1 bg-gray-800 text-orange-300 hover:text-white hover:bg-gray-700 rounded"
            onClick={markAllRead}
            title="Mark all as read (except critical)"
          >
            <CheckCheck size={14} />
            Mark All Read
          </button>
        </div>

        <div className="p-4 space-y-2 text-sm text-gray-300">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <LoaderCircle className="text-gray-300 animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center text-gray-500">
              No new notifications.
            </div>
          ) : (
            notifications.map((n) => {
              const isLong = n.message.length > 120;
              return (
                <div
                  key={n.id}
                  className={`p-3 rounded-md shadow-sm border-l-4 ${levelColors[n.level] || levelColors[1]}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-300 rounded px-1 bg-gray-800/40">
                      {n.createdAt
                        ? new Date(n.createdAt).toLocaleString()
                        : ""}
                    </span>
                    {n.level === 3 && (
                      <span className="text-xs px-2 py-0.5 rounded bg-red-600 text-white">
                        CRITICAL
                      </span>
                    )}
                  </div>

                  {/* Message content with optional title */}
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="text-gray-100 font-semibold whitespace-pre-wrap">
                        {n.title
                          ? n.title
                          : isLong
                            ? n.message.slice(0, 100) + "..."
                            : n.message}
                      </div>
                      {n.title && (
                        <div className="text-gray-300 text-sm whitespace-pre-wrap rounded">
                          {isLong ? n.message.slice(0, 100) + "..." : n.message}
                        </div>
                      )}
                    </div>

                    {/* Show ✅ if short message and not critical */}
                    {!isLong && (
                      <button
                        title="Mark as read"
                        className="ml-2 mt-1 border rounded text-green-400 hover:text-green-300 transition text-xs"
                        onClick={() => markRead(n.id)}
                      >
                        <Check size={16} />
                      </button>
                    )}
                  </div>

                  {/* View More for long messages */}
                  {isLong && (
                    <div className="mt-2">
                      <button
                        className="text-blue-400 hover:underline text-xs"
                        onClick={() => setModalNotif(n)}
                      >
                        View More
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 📖 Markdown Modal */}
      {modalNotif && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[999]">
          <div className="bg-black/70 border border-gray-700 rounded-lg w-[90%] max-w-xl p-6 relative overflow-y-auto max-h-[80vh]">
            <X
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-100 cursor-pointer"
              onClick={() => setModalNotif(null)}
            />
            <div className="mb-4 flex justify-between items-center">
              <span className="text-sm text-gray-500 rounded px-1 bg-gray-800/40">
                {modalNotif.createdAt
                  ? new Date(modalNotif.createdAt).toLocaleString()
                  : ""}
              </span>
              {modalNotif.level === 3 && (
                <span className="text-xs px-2 py-0.5 rounded bg-red-600 text-white">
                  CRITICAL
                </span>
              )}
            </div>
            {modalNotif.title && (
              <h2 className="text-xl font-semibold text-gray-100 mb-2">
                {modalNotif.title}
              </h2>
            )}
            <div className="prose prose-invert max-w-none text-gray-300 mb-6">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeRaw, rehypeKatex]}
              >
                {modalNotif.message}
              </ReactMarkdown>
            </div>
            <button
              className="mt-2 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white text-sm rounded"
              onClick={() => {
                markRead(modalNotif.id);
                setModalNotif(null);
              }}
            >
              Mark as Read
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notification;
