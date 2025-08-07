"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Toolbar from "./Toolbar";
import UsersPanel from "./UsersPanel";
import ShareDialog from "./ShareDialog";
import CanvasBoard from "./CanvasBoard";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import {
  Delete,
  Download,
  Lock,
  RemoveFormatting,
  Share,
  Share2,
  Users,
} from "lucide-react";

export interface Point {
  x: number;
  y: number;
}
export interface Element {
  id?: string;
  type: string;
  points: Point[];
  color: string;
  strokeWidth: number;
  fill?: boolean;
  text?: string;
  timestamp: number;
  userId: string;
}
export interface Board {
  createdAt: any;
  id: string;
  name: string;
  adminId: string;
  shareToken: string;
  permissions: {
    editors: string[];
  };
}

const DOMAIN_URL = "https://client.unknownvps.eu.org/board";

// Helper function to generate unique anonymous ID (client-side only)
const generateAnonymousId = () => {
  if (typeof window === "undefined") return "anonymous_temp";

  const stored = localStorage.getItem("anonymousUserId");
  if (stored) return stored;

  const newId = `anonymous_${Math.random().toString(36).slice(2, 11)}_${Date.now()}`;
  localStorage.setItem("anonymousUserId", newId);
  return newId;
};

// Helper function to generate anonymous name (client-side only)
const generateAnonymousName = () => {
  if (typeof window === "undefined") return "Anonymous User";

  const stored = localStorage.getItem("anonymousUserName");
  if (stored) return stored;

  const adjectives = [
    "Quick",
    "Bright",
    "Cool",
    "Swift",
    "Smart",
    "Bold",
    "Calm",
    "Kind",
  ];
  const animals = [
    "Fox",
    "Wolf",
    "Bear",
    "Lion",
    "Eagle",
    "Tiger",
    "Shark",
    "Hawk",
  ];
  const name = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${animals[Math.floor(Math.random() * animals.length)]}`;
  localStorage.setItem("anonymousUserName", name);
  return name;
};

const WhiteboardPage: React.FC = () => {
  const { data: session } = useSession();
  const [isClient, setIsClient] = useState(false);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const cleanupRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize client-side state
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Use Firebase user ID for all operations
  const currentUserId =
    session?.user?.email ||
    (isClient ? generateAnonymousId() : "anonymous_temp");
  const currentUserName =
    session?.user?.name ||
    (isClient ? generateAnonymousName() : "Anonymous User");
  const isAnonymous = !session?.user?.email;

  const [boardId, setBoardId] = useState("");
  const [board, setBoard] = useState<Board | null>(null);
  const [elements, setElements] = useState<Element[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [cursors, setCursors] = useState<Record<string, Point>>({});
  const [currentTool, setCurrentTool] = useState("pen");
  const [strokeColor, setStrokeColor] = useState("#ffffff");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [fill, setFill] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [showShare, setShowShare] = useState(false);

  // Permissions
  const isAdmin = board?.adminId === currentUserId;
  const isEditor =
    isAdmin || board?.permissions?.editors?.includes(currentUserId);

  // Initialization
  useEffect(() => {
    if (!currentUserId || !db || !isClient) return;
    const urlParams = new URLSearchParams(window.location.search);
    const shareToken = urlParams.get("share");
    const existingBoardId = urlParams.get("board");
    if (shareToken) joinBoardByToken(shareToken);
    else if (existingBoardId) setBoardId(existingBoardId);
    else if (!isAnonymous) createBoard(); // Only logged-in users can create boards
    // eslint-disable-next-line
  }, [currentUserId, isClient]);

  // User presence management with heartbeat
  useEffect(() => {
    if (!boardId || !currentUserId || !db) return;

    // Clear any existing intervals
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
    }

    // Set user as online when joining
    const setUserOnline = async () => {
      try {
        await setDoc(doc(db, "boards", boardId, "users", currentUserId), {
          name: currentUserName,
          color: `hsl(${Math.random() * 360}, 70%, 55%)`,
          isOnline: true,
          isAnonymous: isAnonymous,
          joinedAt: serverTimestamp(),
          lastSeen: serverTimestamp(),
        });
      } catch (error) {
        console.error("Error setting user online:", error);
      }
    };

    // Set user as offline
    const setUserOffline = async () => {
      try {
        await setDoc(
          doc(db, "boards", boardId, "users", currentUserId),
          {
            isOnline: false,
            lastSeen: serverTimestamp(),
          },
          { merge: true },
        );
      } catch (error) {
        console.error("Error setting user offline:", error);
      }
    };

    setUserOnline();

    // Start heartbeat - update lastSeen every 15 seconds (more frequent)
    heartbeatRef.current = setInterval(async () => {
      try {
        await setDoc(
          doc(db, "boards", boardId, "users", currentUserId),
          {
            lastSeen: serverTimestamp(),
            isOnline: true, // Ensure online status is maintained
          },
          { merge: true },
        );
      } catch (error) {
        console.error("Heartbeat error:", error);
      }
    }, 30000);

    // Cleanup function
    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
      setUserOffline();
    };
  }, [boardId, currentUserId, currentUserName, isAnonymous]);

  // Cleanup offline users based on heartbeat
  useEffect(() => {
    if (!boardId || !db) return;

    const cleanupOfflineUsers = async () => {
      try {
        const usersSnapshot = await getDocs(
          collection(db, "boards", boardId, "users"),
        );
        const batch = writeBatch(db);
        const now = Date.now();
        let hasUpdates = false;

        usersSnapshot.docs.forEach((userDoc) => {
          const userData = userDoc.data();
          // Skip if no lastSeen or user is already offline
          if (!userData.lastSeen || !userData.isOnline) return;

          try {
            const lastSeen = userData.lastSeen.toDate().getTime();

            // Mark as offline if no heartbeat for 2 minutes (4 missed heartbeats)
            if (now - lastSeen > 120000) {
              batch.update(userDoc.ref, { isOnline: false });
              hasUpdates = true;
            }
          } catch (error) {
            console.error("Error processing user timestamp:", error);
          }
        });

        if (hasUpdates) {
          await batch.commit();
        }
      } catch (error) {
        console.error("Error cleaning up offline users:", error);
      }
    };

    // Run cleanup every 20 seconds
    cleanupRef.current = setInterval(cleanupOfflineUsers, 20000);

    return () => {
      if (cleanupRef.current) {
        clearInterval(cleanupRef.current);
        cleanupRef.current = null;
      }
    };
  }, [boardId]);

  useEffect(() => {
    if (!boardId || !db) return;
    const elementsUnsubscribe = onSnapshot(
      collection(db, "boards", boardId, "elements"),
      (snapshot) => {
        const newElements: Element[] = [];
        snapshot.forEach((doc) => {
          newElements.push({ id: doc.id, ...doc.data() } as Element);
        });
        newElements.sort((a, b) => a.timestamp - b.timestamp);
        setElements(newElements);
      },
    );
    const cursorsUnsubscribe = onSnapshot(
      collection(db, "boards", boardId, "cursors"),
      (snapshot) => {
        const newCursors: Record<string, Point> = {};
        snapshot.forEach((doc) => {
          if (doc.id !== currentUserId) {
            const data = doc.data();
            newCursors[doc.id] = { x: data.x, y: data.y };
          }
        });
        setCursors(newCursors);
      },
    );
    const usersUnsubscribe = onSnapshot(
      query(
        collection(db, "boards", boardId, "users"),
        where("isOnline", "==", true),
      ),
      (snapshot) => {
        const newUsers: any[] = [];
        snapshot.forEach((doc) => {
          newUsers.push({ id: doc.id, ...doc.data() });
        });
        setUsers(newUsers);
      },
    );
    const boardUnsubscribe = onSnapshot(
      doc(db, "boards", boardId),
      (docSnap) => {
        if (docSnap.exists()) {
          setBoard({ id: docSnap.id, ...docSnap.data() } as Board);
        }
      },
    );
    return () => {
      elementsUnsubscribe();
      cursorsUnsubscribe();
      usersUnsubscribe();
      boardUnsubscribe();
    };
    // eslint-disable-next-line
  }, [boardId, currentUserId]);

  const createBoard = async () => {
    if (!db || !currentUserId || isAnonymous) return;
    const newBoard = {
      name: "New Whiteboard",
      adminId: currentUserId,
      shareToken: Math.random().toString(36).slice(2, 11),
      createdAt: serverTimestamp(),
      permissions: { editors: [currentUserId] },
    };
    const ref = await addDoc(collection(db, "boards"), newBoard);
    setBoardId(ref.id);
    setBoard({ ...newBoard, id: ref.id } as Board);
  };

  const joinBoardByToken = async (token: string) => {
    if (!db) return;
    const q = query(collection(db, "boards"), where("shareToken", "==", token));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const boardDoc = snapshot.docs[0];
      setBoardId(boardDoc.id);
      setBoard({ id: boardDoc.id, ...boardDoc.data() } as Board);
    }
  };

  const clearBoard = async () => {
    if (!db || !boardId) return;
    const batch = writeBatch(db);
    const elementsSnapshot = await getDocs(
      collection(db, "boards", boardId, "elements"),
    );
    elementsSnapshot.docs.forEach((docSnap) => batch.delete(docSnap.ref));
    await batch.commit();
  };

  const exportBoard = () =>
    window.dispatchEvent(new CustomEvent("export-board"));

  const getShareLink = () => `${DOMAIN_URL}?share=${board?.shareToken}`;

  // Show loading state during hydration
  if (!isClient) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  // Show message for anonymous users who try to access without a board
  if (isAnonymous && !boardId) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Join a Whiteboard</h2>
          <p className="mb-4">
            Anonymous users can only join existing whiteboards via share links.
          </p>
          <p className="text-sm text-gray-400">
            Login to create your own whiteboards.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      <div className="bg-black shadow border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">
            {board?.name || "Live Whiteboard"}
          </h1>
          {!isEditor && (
            <div className="flex items-center space-x-1 text-yellow-400 text-sm font-semibold">
              <Lock className="w-5 h-5" />
              <span>View Only</span>
            </div>
          )}
          {isAnonymous && (
            <div className="flex items-center space-x-1 text-blue-400 text-sm">
              <span>Guest User</span>
            </div>
          )}
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span>{users.length} online</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Users
            size={32}
            onClick={() => setShowUsers(!showUsers)}
            className="p-2 hover:bg-gray-800 rounded-lg"
            aria-label="Show Users"
          />
          <Share2
            size={32}
            onClick={() => setShowShare(true)}
            className="p-2 hover:bg-gray-800 rounded-lg"
            aria-label="Share"
          />
          <Download
            size={32}
            onClick={exportBoard}
            className="p-2 hover:bg-gray-800 rounded-lg"
            aria-label="Download"
          />
          {isEditor && (
            <>
              <RemoveFormatting
                size={32}
                onClick={clearBoard}
                className="p-2 hover:bg-red-900 text-red-400 rounded-lg"
                aria-label="Clear Board"
              />
            </>
          )}
        </div>
      </div>
      <div className="flex-1 flex">
        {isEditor && (
          <Toolbar
            currentTool={currentTool}
            setCurrentTool={setCurrentTool}
            strokeColor={strokeColor}
            setStrokeColor={setStrokeColor}
            strokeWidth={strokeWidth}
            setStrokeWidth={setStrokeWidth}
          />
        )}
        <CanvasBoard
          elements={elements}
          users={users}
          cursors={cursors}
          currentTool={isEditor ? currentTool : ""}
          strokeColor={strokeColor}
          strokeWidth={strokeWidth}
          fill={fill}
          setFill={setFill}
          boardId={boardId}
          currentUserId={currentUserId}
          canEdit={isEditor || false}
        />
        {showUsers && (
          <UsersPanel
            users={users}
            board={board}
            setBoard={setBoard}
            isAdmin={isAdmin}
          />
        )}
      </div>
      {showShare && (
        <ShareDialog
          shareLink={getShareLink()}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
};

export default WhiteboardPage;
