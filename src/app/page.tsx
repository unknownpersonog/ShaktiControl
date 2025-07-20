"use server";
import Login from "@/components/login";
import { redirect } from "next/navigation";
import { auth } from "../lib/auth";

export default async function Index() {
  const session = await auth();
  if (session) {
    return redirect("/dashboard");
  } else {
    return <Login />;
  }
}
