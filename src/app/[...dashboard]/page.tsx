'use client'

import Dashboard from '@/components/dashboard'
import LoadingComponent from '@/components/loading'
import { useSession } from 'next-auth/react'
import { redirect, usePathname } from 'next/navigation'

export default function Page() {
      const { status, data: session } = useSession({
            required: true,
            onUnauthenticated() {
              redirect('/');
            },
          })
          if (status === "loading") {
            return <LoadingComponent />
          }
          if (session == null || session.user == null) { return <p>Internal Server Error</p>}
      const path  = usePathname()
      if (path === "/dashboard") return <Dashboard {...session.user}/>
      
      else return <div className="text-white"> 404 Unknown Page: {path}</div>
}
