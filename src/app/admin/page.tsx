"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useApiInfo } from "@/context/ApiInfoProvider";
import LoadingComponent from "@/components/loading";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/adminDash";
import NotFoundPage from "@/components/404";

export default function ServersPage() {
  const { data: session, status } = useSession();
  const { userData, loading: userDataLoading, error } = useApiInfo();

  // Handle unauthenticated users
  if (status === "unauthenticated") {
    redirect("/");
  }

  if (status === "loading" || userDataLoading) {
    return <LoadingComponent />;
  }
  if (session == null || session.user == null) {
    return <p>Internal Server Error</p>;
  }
  if (error) {
    return <p>Error: {error}</p>;
  }
  if (userData?.data?.admin) {
    return <AdminDashboard userData={userData} session={session.user} />;
  }
  return <NotFoundPage />;
}
