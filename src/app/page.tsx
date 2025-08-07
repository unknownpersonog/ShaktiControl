"use client";
import Login from "@/components/login";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import LoadingComponent from "@/components/loading";

export default function Index() {
  const { data: session, status } = useSession();
  if (status === "loading") {
    return <LoadingComponent />;
  }
  if (session) {
    return redirect("/dashboard");
  } else {
    return <Login />;
  }
}
