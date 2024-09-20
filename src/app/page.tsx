'use server'
import Login from '@/components/login';
import { redirect } from 'next/navigation';
import { auth } from '../../auth';
import { makeRequest } from '@/functions/api/makeRequest';
import LoadingComponent from '@/components/loading';

export default async function Index() {
  const session = await auth();
  if (session) {
    const email = session.user?.email
    let user = await makeRequest('GET', process.env.API_ENDPOINT + '/users/info/' + email)
    if (!user) <LoadingComponent />
    try {
      if (user && user.status === 404) {
        const res = await makeRequest('POST', process.env.API_ENDPOINT + '/users/create', { email, method: "Google" })
        if (!res || !(res.status === 400)) console.error(res ? res.message : "Server Error");
        
        if (res && res.status === 200) {
          console.log("Success")
        }
      }
    } catch (e) {
      console.log(e)
      
      return <Login />
    }
   return (
      redirect('/dashboard')
   )
  } else {
    return <Login />;
  }
}