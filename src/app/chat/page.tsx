"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useApiInfo } from "@/context/ApiInfoProvider";
import LoadingComponent from "@/components/loading";
import Sidebar from "@/components/sidebar";
import ChatInterface from "@/components/chat/ChatInterface";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { redirect } from "next/navigation";
import { isServiceEnabledByUser } from "@/utils/serviceCheck";
import ServiceDisabled from "@/components/ui/serviceDisabled";

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session, status } = useSession();
  const { userData, loading: userDataLoading } = useApiInfo();
  const [serviceState, setServiceState] = useState<{
    loading: boolean;
    enabled: boolean;
  }>({ loading: true, enabled: false });

  useEffect(() => {
    const checkService = async () => {
      try {
        const enabled = await isServiceEnabledByUser("ai_expansion");
        setServiceState({ loading: false, enabled });
      } catch (error) {
        console.error("Service check failed:", error);
        setServiceState({ loading: false, enabled: false });
      }
    };

    if (status === "authenticated" && !userDataLoading) {
      checkService();
    }
  }, [status, userDataLoading]);

  if (status === "unauthenticated") {
    redirect("/");
  }

  if (status === "loading" || userDataLoading || serviceState.loading) {
    return <LoadingComponent />;
  }

  const showChat = serviceState.enabled;

  return (
    <div className="flex min-h-screen text-white">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="flex-1 flex flex-col overflow-scroll p-4 md:p-6">
        <Header page="AI Chat" />

        {showChat ? (
          <ChatInterface />
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <ServiceDisabled 
              serviceName="AI Expansion"
              serviceKey="ai_expansion"
            />
          </div>
        )}

        <Footer />
      </main>
    </div>
  );
}
