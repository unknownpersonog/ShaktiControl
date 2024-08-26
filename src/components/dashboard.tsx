'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Home, Server, BarChart2, Settings, Menu, X, 
  Mail, Calendar, Users, Briefcase, Globe, ChevronLeft, ChevronRight
} from 'lucide-react';
import { makeRequest } from '@/functions/api/makeRequest';
import LoadingComponent from './loading';
import Sidebar from './sidebar';

const sidebarItems = [
  { name: 'Dashboard', icon: Home },
  { name: 'Servers', icon: Server },
  { name: 'Analytics', icon: BarChart2 },
  { name: 'Messages', icon: Mail },
  { name: 'Calendar', icon: Calendar },
  { name: 'Users', icon: Users },
  { name: 'Projects', icon: Briefcase },
  { name: 'Global Network', icon: Globe },
  { name: 'Settings', icon: Settings },
];

const borderColors = [
  'border-pink-500',
  'border-purple-500',
  'border-indigo-500',
  'border-blue-500',
  'border-cyan-500',
  'border-teal-500',
];

interface DashboardProps {
  userData: any;
  session: any
}

export default function Dashboard({ userData, session }: DashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [serverStatus, setServerStatus] = useState({
    API: 'Offline'
  });

  useEffect(() => {
    const fetchServerStatus = async () => {
      try {
        const response = await makeRequest("GET", "/api/uvapi/ping");
        if (response?.response.ok) {
          setServerStatus({
            API: "Online"
          });
        } else {
          console.error('Failed to fetch server status');
        }
      } catch (error) {
        console.error('Error fetching server status:', error);
      }
    };

    fetchServerStatus();
  }, []);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isAdmin={userData.data.admin === "true"}
      />

      {/* Main content */}
      <main className="flex-1 p-6 md:p-10">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-purple-300">Welcome, {session.name}</h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Server Status */}
          <div className={`p-6 rounded-lg bg-opacity-50 border backdrop-blur-md ${borderColors[0]}`}>
            <h3 className="text-xl font-semibold mb-4 text-pink-300">Server Status</h3>
            <div className="space-y-2">
              {Object.entries(serverStatus).map(([server, status]) => (
                <div key={server} className="flex justify-between items-center">
                  <span className="text-gray-300">{server}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${status === 'Online' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {status}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-700 mt-4 pt-4">
              <p className="text-gray-300 text-sm">
                For more detailed status updates, click 
                <a href="https://status.unknownvps.eu.org" className="ml-1 inline-block px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                  here
                </a>.
              </p>
            </div>
          </div>


          {/* Resource Usage */}
          <div className={`p-6 rounded-lg bg-opacity-50 border backdrop-blur-md ${borderColors[1]}`}>
            <h3 className="text-xl font-semibold mb-4 text-purple-300">Resource Usage</h3>
            <div className="space-y-4">
              {['CPU', 'RAM', 'Disk'].map((resource) => (
                <div key={resource}>
                  <div className="flex justify-between text-sm text-gray-300 mb-1">
                    <span>{resource}</span>
                    <span>75%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Network Traffic */}
          <div className={`p-6 rounded-lg bg-opacity-50 border backdrop-blur-md ${borderColors[2]}`}>
            <h3 className="text-xl font-semibold mb-4 text-indigo-300">Your Profile</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Name</span>
                <span className="text-green-400">{session.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Email</span>
                <span className="text-blue-400">{userData.data.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">UnID</span>
                <span className="text-yellow-400">{userData.data.unid}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Coins</span>
                <span className="text-cyan-400">N/A</span>
              </div>
            </div>
          </div>
          {/* Quick Actions */}
          <div className={`p-6 rounded-lg bg-opacity-50 border backdrop-blur-md ${borderColors[3]}`}>
            <h3 className="text-xl font-semibold mb-4 text-teal-300">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {['Restart Server', 'Run Backup', 'Update System', 'Add User'].map((action) => (
                <button 
                  key={action} 
                  className="py-2 px-4 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>

          

          {/* Recent Messages */}
          <div className={`p-6 rounded-lg bg-opacity-50 border backdrop-blur-md ${borderColors[4]}`}>
            <h3 className="text-xl font-semibold mb-4 text-cyan-300">Recent Messages</h3>
            <ul className="space-y-2">
              {[
                'New support ticket: #1234',
                'John: Project update required',
                'System: Backup completed successfully',
              ].map((message, index) => (
                <li key={index} className="text-gray-300">• {message}</li>
              ))}
            </ul>
          </div>

          {/* Calendar Events */}
          <div className={`p-6 rounded-lg bg-opacity-50 border backdrop-blur-md ${borderColors[5]}`}>
            <h3 className="text-xl font-semibold mb-4 text-blue-300">Upcoming Events</h3>
            <ul className="space-y-2">
              {[
                'Team Meeting - 2:00 PM',
                'Project Deadline - Tomorrow',
                'Client Call - 4:30 PM',
              ].map((event, index) => (
                <li key={index} className="text-gray-300">• {event}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <p className="rounded border p-2 text-purple-300 border-purple-500 hover:bg-purple-800 transition-colors">
            ShaktiCtrl • Made In India 🚀
          </p>
        </div>
      </main>
    </div>
  );
}
