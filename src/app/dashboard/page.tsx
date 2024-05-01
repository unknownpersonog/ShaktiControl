'use client';
import Dashboard from "@/components/dashboard";
import Loading from "@/components/loading";
import { useUser } from '@auth0/nextjs-auth0/client';
export default function Home() {


    return (
        <Dashboard />
    );

}