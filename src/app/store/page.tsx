"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useApiInfo } from "../context/ApiInfoProvider";
import LoadingComponent from "@/components/loading";
import Sidebar from "@/components/sidebar";
import Alert from "@/components/ui/alert";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FeatureBox from "@/components/FeatureBox";
import { redirect } from "next/navigation";

export default function StorePage() {
  const { data: session, status } = useSession(); // Session for authentication
  const { userData, loading: userDataLoading, error } = useApiInfo(); // userData from context
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle unauthenticated users
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
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}



      />

      <main className={`flex-1 p-4 md:p-6 ${isMobile ? "pt-20" : ""}`}>
        <Header page="Store" />
        <Alert
          title="Store"
          description="Spend your service coins for special bonuses."
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