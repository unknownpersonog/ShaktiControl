'use client';

import { useState, useEffect } from 'react';
import { Server as ServerIcon, CheckCircle, XCircle } from 'lucide-react';
import { makeRequest } from '@/functions/api/makeRequest';
import Sidebar from '@/components/sidebar';
import LoadingComponent from '@/components/loading';

interface Server {
  id: string;
  name: string;
  status: string;
}

export default function ServersPage() {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const response = await makeRequest("GET", "/api/user/servers");
        if (response?.response.ok) {
          setServers(response.data as Server[]);
        } else {
          console.error('Failed to fetch servers');
        }
      } catch (error) {
        console.error('Error fetching servers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServers();
  }, []);
  return (
    <div className="flex min-h-screen text-white">
      <Sidebar sidebarOpen={true} setSidebarOpen={() => {}} isAdmin={false} />

      <main className="flex-1 p-6 md:p-10">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-purple-300">Your Servers</h1>
        </header>

        {loading ? (
          <LoadingComponent />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servers.length > 0 ? (
              servers.map((server) => (
                <div
                  key={server.id}
                  className="p-4 rounded-lg bg-opacity-50 border backdrop-blur-md border-blue-500"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <ServerIcon className="text-gray-400" />
                      <span className="text-lg font-semibold text-gray-300">
                        {server.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {server.status === 'Online' ? (
                        <CheckCircle className="text-green-500" />
                      ) : (
                        <XCircle className="text-red-500" />
                      )}
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          server.status === 'Online'
                            ? 'bg-green-500'
                            : 'bg-red-500'
                        }`}
                      >
                        {server.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-gray-400 text-sm">
                    Server ID: {server.id}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-300">
                You do not have any servers.
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
