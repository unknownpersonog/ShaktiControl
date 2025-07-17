"use client";
import React, { useEffect, useState } from "react";
import { makeRequest } from "@/functions/api/makeRequest";
import { LoaderCircle } from "lucide-react";

interface ServiceAdmin {
  _id: string;
  key: string;
  name: string;
  alwaysEnabled: boolean;
  enabledUsers: string[];
}

export default function ServiceAdminPage() {
  const [services, setServices] = useState<ServiceAdmin[]>([]);
  const [form, setForm] = useState({ key: "", name: "", alwaysEnabled: false });
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await makeRequest("GET", "/api/uvapi/services/adminall");
      if (res?.status === 200 && Array.isArray(res.data?.data.servicesAdmin)) {
        setServices(res.data.data.servicesAdmin); // Fixed the data path here
      }
    } catch (error) {
      console.error("Failed to fetch services", error);
    }
    setLoading(false);
  };

  const addService = async (e: React.FormEvent) => {
    e.preventDefault();
    const { key, name, alwaysEnabled } = form;
    if (!key || !name) return alert("Key and name are required.");

    try {
      const res = await makeRequest("POST", "/api/uvapi/services/add", {
        key,
        name,
        alwaysEnabled,
      });

      if (res?.status === 201) {
        setShowAddModal(false);
        setShowSuccessModal(true);
        setForm({ key: "", name: "", alwaysEnabled: false });
        fetchServices();
        setTimeout(() => setShowSuccessModal(false), 2000);
      }
    } catch (error) {
      alert("Failed to add service.");
    }
  };

  return (
    <div className="p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Services</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add New Service
        </button>
      </div>

      {/* Add Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add New Service</h3>
            <form onSubmit={addService} className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Service Key</label>
                <input
                  type="text"
                  required
                  value={form.key}
                  onChange={(e) => setForm({ ...form, key: e.target.value })}
                  className="w-full p-2 bg-gray-700 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Service Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full p-2 bg-gray-700 rounded text-white"
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.alwaysEnabled}
                  onChange={(e) =>
                    setForm({ ...form, alwaysEnabled: e.target.checked })
                  }
                />
                <span className="text-sm">Always Enabled</span>
              </label>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
                >
                  Create Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-green-600 text-white px-6 py-4 rounded-lg flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>Service added successfully!</span>
          </div>
        </div>
      )}

      {/* Services List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center">
            <LoaderCircle className="animate-spin h-8 w-8 text-gray-200" />
          </div>
        ) : services.length === 0 ? (
          <div className="p-4 bg-gray-800 rounded-lg text-center">
            <p className="text-gray-400">No services found</p>
          </div>
        ) : (
          services.map((svc) => (
            <div
              key={svc._id}
              className="p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
            >
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="font-medium">{svc.name}</p>
                  <p className="text-sm text-gray-400">Key: {svc.key}</p>
                </div>
                {svc.alwaysEnabled ? (
                  <span className="px-2 py-1 bg-green-800/30 text-green-400 text-sm rounded">
                    Always Enabled
                  </span>
                ) : (
                  <span className="text-sm text-gray-400">
                    {svc.enabledUsers.length} enabled users
                  </span>
                )}
              </div>
              {!svc.alwaysEnabled && svc.enabledUsers.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <details>
                    <summary className="text-sm text-blue-400 cursor-pointer">
                      Show enabled users
                    </summary>
                    <ul className="mt-2 space-y-1">
                      {svc.enabledUsers.map((user) => (
                        <li key={user} className="text-sm text-gray-300">
                          {user}
                        </li>
                      ))}
                    </ul>
                  </details>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
