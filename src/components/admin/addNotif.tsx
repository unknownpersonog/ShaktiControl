import React, { useState, useEffect } from "react";

const NotificationAdminModal = ({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [level, setLevel] = useState(1);
  const [assignType, setAssignType] = useState<"all" | "specific">("all");
  const [emails, setEmails] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otn, setOtn] = useState(false);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setMessage("");
      setLevel(1);
      setEmails("");
      setAssignType("all");
      setOtn(false);
      setError(null);
    }
  }, [open]);

  const handleCreate = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = otn
        ? "/api/uvapi/notifs/creat-otn"
        : "/api/uvapi/notifs/create";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message, level }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create notification");
        setLoading(false);
        return;
      }

      const { notif } = await res.json();
      let assignRes;

      if (assignType === "all") {
        assignRes = await fetch("/api/uvapi/notifs/assig-all", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationId: notif.id }),
        });
      } else {
        const emailArr = emails
          .split(",")
          .map((e) => e.trim())
          .filter((e) => e.length > 0);
        if (emailArr.length === 0) {
          setError("Please enter at least one email.");
          setLoading(false);
          return;
        }
        assignRes = await fetch("/api/uvapi/notifs/assign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationId: notif.id, emails: emailArr }),
        });
      }

      if (!assignRes.ok) {
        const data = await assignRes.json();
        setError(data.error || "Failed to assign notification");
      } else {
        onCreated();
        onClose();
      }
    } catch {
      setError("Failed to create or assign notification");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-[#111] rounded-xl p-6 w-full max-w-lg shadow-xl border border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-white">
          Create Notification
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-1">Title (optional)</label>
            <input
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-gray-100"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-1">Message</label>
            <textarea
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-gray-100"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-1">Level</label>
            <select
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-gray-100"
              value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
              disabled={loading}
            >
              <option value={1}>Info</option>
              <option value={2}>Warning</option>
              <option value={3}>Critical</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={otn}
              onChange={() => setOtn(!otn)}
              disabled={loading}
              id="otn"
            />
            <label htmlFor="otn" className="text-gray-300">
              One-Time Notification (OTN)
            </label>
          </div>

          <div>
            <label className="block text-gray-300 mb-1">Assign To</label>
            <div className="flex gap-4 text-gray-300">
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="assignType"
                  value="all"
                  checked={assignType === "all"}
                  onChange={() => setAssignType("all")}
                  disabled={loading}
                />
                All Users
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="assignType"
                  value="specific"
                  checked={assignType === "specific"}
                  onChange={() => setAssignType("specific")}
                  disabled={loading}
                />
                Specific Users
              </label>
            </div>
          </div>

          {assignType === "specific" && (
            <div>
              <label className="block text-gray-300 mb-1">
                Emails (comma-separated)
              </label>
              <input
                className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-gray-100"
                type="text"
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          {error && <div className="text-red-400 text-sm">{error}</div>}

          <div className="flex justify-end gap-2 pt-4">
            <button
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={handleCreate}
              disabled={loading || !message.trim()}
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationAdminModal;
