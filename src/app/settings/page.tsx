
"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useApiInfo } from "@/context/ApiInfoProvider";
import LoadingComponent from "@/components/loading";
import Sidebar from "@/components/sidebar";
import Alert from "@/components/ui/alert";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileSettings from "@/components/settings/ProfileSettings";
import SecuritySettings from "@/components/settings/SecuritySettings";
import { redirect } from "next/navigation";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const { userData, loading: userDataLoading, error } = useApiInfo();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (status === "unauthenticated") {
    redirect("/");
  }

  if (status === "loading" || userDataLoading) {
    return <LoadingComponent />;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="flex min-h-screen text-white relative">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className={`flex-1 p-4 md:p-6 ${isMobile ? "pt-20" : ""}`}>
        <Header page="Settings" />
        <Alert
          title="Settings"
          description="Customize your account preferences and security settings."
          variant="default"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <ProfileSettings />
          <SecuritySettings />
        </div>
        <Footer />
      </main>
    </div>
  );
}
