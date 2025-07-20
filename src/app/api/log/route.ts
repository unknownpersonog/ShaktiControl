"use server";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/firebase";
import {
  doc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { event, extraData } = await req.json();
  const uid = session.user?.email;
  if (!uid) {
    return NextResponse.json({ error: "Missing user identifier" }, { status: 400 });
  }

  const userRef = doc(db, "users", uid);
  const logsCollection = collection(userRef, "logs"); // subcollection

  const logEntry = {
    event,
    extraData: extraData || {},
    timestamp: serverTimestamp(),
  };

  try {
    // Ensure user document exists
    await setDoc(
      userRef,
      {
        email: session.user?.email || null,
        name: session.user?.name || null,
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );

    // Create new log in subcollection
    await addDoc(logsCollection, logEntry);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Log error:", error);
    return NextResponse.json({ error: "Failed to add log" }, { status: 500 });
  }
}