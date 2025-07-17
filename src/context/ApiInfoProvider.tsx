"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { makeRequest } from "@/functions/api/makeRequest";
import { useSession } from "next-auth/react";
import LoadingComponent from "@/components/loading";

interface ApiInfoContextType {
  userData: any | null;
  loading: boolean; // Indicates if data is being fetched
  error: string | null;
  refreshUserData?: () => Promise<void>; // Optional refresh function
}

const ApiInfoContext = createContext<ApiInfoContextType | null>(null);

export const ApiInfoProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [userData, setUserData] = useState<any | null>(null); // Cached user data
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Track loading state
  const { status, data: session } = useSession();

  // Function to fetch user data
  const fetchUserData = async () => {
    if (session?.user) {
      setLoading(true);
      try {
        const data = await makeRequest("GET", "/api/uvapi/users/info");
        setUserData(data); // Cache data
        setError(null); // Reset error if successful
      } catch (err) {
        setError("Failed to fetch user data");
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  // Refresh user data manually (optional)
  const refreshUserData = async () => {
    await fetchUserData();
  };

  // Fetch user data only once when session changes
  useEffect(() => {
    if (status === "authenticated" && !userData) {
      fetchUserData();
    } else if (status !== "authenticated") {
      setUserData(null); // Clear cached data if unauthenticated
    }
  }, [status, session]); // Re-run when session changes

  return (
    <ApiInfoContext.Provider
      value={{ userData, loading, error, refreshUserData }}
    >
      {children}
    </ApiInfoContext.Provider>
  );
};

export const useApiInfo = () => {
  const context = useContext(ApiInfoContext);
  if (!context) {
    throw new Error("useApiInfo must be used within ApiInfoProvider");
  }
  return context;
};
