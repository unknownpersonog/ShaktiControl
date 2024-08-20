'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Home, Server, BarChart2, Settings, ChevronLeft, ChevronRight,
  Mail, Calendar, Users, Briefcase, Globe, X, Shield
} from 'lucide-react';

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

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isAdmin: boolean; // New prop to check if the user is an admin
}

export default function Sidebar({ sidebarOpen, setSidebarOpen, isAdmin }: SidebarProps) {
  // Add admin item to the sidebar items if the user is an admin
  const allSidebarItems = isAdmin
    ? [...sidebarItems, { name: 'Admin', icon: Shield }]
    : sidebarItems;

  return (
    <aside
      className={`
        ${sidebarOpen ? 'w-64' : 'w-24'}
        transition-all duration-300 ease-in-out
        bg-opacity-80 backdrop-blur-lg border-r border-purple-500
        flex flex-col
      `}
    >
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-center mb-8">
          {sidebarOpen && <h2 className="text-2xl font-bold text-purple-300">UnknownVPS</h2>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white p-1 rounded-full hover:bg-purple-700 transition-colors"
          >
            {sidebarOpen ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
          </button>
        </div>
        <nav>
          <ul className="space-y-2">
            {allSidebarItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={`/${item.name.toLowerCase()}`}
                  className={`
                    flex items-center py-2 px-4 rounded text-gray-300
                    hover:bg-purple-700 hover:text-white transition-colors
                    ${!sidebarOpen && 'justify-center'}
                  `}
                  title={item.name}
                >
                  <item.icon size={18} className={sidebarOpen ? 'mr-3' : ''} />
                  {sidebarOpen && item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="p-4">
        <Link
          href="/api/auth/signout"
          className={`
            flex items-center justify-center py-2 px-4 rounded
            text-purple-300 border border-purple-500
            hover:bg-purple-700 hover:text-white transition-colors
          `}
        >
          {sidebarOpen ? 'Logout' : <X size={18} />}
        </Link>
      </div>
    </aside>
  );
}