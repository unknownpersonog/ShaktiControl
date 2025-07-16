"use client";

import React, { useEffect, useState } from "react";
import { makeRequest } from "@/functions/api/makeRequest";
import NotificationAdminModal from "@/components/admin/addNotif";
import { Trash2, Pencil, RefreshCw, LoaderCircle } from "lucide-react";

type Notification = {
  id: number;
  title?: string;
  message: string;
  level: string;
  otn: boolean;
};

const NotificationManagementTable = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await makeRequest("GET", "/api/uvapi/notifs/non-otn");
      if (res?.data.notifications) setNotifications(res.data.notifications);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this notification?")) return;
    try {
      await makeRequest("POST", `/api/uvapi/notifs/delete`, { id: id });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (e) {
      console.error("Failed to delete notification", e);
    }
  };

  const flushOTNs = async () => {
    if (!confirm("Flush all expired OTN notifications?")) return;
    try {
      await makeRequest("GET", "/api/uvapi/notifs/flush-otn");
      await fetchNotifications();
    } catch (e) {
      console.error("Error flushing OTN notifications", e);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="p-6 rounded-xl border border-gray-700 bg-gray-900 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Notifications</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Add
          </button>
          <button
            onClick={flushOTNs}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Flush OTN
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <LoaderCircle className="animate-spin h-6 w-6 text-gray-300" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs uppercase bg-gray-800 text-gray-400">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Title</th>
                <th className="px-4 py-2">Message</th>
                <th className="px-4 py-2">Level</th>
                <th className="px-4 py-2">OTN</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((notif) => (
                <tr key={notif.id} className="border-b border-gray-700">
                  <td className="px-4 py-2">{notif.id}</td>
                  <td className="px-4 py-2">{notif.title || "-"}</td>
                  <td className="px-4 py-2">{notif.message}</td>
                  <td className="px-4 py-2">{notif.level}</td>
                  <td className="px-4 py-2">{notif.otn ? "Yes" : "No"}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      onClick={() => handleDelete(notif.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                    {/* Future edit button */}
                    <button className="text-yellow-400 hover:text-yellow-600" disabled>
                      <Pencil size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <NotificationAdminModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onCreated={fetchNotifications}
        />
      )}
    </div>
  );
};

export default NotificationManagementTable;