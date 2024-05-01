
import { useUser } from '@auth0/nextjs-auth0/client';
import Dashboard from '@/components/dashboard';
import LoadingComponent from '@/components/loading';
import Login from '@/components/login';
import { redirect } from 'next/navigation';
import { auth } from '../../auth';
import { SessionProvider } from 'next-auth/react';

export default async function Index() {
  const session = await auth();
  if (session) {
   return (
      <Dashboard />
   )
  } else {
  return <Login />;
  }
}