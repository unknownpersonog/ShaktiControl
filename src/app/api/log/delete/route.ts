// src/app/api/deleteLogs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth"; // Assuming auth is used for admin check
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";
import type { Session } from "next-auth";

const API_BASE_URL = process.env.API_ENDPOINT;

async function checkAdmin(session: Session): Promise<boolean> {
  const userInfo = await proxyRequest(
    `/users/info/${session.user?.email}`,
    "GET",
    undefined,
    session,
  );
  return userInfo.data.admin === "true";
}

async function proxyRequest(
  url: string,
  method: string,
  body?: any,
  session?: Session,
) {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    method,
    headers: {
      "X-Access-Token": process.env.API_KEY as string,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const result = await response.json();
  return { status: response.status, data: result };
}
export async function POST(req: NextRequest) {
  // Implement authorization check (e.g., admin role)
  const session = await auth();
  // Assuming only admins can delete logs
  if (!session || !checkAdmin) { // You'll need to add an isAdmin property to your session/user
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await req.json(); // Expecting the user ID (email) in the request body

  if (!userId) {
    return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
  }

  try {
    const logsCollectionRef = collection(db, "users", userId, "logs");
    const q = query(logsCollectionRef);

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json({ success: true, message: "No logs found for the user" }, { status: 200 });
    }

    const deletePromises: Promise<void>[] = [];
    querySnapshot.forEach((docSnapshot) => {
      deletePromises.push(deleteDoc(doc(db, "users", userId, "logs", docSnapshot.id)));
    });

    await Promise.all(deletePromises);

    return NextResponse.json({ success: true, message: `Successfully deleted logs for user ${userId}` }, { status: 200 });
  } catch (error) {
    console.error("Error deleting user logs:", error);
    return NextResponse.json({ error: "Failed to delete user logs" }, { status: 500 });
  }
}
