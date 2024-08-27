'use client';

import Dashboard from '@/components/dashboard';
import LoadingComponent from '@/components/loading';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect, usePathname } from 'next/navigation';
import { makeRequest } from '@/functions/api/makeRequest';
import AdminDashboard from '@/components/adminDash';
import Servers from '@/components/server';
import ProjectManagement from '@/components/projects';

export default function Page() {
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { status, data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/');
    },
  });

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

  if (status === 'loading' || loading) {
    return <LoadingComponent />;
  }

  if (session == null || session.user == null) {
    return <p>Internal Server Error</p>;
  }

  const path = usePathname();

  if (path === '/dashboard') {
    return <Dashboard userData={userData} session={session.user} />;
  }
  if (path === '/servers') {
    return <Servers />;
  }

  if (path === '/admin' && userData?.data?.admin) {
    return <AdminDashboard userData={userData}/>;
  }

  return <div className="text-white">404 Unknown Page: {path}</div>;
}