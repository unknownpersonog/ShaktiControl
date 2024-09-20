import React, { useState, useEffect, useMemo } from 'react';
import { makeRequest } from '@/functions/api/makeRequest';
import Sidebar from './sidebar';
import { User, Bell, HardDrive, Cpu, MemoryStick } from 'lucide-react';
import Alert from '@/components/ui/alert';
import ServerStatusCard from './ServerStatusCard';
import Header from './Header';
import ResourceCard from './ResourceCard';
import Footer from './Footer';
import OSServicesList from './OSServicesList';
import ActivityList from './ActivityList';
import FeatureBox from './FeatureBox';

// Constants moved outside of the component to avoid recreation on every render
const borderColors = [
  'border-pink-500',
  'border-purple-500',
  'border-indigo-500',
  'border-blue-500',
  'border-cyan-500',
  'border-teal-500',
];

const allocatedResources = [
  { name: 'RAM', icon: MemoryStick, value: 'Undefined' },
  { name: 'CPU', icon: Cpu, value: 'Undefined' },
  { name: 'Disk', icon: HardDrive, value: 'Undefined' },
];

const recentActivities = [
  { action: 'Created new VPS', time: '2 hours ago' },
  { action: 'Updated project settings', time: 'Yesterday' },
  { action: 'Deployed new application', time: '3 days ago' },
];

const availableOS = [
  { name: 'Ubuntu', description: 'Easy to use Linux Distribution', icon: 'ubuntu.png' },
  { name: 'Debian', description: 'Stable Linux Distribution', icon: 'debian.png' },
  { name: 'Minecraft', description: 'Popular sandbox game server', icon: 'minecraft.png' },
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
        if (response?.status === 200) {
          setServerStatus((prevStatus) => ({ ...prevStatus, API: "Online" }));
        }
      } catch (error) {
        console.error('Error fetching server status:', error);
      }
    };

    fetchServerStatus();
  }, []);

  return (
    <div className="flex min-h-screen text-white relative">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isAdmin={userData?.data?.admin === "true"}
      />

      <main className={`flex-1 p-4 md:p-6 ${isMobile ? 'pt-20' : ''}`}>
        <Header
          session={session}
          userData={userData}
          showProfile={showProfile}
          setShowProfile={setShowProfile}
        />

        <Alert
          title="Welcome to your dashboard"
          description="Check out the latest updates and your resource allocation below."
          variant="default"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-0">
          <ServerStatusCard serverStatus={serverStatus} />
          <ResourceCard allocatedResources={allocatedResources} />
          <FeatureBox />
          <ActivityList activities={recentActivities} />
          <OSServicesList osList={availableOS} />
        </div>

        <Footer />
      </main>
    </div>
  );
}
