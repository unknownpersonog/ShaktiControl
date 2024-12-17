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
  Users,
  Briefcase,
  Globe,
  X,
  Shield,
  Menu,
  User,
  Coins,
  Store,
} from "lucide-react";
import ProfileModal from "@/components/ui/ProfileModal"; // Import ProfileModal
import { useApiInfo } from "@/app/context/ApiInfoProvider";

const sidebarItems = [
  { name: "Dashboard", icon: Home },
  { name: "Servers", icon: Server },
  { name: "Earn", icon: Coins },
  { name: "Store", icon: Store },
  { name: "Calendar", icon: Calendar },
  { name: "Users", icon: Users },
  { name: "Projects", icon: Briefcase },
  { name: "Global Network", icon: Globe },
  { name: "Settings", icon: Settings },
];

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;





}

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,



}: SidebarProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false); // State to control modal visibility
	const { userData, loading: userDataLoading, error } = useApiInfo(); // userData from context
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

  return (
    <>
      {/* Mobile menu button */}
      {isMobile && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-4 left-4 z-50 p-2 bg-purple-600 rounded-full text-white"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`
          ${isMobile ? (sidebarOpen ? "translate-x-0" : "-translate-x-full") : ""}
          ${isMobile ? "fixed inset-y-0 left-0 z-40" : "relative"}
          transition-all duration-300 ease-in-out
          bg-opacity-80 backdrop-blur-lg border-r border-purple-500
          flex flex-col
          ${isMobile ? "w-64" : sidebarOpen ? "w-64" : "w-24"}
          overflow-y-auto
        `}
      >
        <div className="p-6 flex-grow">
          <div className="flex justify-between items-center mb-8">
            {(sidebarOpen || isMobile) && (
              <h2 className="text-2xl font-bold text-purple-300">UnknownVPS</h2>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white p-1 rounded-full hover:bg-purple-700 transition-colors"
            >
              {sidebarOpen ? (
                <ChevronLeft size={24} />
              ) : (
                <ChevronRight size={24} />
              )}
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
                      ${!sidebarOpen && !isMobile && "justify-center"}
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
            onClick={() => setShowProfileModal(true)} // Open modal on click
            className={`
              flex items-center justify-center py-2 px-4 rounded
              text-purple-300 border border-purple-500
              hover:bg-purple-700 hover:text-white transition-colors
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
        <ProfileModal


          onClose={() => setShowProfileModal(false)}
        />
      )}
    </>
  );
}
