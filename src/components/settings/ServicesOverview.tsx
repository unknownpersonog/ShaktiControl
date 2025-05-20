"use client";
import React, { useState } from "react";
import ToggleSwitch from "@/components/ui/ToggleSwitch";

interface Service {
  key: string;
  name: string;
  enabled: boolean;
  alwaysEnabled?: boolean;
}

export default function ServicesOverview() {
  const [services, setServices] = useState<Service[]>([
    { key: "core", name: "Core System", enabled: true, alwaysEnabled: true },
    { key: "ai", name: "AI Assistant", enabled: true },
    { key: "notifications", name: "Notifications", enabled: false },
  ]);

  const [modalOpen, setModalOpen] = useState(false);

  const toggleService = (key: string) => {
    setServices((prev) =>
      prev.map((svc) =>
        svc.key === key && !svc.alwaysEnabled
          ? { ...svc, enabled: !svc.enabled }
          : svc
      )
    );
  };

  const enabledServices = services.filter((svc) => svc.enabled);

  return (
    <div className="w-full border rounded-lg p-4 border-gray-600 shadow-md h-full flex flex-col">
      <h2 className="text-lg font-semibold text-white mb-4">Services Overview</h2>

      {enabledServices.length > 0 ? (
        <ul className="space-y-2 flex-grow">
          {enabledServices.map((svc) => (
            <li
              key={svc.key}
              className="flex justify-between items-center p-3 border rounded-md bg-white/5 border-gray-500"
            >
              <span className="text-sm text-white">{svc.name}</span>
              <span className="text-green-400 text-xs">Enabled</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-300 text-sm mb-4">No services are currently enabled.</p>
      )}

      <button
        onClick={() => setModalOpen(true)}
        className="mt-4 px-4 py-2 text-sm rounded-md border border-gray-500 text-white bg-white/10 hover:bg-white/20 transition"
      >
        Manage Services
      </button>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-black border border-gray-600 p-6 rounded-lg w-full max-w-lg shadow-xl">
            <h3 className="text-white text-lg font-semibold mb-4">Manage Services</h3>

            <div className="mb-4">
              <h4 className="text-sm text-orange-300 font-medium mb-2">Always Enabled</h4>
              <ul className="space-y-2">
                {services
                  .filter((svc) => svc.alwaysEnabled)
                  .map((svc) => (
                    <li
                      key={svc.key}
                      className="flex justify-between items-center p-3 bg-white/5 border border-gray-500 rounded"
                    >
                      <span className="text-white text-sm">{svc.name}</span>
                      <span className="text-xs text-green-400">Always On</span>
                    </li>
                  ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm text-orange-300 font-medium mb-2">Optional Services</h4>
              <ul className="space-y-2">
                {services
                  .filter((svc) => !svc.alwaysEnabled)
                  .map((svc) => (
                    <li
                      key={svc.key}
                      className="flex justify-between items-center p-3 bg-white/5 border border-gray-500 rounded"
                    >
                      <span className="text-white text-sm">{svc.name}</span>
                      <ToggleSwitch
                        enabled={svc.enabled}
                        onToggle={() => toggleService(svc.key)}
                      />
                    </li>
                  ))}
              </ul>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-sm rounded border border-gray-500 text-white hover:bg-white/10 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
