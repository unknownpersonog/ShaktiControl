"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { redirect, usePathname } from "next/navigation";
import { useApiInfo } from "@/context/ApiInfoProvider";
import { makeRequest } from "@/functions/api/makeRequest";
import { User, Bell, HardDrive, Cpu, MemoryStick } from "lucide-react";
import LoadingComponent from "@/components/loading";
import Sidebar from "@/components/sidebar";
import Alert from "@/components/ui/alert";
import ServerStatusCard from "@/components/ServerStatusCard";
import Header from "@/components/Header";
import ResourceCard from "@/components/ResourceCard";
import Footer from "@/components/Footer";
import OSServicesList from "@/components/OSServicesList";
import ActivityList from "@/components/ActivityList";
import FeatureBox from "@/components/FeatureBox";

// Constants
const borderColors = [
  "border-pink-500",
  "border-purple-500",
  "border-indigo-500",
  "border-blue-500",
  "border-cyan-500",
  "border-teal-500",
];

const allocatedResources = [
  { name: "RAM", icon: MemoryStick, value: "Undefined" },
  { name: "CPU", icon: Cpu, value: "Undefined" },
  { name: "Disk", icon: HardDrive, value: "Undefined" },
];

const recentActivities = [
  { action: "Created new VPS", time: "2 hours ago" },
  { action: "Updated project settings", time: "Yesterday" },
  { action: "Deployed new application", time: "3 days ago" },
];

const availableOS = [
  {
    name: "Ubuntu",
    description: "Easy to use Linux Distribution",
    icon: "ubuntu.png",
  },
  {
    name: "Debian",
    description: "Stable Linux Distribution",
    icon: "debian.png",
  },
  {
    name: "Minecraft",
    description: "Popular sandbox game server",
    icon: "minecraft.png",
  },
];

export default function DashboardPage() {
  const { status, data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/");
    },
  });
  const { userData, loading: userDataLoading, error } = useApiInfo(); // Use context

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [serverStatus, setServerStatus] = useState({ API: "Offline" });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const fetchServerStatus = async () => {
      try {
        const response = await makeRequest("GET", "/api/uvapi/ping");
        if (response?.status === 200) {
          setServerStatus((prevStatus) => ({ ...prevStatus, API: "Online" }));
        }
      } catch (error) {
        console.error("Error fetching server status:", error);
      }
    };

    fetchServerStatus();
  }, []);

  if (userDataLoading) {
    return <LoadingComponent />;
  }


  const path = usePathname();

  if (path !== "/dashboard") {
    return null; // or redirect to the correct page
  }

  return (
    <div className="flex min-h-screen text-white relative">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className={`flex-1 p-4 md:p-6 ${isMobile ? "pt-20" : ""}`}>
        <Header page="Dashboard" />

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
