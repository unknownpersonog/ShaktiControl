import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/firebase";
import {
  doc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const uid = session.user?.email;
  if (!uid) {
    return NextResponse.json({ error: "Missing user identifier" }, { status: 400 });
  }

  try {
    const logsRef = collection(doc(db, "users", uid), "logs");
    const q = query(logsRef, orderBy("timestamp", "desc"), limit(3));
    const snapshot = await getDocs(q);

    const logs = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        event: data.event,
        extraData: data.extraData || {},
        timestamp: data.timestamp?.toDate().toISOString() || null,
      };
    });

    return NextResponse.json({ logs }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch logs:", error);
    return NextResponse.json({ error: "Error fetching logs" }, { status: 500 });
  }
}