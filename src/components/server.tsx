import React, { useState, useEffect, useCallback } from "react";
import { makeRequest } from "@/functions/api/makeRequest";
import Sidebar from "./sidebar";
import debounce from "lodash.debounce";
import { Plus, Server, Calendar, Cpu, Globe, Shield, Key, Code, Loader2 } from "lucide-react";

const borderColors = [
  "border-pink-500",
  "border-purple-500",
  "border-indigo-500",
  "border-blue-500",
  "border-cyan-500",
  "border-teal-500",
];

interface VPS {
  id: number;
  name: string;
  os: string;
  port: number;
  owner: string;
  pass: string;
  plan: string;
  user: string;
  ip: string;
  createdAt?: string;
}

interface VPSProps {
  userData: {
    data: {
      admin: string;
      unid: string;
      email: string;
      vpsIds: string[]; // Fetch user's VPS IDs from this array
    };
  };
  session: any;
}

export default function VPSManagement({ userData, session }: VPSProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [vpsList, setVpsList] = useState<VPS[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state
  const [creating, setCreating] = useState(false); // Add loading state for VPS creation
  const [showConfirmation, setShowConfirmation] = useState(false); // For VPS creation confirmation

  const checkMobile = useCallback(
    debounce(() => {
      setIsMobile(window.innerWidth < 768);
    }, 200),
    [],
  );

  useEffect(() => {
    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, [checkMobile]);

  useEffect(() => {
    const fetchVPS = async () => {
      setLoading(true);
      try {
        const vpsDetails = await Promise.all(
          userData.data.vpsIds.map(async (vpsId) => {
            const response = await makeRequest("GET", `/api/uvapi/vps/info/${vpsId}`);
            if (response?.status === 200) {
              return response.data;
            } else {
              console.error("Failed to fetch VPS info for:", vpsId);
              return null;
            }
          })
        );
        setVpsList(vpsDetails.filter((vps) => vps !== null));
      } catch (error) {
        console.error("Error fetching VPS:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVPS();
  }, [userData.data.vpsIds]);

  const handleCreateVPS = async () => {
    setCreating(true);
    try {
      const response = await makeRequest(
        "POST",
        "/api/uvapi/vps/assign",
        {
          email: userData.data.email, // Include the user's email
          plan: "free", // Default plan
        }
      );
      if (response?.status === 200) {
        const data = response.data;
        setVpsList([...vpsList, data]); // Add the new VPS to the list
        setShowConfirmation(false); // Hide confirmation
      } else {
        console.error("Failed to create VPS");
      }
    } catch (error) {
      console.error("Error creating VPS:", error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isAdmin={userData.data.admin === "true"}
        userData={userData}
        session={session}
      />

      <main className={`flex-1 p-6 md:p-10 ${isMobile ? "pt-20" : ""}`}>
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-purple-300">
            My VPS
          </h1>
          <button
            onClick={() => setShowConfirmation(true)}
            className="py-2 px-4 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors flex items-center"
          >
            <Plus className="mr-2" />
            Create New VPS
          </button>
        </header>

        {showConfirmation && (
          <div className="mb-8 p-6 rounded-lg bg-opacity-50 border backdrop-blur-md border-teal-500">
            <h3 className="text-xl font-semibold mb-4 text-teal-300">
              Do you want to create a VPS?
            </h3>
            <div className="flex justify-end">
              <button
                onClick={handleCreateVPS}
                className="py-2 px-4 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors mr-2"
                disabled={creating}
              >
                {creating ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "OK"
                )}
              </button>
              <button
                onClick={() => setShowConfirmation(false)}
                className="py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="animate-spin text-purple-500" size={48} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vpsList.map((vps, index) => (
              <div
                key={vps.id}
                className={`p-6 rounded-lg bg-opacity-50 border backdrop-blur-md ${borderColors[index % borderColors.length]}`}
              >
                <h3 className="text-xl font-semibold mb-4 text-pink-300">
                  {vps.name}
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Unique ID</span>
                    <span className="text-yellow-400">{vps.id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Operating System</span>
                    <span className="text-teal-400">{vps.os}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 flex items-center">
                      <Server className="mr-2" size={16} /> Port
                    </span>
                    <span className="text-blue-400">{vps.port}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 flex items-center">
                      <Globe className="mr-2" size={16} /> IP
                    </span>
                    <span className="text-purple-400">{vps.ip}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Owner</span>
                    <span className="text-pink-400">{vps.owner}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 flex items-center">
                      <Shield className="mr-2" size={16} /> User
                    </span>
                    <span className="text-green-400">{vps.user}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 flex items-center">
                      <Key className="mr-2" size={16} /> Password
                    </span>
                    <span className="text-red-400">{vps.pass}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 flex items-center">
                      <Code className="mr-2" size={16} /> Plan
                    </span>
                    <span className="text-cyan-400">{vps.plan}</span>
                  </div>
                  {vps.createdAt && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 flex items-center">
                        <Calendar className="mr-2" size={16} /> Created
                      </span>
                      <span className="text-purple-400">
                        {new Date(vps.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
