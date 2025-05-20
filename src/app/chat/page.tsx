
"use client";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useApiInfo } from "@/context/ApiInfoProvider";
import LoadingComponent from "@/components/loading";
import Sidebar from "@/components/sidebar";
import ChatInterface from "@/components/chat/ChatInterface";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { redirect } from "next/navigation";
import Alert from "@/components/ui/alert";

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session, status } = useSession();
  const { userData, loading: userDataLoading, error } = useApiInfo();

  if (status === "unauthenticated") {
    redirect("/");
  }

  if (status === "loading" || userDataLoading) {
    return <LoadingComponent />;
  }

  return (
    <div className="flex min-h-screen text-white">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="flex-1 p-4 md:p-6">
        <Header page="AI Chat" />
        <ChatInterface />
        <Footer />
      </main>
    </div>
  );
}
