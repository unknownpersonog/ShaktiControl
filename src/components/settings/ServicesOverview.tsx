"use client";
import React, { useEffect, useState } from "react";
import ToggleSwitch from "@/components/ui/ToggleSwitch";
import { makeRequest } from "@/functions/api/makeRequest";
import { useSession } from "next-auth/react";
import { LoaderCircle } from "lucide-react";

interface Service {
  key: string;
  name: string;
  alwaysEnabled?: boolean;
}

export default function ServicesOverview() {
  const [services, setServices] = useState<(Service & { enabled: boolean })[]>(
    [],
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const allRes = await makeRequest("GET", `/api/uvapi/services/all`);
        const userRes = await makeRequest("GET", `/api/uvapi/services/enabled`);

        // Check if the responses are valid and contain the data structure we expect
        const allServices = allRes?.data?.data?.services;
        const userServices = userRes?.data?.data?.services;

        if (
          allRes?.status === 200 &&
          userRes?.status === 200 &&
          Array.isArray(allServices)
        ) {
          // Create a set of enabled service keys
          const userServiceKeys = new Set(
            Array.isArray(userServices)
              ? userServices.map((svc: Service) => svc.key)
              : [],
          );

          // Map all services and add the enabled property
          const merged = allServices.map((svc: Service) => ({
            ...svc,
            enabled: svc.alwaysEnabled || userServiceKeys.has(svc.key),
          }));

          setServices(merged);
        } else {
          console.error(
            "Invalid response from service endpoints",
            allRes,
            userRes,
          );
          setError("Failed to load services data. Please try again later.");
        }
      } catch (err) {
        console.error("Error fetching services", err);
        setError(
          "An error occurred while fetching services. Please try again later.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, []);

  const toggleService = async (key: string) => {
    const target = services.find((s) => s.key === key);
    if (!target || target.alwaysEnabled) return;

    const newState = !target.enabled;
    try {
      const res = await makeRequest("POST", `/api/uvapi/services/toggle`, {
        email: session?.user?.email,
        key,
        enabled: newState,
      });

      if (res && res.status === 200) {
        setServices((prev) =>
          prev.map((svc) =>
            svc.key === key ? { ...svc, enabled: newState } : svc,
          ),
        );
      } else {
        console.error("Failed to toggle service", res?.message || res);
      }
    } catch (err) {
      console.error("Error toggling service", err);
    }
  };

  const enabledServices = services.filter((svc) => svc.enabled);

  return (
    <div className="w-full border rounded-lg p-4 border-gray-600 shadow-md h-full flex flex-col">
      <h2 className="text-lg font-semibold text-white mb-4">
        Services Overview
      </h2>

      {isLoading ? (
        <div className="flex-grow flex items-center justify-center">
          <LoaderCircle className="animate-spin h-8 w-8 text-gray-200" />
        </div>
      ) : error ? (
        <div className="flex-grow flex items-center justify-center">
          <p className="text-red-400">{error}</p>
        </div>
      ) : enabledServices.length > 0 ? (
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
        <p className="text-gray-300 text-sm mb-4">
          No services are currently enabled.
        </p>
      )}

      <button
        onClick={() => setModalOpen(true)}
        className="mt-4 px-4 py-2 text-sm rounded-md border border-gray-500 text-white bg-white/10 hover:bg-white/20 transition"
        disabled={isLoading || services.length === 0}
      >
        Manage Services
      </button>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-black border border-gray-600 p-6 rounded-lg w-full max-w-lg shadow-xl">
            <h3 className="text-white text-lg font-semibold mb-4">
              Manage Services
            </h3>

            <div className="mb-4">
              <h4 className="text-sm text-orange-300 font-medium mb-2">
                Always Enabled
              </h4>
              {services.filter((svc) => svc.alwaysEnabled).length > 0 ? (
                <ul className="space-y-2">
                  {services
                    .filter((svc) => svc.alwaysEnabled)
                    .map((svc) => (
                      <li
                        key={svc.key}
                        className="flex justify-between items-center p-3 bg-white/5 border border-gray-500 rounded"
                      >
                        <span className="text-white text-sm">{svc.name}</span>
                        <span className="text-xs text-green-400">
                          Always On
                        </span>
                      </li>
                    ))}
                </ul>
              ) : (
                <p className="text-gray-300 text-sm">
                  No always-enabled services.
                </p>
              )}
            </div>

            <div>
              <h4 className="text-sm text-orange-300 font-medium mb-2">
                Optional Services
              </h4>
              {services.filter((svc) => !svc.alwaysEnabled).length > 0 ? (
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
              ) : (
                <p className="text-gray-300 text-sm">
                  No optional services available.
                </p>
              )}
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
