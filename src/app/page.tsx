'use server'
import Login from '@/components/login';
import { redirect } from 'next/navigation';
import { auth } from '../../auth';
import makeRequest from '@/functions/api/makeRequest';

export default async function Index() {
  const session = await auth();
  if (session) {
    const email = session.user?.email
    let user = await makeRequest('GET', '/users/info/' + email)

    try {
      if (user && user.response.status === 404) {
        const res = await makeRequest('POST', '/users/create', { email, method: "Google" })
        if (!res || !(res.response.status === 400)) console.error(res ? res.message : "Server Error");
        
        if (res && res.response.status === 200) {
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