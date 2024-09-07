import React, { useState, useEffect } from 'react';
import { makeRequest } from '@/functions/api/makeRequest';
import Sidebar from './sidebar';
import { User, Bell, HardDrive, Cpu, MemoryStick } from 'lucide-react';
import Alert from '@/components/ui/alert';

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
  session: any;
}

export default function Dashboard({ userData, session }: DashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [serverStatus, setServerStatus] = useState({ API: 'Offline' });
  const [isMobile, setIsMobile] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchServerStatus = async () => {
      try {
        const response = await makeRequest("GET", "/api/uvapi/ping");
        if (response?.response.ok) {
          setServerStatus((prevStatus) => ({
            ...prevStatus,
            API: "Online"
          }));
        }
      } catch (error) {
        console.error('Error fetching server status:', error);
      }
    };

    fetchServerStatus();
  }, []);

  const allocatedResources = [
    { name: 'RAM', icon: MemoryStick, value: 'Undefined' },
    { name: 'CPU', icon: Cpu, value: 'Undefined' },
    { name: 'Disk', icon: HardDrive, value: 'Undefined' },
  ];

  return (
    <div className="flex min-h-screen text-white relative">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isAdmin={userData.data.admin === "true"}
      />

      <main className={`flex-1 p-4 md:p-6 ${isMobile ? 'pt-20' : ''}`}>
        <header className="flex justify-between items-center mb-4 md:mb-8 relative z-10">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-purple-300">Dashboard</h1>
          <div className="relative">
            <div
              className="flex items-center space-x-2 bg-blue-800 bg-opacity-50 backdrop-blur-md p-2 rounded-full cursor-pointer hover:bg-gray-700 transition-colors"
              onClick={() => setShowProfile(!showProfile)}
            >
              <User className="text-purple-300" />
            </div>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-gray-800 bg-opacity-50 backdrop-blur-md border border-gray-700 rounded-lg shadow-lg p-4 z-20">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-gray-300">Name</div>
                  <div className="text-green-400">{session.name}</div>
                  <div className="text-gray-300">Email</div>
                  <div className="text-blue-400 truncate" title={userData.data.email}>{userData.data.email}</div>
                  <div className="text-gray-300">UnID</div>
                  <div className="text-yellow-400">{userData.data.unid}</div>
                  <div className="text-gray-300">Coins</div>
                  <div className="text-cyan-400">N/A</div>
                </div>
              </div>
            )}
          </div>
        </header>
        
        <Alert
          title="Welcome to your dashboard"
          description="Check out the latest updates and your resource allocation below."
          variant="default"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-0">
          {/* Server Status */}
          <div className={`p-4 md:p-6 rounded-lg bg-opacity-50 border backdrop-blur-md ${borderColors[0]}`}>
            <h3 className="text-lg md:text-xl font-semibold mb-4 text-pink-300">Server Status</h3>
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
          </div>

          {/* Allocated Resources */}
          <div className={`p-4 md:p-6 rounded-lg bg-opacity-50 border backdrop-blur-md ${borderColors[1]}`}>
            <h3 className="text-lg md:text-xl font-semibold mb-4 text-purple-300">Allocated Resources</h3>
            <div className="space-y-4">
              {allocatedResources.map((resource, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <resource.icon className="w-5 h-5 md:w-6 md:h-6 mr-2 text-purple-300" />
                    <span className="text-gray-300">{resource.name}</span>
                  </div>
                  <span className="text-purple-300">{resource.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Box to Cover Space */}
          <div className={`p-4 md:p-6 rounded-lg bg-opacity-50 border backdrop-blur-md ${borderColors[2]} relative z-0`}>
            <h3 className="text-lg md:text-xl font-semibold mb-4 text-green-300">New Feature Box</h3>
            <p className="text-gray-300">This is an additional box to cover up the extra space. You can customize it further.</p>
          </div>

          {/* Recent Activity */}
          <div className={`p-4 md:p-6 rounded-lg bg-opacity-50 border backdrop-blur-md ${borderColors[3]} col-span-1 lg:col-span-2`}>
            <h3 className="text-lg md:text-xl font-semibold mb-4 text-teal-300">Recent Activity</h3>
            <ul className="space-y-2">
              {[
                { action: 'Created new VPS', time: '2 hours ago' },
                { action: 'Updated project settings', time: 'Yesterday' },
                { action: 'Deployed new application', time: '3 days ago' },
              ].map((activity, index) => (
                <li key={index} className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-gray-300">{activity.action}</span>
                  <span className="text-sm text-gray-500">{activity.time}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Available OS & Services */}
          <div className={`p-4 md:p-6 rounded-lg bg-opacity-50 border backdrop-blur-md ${borderColors[5]}`}>
            <h3 className="text-lg md:text-xl font-semibold mb-4 text-blue-300">Available OS & Services</h3>
            <ul className="space-y-2">
              {[
                { name: 'Ubuntu', description: 'Easy to use Linux Distribution', icon: 'ubuntu.png' },
                { name: 'Debian', description: 'Stable Linux Distribution', icon: 'debian.png' },
                { name: 'Minecraft', description: 'Popular sandbox game server', icon: 'minecraft.png' },
              ].map((os) => (
                <li key={os.name} className="flex items-center">
                  <img src={`https://cdn.jsdelivr.net/gh/unknownpersonog/unknownvps-client@assets/png/${os.icon}`} alt={os.name} className="w-5 h-5 md:w-6 md:h-6 mr-2" />
                  <div>
                    <span className="text-gray-300">{os.name}</span>
                    <p className="text-xs text-gray-400">{os.description}</p>
                  </div>
                </li>
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
