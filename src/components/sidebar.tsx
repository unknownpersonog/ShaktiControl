"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Home,
  Server,
  BarChart2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Mail,
  Calendar,
  Layout,
  Briefcase,
  Globe,
  X,
  Shield,
  Menu,
  User,
  Coins,
  Store,
  Bot,
} from "lucide-react";
import ProfileModal from "@/components/ui/ProfileModal";
import { useApiInfo } from "@/context/ApiInfoProvider";

const sidebarItems = [
  { name: "Dashboard", icon: Home },
  { name: "Servers", icon: Server },
  { name: "Earn", icon: Coins },
  { name: "Store", icon: Store },
  { name: "Calendar", icon: Calendar },
  { name: "Boards", icon: Layout, href: "/board/manage" },
  { name: "Projects", icon: Briefcase },
  { name: "Chat", icon: Bot },
  { name: "Settings", icon: Settings },
];

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { userData, loading: userDataLoading, error } = useApiInfo();
  const isAdmin = userData?.data?.admin === "true";

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const allSidebarItems = isAdmin
    ? [...sidebarItems, { name: "Admin", icon: Shield }]
    : sidebarItems;

  // Helper function to get the correct URL for each item
  const getItemUrl = (item: any) => {
    return item.href || `/${item.name.toLowerCase()}`;
  };

  return (
    <>
      {/* Mobile menu button */}
      {isMobile && !sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-full text-white"
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`
          ${isMobile ? (sidebarOpen ? "translate-x-0" : "-translate-x-full") : ""}
          ${isMobile ? "fixed inset-y-0 left-0 z-40" : "relative"}
          transition-all duration-300 ease-in-out
          bg-opacity-80 backdrop-blur-lg border-r border-gray-500
          flex flex-col
          ${isMobile ? "w-64" : sidebarOpen ? "w-64" : ""}
          overflow-y-auto
        `}
      >
        <div className="p-6 flex-grow">
          <div className="flex justify-between items-center mb-8">
            {(sidebarOpen || isMobile) && (
              <h2 className="text-2xl font-bold text-gray-100">UnknownVPS</h2>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white p-1 rounded-full hover:bg-gray-200 hover:text-gray-900 transition-colors"
            >
              {sidebarOpen ? (
                <ChevronLeft size={25} />
              ) : (
                <ChevronRight size={25} />
              )}
            </button>
          </div>
          <nav>
            <ul className="space-y-2">
              {allSidebarItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={getItemUrl(item)}
                    className={`
                      flex items-center py-2 px-2 rounded text-gray-300
                      hover:bg-gray-200 hover:text-gray-900 transition-colors
                      ${!sidebarOpen && !isMobile && ""}
                    `}
                    title={item.name}
                  >
                    <item.icon
                      size={18}
                      className={sidebarOpen || isMobile ? "mr-3" : ""}
                    />
                    {(sidebarOpen || isMobile) && item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="p-4">
          <div
            onClick={() => setShowProfileModal(true)}
            className={`
              flex items-center justify-center py-2 px-4 rounded
              text-gray-300 border border-gray-300
              hover:bg-gray-200 hover:text-gray-900 transition-colors
              cursor-pointer
            `}
          >
            {sidebarOpen || isMobile ? (
              <>
                <User size={18} className="mr-2" />
                <span>Profile</span>
              </>
            ) : (
              <User size={18} />
            )}
          </div>
        </div>
      </aside>

      {showProfileModal && (
        <ProfileModal onClose={() => setShowProfileModal(false)} />
      )}
    </>
  );
}
