"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useApiInfo } from "@/context/ApiInfoProvider";
import LoadingComponent from "@/components/loading";
import { isServiceEnabledByUser } from "@/utils/serviceCheck";
import ServiceDisabled from "@/components/ui/serviceDisabled";
import WhiteboardPage from "@/components/board/WhiteboardPage";

export default function BoardPage() {
  const { data: session, status } = useSession();
  const { userData, loading: userDataLoading, error } = useApiInfo();
  const [serviceState, setServiceState] = useState<{
    loading: boolean;
    enabled: boolean;
    checked: boolean;
  }>({ loading: false, enabled: true, checked: false });

  useEffect(() => {
    const checkService = async () => {
      // Skip if already checked or still loading auth
      if (serviceState.checked || status === "loading" || userDataLoading) {
        return;
      }

      // Only check service if user is authenticated
      if (status === "authenticated") {
        try {
          setServiceState((prev) => ({ ...prev, loading: true }));
          const enabled = await isServiceEnabledByUser("boards");
          setServiceState({ loading: false, enabled, checked: true });
        } catch (error) {
          console.error("Service check failed:", error);
          setServiceState({ loading: false, enabled: false, checked: true });
        }
      } else if (status === "unauthenticated") {
        // Anonymous users can access the service immediately
        setServiceState({ loading: false, enabled: true, checked: true });
      }
    };

    checkService();
  }, [status, userDataLoading, serviceState.checked]);

  // Show loading only when necessary
  if (status === "loading") {
    return <LoadingComponent />;
  }

  // Show service loading only for authenticated users
  if (status === "authenticated" && serviceState.loading) {
    return <LoadingComponent />;
  }

  // If authenticated user but service is disabled
  if (
    status === "authenticated" &&
    serviceState.checked &&
    !serviceState.enabled
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <ServiceDisabled serviceName="Boards" serviceKey="boards" />
      </div>
    );
  }

  // For anonymous users or authenticated users with service enabled
  return <WhiteboardPage />;
}
