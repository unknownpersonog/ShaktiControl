"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { redirect, usePathname } from "next/navigation";
import { makeRequest } from "@/functions/api/makeRequest";
import { User, Bell, HardDrive, Cpu, MemoryStick } from "lucide-react";
import LoadingComponent from "@/components/loading";
import Sidebar from "@/components/sidebar";
import Alert from "@/components/ui/alert";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FeatureBox from "@/components/FeatureBox";

export default function SettingsPage() {
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { status, data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/");
    },
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user) {
        try {
          const data = await makeRequest("GET", "/api/uvapi/users/info");
          setUserData(data);
        } catch (error) {
          console.error("Failed to fetch user data:", error);
          setUserData(null);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [session]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (status === "loading" || loading) {
    return <LoadingComponent />;
  }

  if (session == null || session.user == null) {
    return <p>Internal Server Error</p>;
  }

  const path = usePathname();

  if (path !== "/settings") {
    return null; // or redirect to the correct page
  }

  return (
    <div className="flex min-h-screen text-white relative">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isAdmin={userData?.data?.admin === "true"}
        session={session.user}
        userData={userData}
      />

      <main className={`flex-1 p-4 md:p-6 ${isMobile ? "pt-20" : ""}`}>
        <Header page="Settings" />

        <Alert
          title="Settings"
          description="You can change things according to your preferences."
          variant="default"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-0">
          <FeatureBox />
        </div>

        <Footer />
      </main>
    </div>
  );
}
