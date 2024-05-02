
import Dashboard from '@/components/dashboard';
import Login from '@/components/login';
import { redirect } from 'next/navigation';
import { auth } from '../../auth';

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