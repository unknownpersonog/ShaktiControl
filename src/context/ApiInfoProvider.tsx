"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { makeRequest } from "@/functions/api/makeRequest";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

interface ApiInfoContextType {
  userData: any | null;
  loading: boolean;
  error: string | null;
}

const ApiInfoContext = createContext<ApiInfoContextType | null>(null);

export const ApiInfoProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { status, data: session } = useSession();

  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user) {
        try {
          const data = await makeRequest("GET", "/api/uvapi/users/info");
          setUserData(data);
        } catch (err) {
          setError("Failed to fetch user data");
          console.error("Error fetching user data:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false); // Stop loading if no session exists
      }
    };

    if (status === "authenticated") {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [session, status]);

  return (
    <ApiInfoContext.Provider value={{ userData, loading, error }}>
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
