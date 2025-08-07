// src/functions/api/loggerServer.ts
import { db } from "@/lib/firebase";
import {
  doc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export async function serverLogEvent(
  uid: string,
  event: string,
  extraData: Record<string, any> = {},
) {
  try {
    if (uid) {
      const userRef = doc(db, "users", uid);
      const logsCollection = collection(userRef, "logs");

      const logEntry = {
        event,
        extraData: extraData || {},
        timestamp: serverTimestamp(),
      };

      await setDoc(
        userRef,
        {
          email: uid,
          createdAt: serverTimestamp(),
        },
        { merge: true },
      );

      await addDoc(logsCollection, logEntry);

      console.log("Event logged to Firestore:", event);
    } else {
      console.error("Missing user identifier for logging");
    }
  } catch (error) {
    console.error("Error logging event to Firestore:", error);
  }
}
