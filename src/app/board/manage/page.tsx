"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { Board } from "@/components/board/WhiteboardPage";
import LoadingComponent from "@/components/loading";
import StatsSection from "@/components/board/manage/StatsSection";
import BoardsGrid from "@/components/board/manage/BoardsGrid";
import { useApiInfo } from "@/context/ApiInfoProvider";
import Header from "@/components/Header";
import Sidebar from "@/components/sidebar";
import Alert from "@/components/ui/alert";
import { isServiceEnabledByUser } from "@/utils/serviceCheck";
import ServiceDisabled from "@/components/ui/serviceDisabled";

export default function BoardManagement() {
  const { data: session, status } = useSession();
  const { userData, loading: userDataLoading } = useApiInfo();
  const router = useRouter();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [serviceState, setServiceState] = useState<{
    loading: boolean;
    enabled: boolean;
  }>({ loading: true, enabled: false });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const checkService = async () => {
      try {
        const enabled = await isServiceEnabledByUser("boards");
        setServiceState({ loading: false, enabled });
      } catch (error) {
        console.error("Service check failed:", error);
        setServiceState({ loading: false, enabled: false });
      }
    };

    if (status === "authenticated" && !userDataLoading) {
      checkService();
    }
  }, [status, userDataLoading]);

  useEffect(() => {
    if (serviceState.enabled && session?.user?.email) {
      fetchUserBoards();
    }
  }, [session, serviceState.enabled]);

  // Handle unauthenticated users
  if (status === "unauthenticated") {
    redirect("/");
  }

  if (status === "loading" || userDataLoading || serviceState.loading) {
    return <LoadingComponent />;
  }

  const fetchUserBoards = async () => {
    if (!session?.user?.email) return;

    try {
      const q = query(
        collection(db, "boards"),
        where("adminId", "==", session.user.email),
      );
      const snapshot = await getDocs(q);
      const userBoards = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Board[];

      setBoards(userBoards);
    } catch (error) {
      console.error("Error fetching boards:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteBoard = async (boardId: string) => {
    if (!confirm("Are you sure you want to delete this board?")) return;

    try {
      await deleteDoc(doc(db, "boards", boardId));
      setBoards(boards.filter((board) => board.id !== boardId));
    } catch (error) {
      console.error("Error deleting board:", error);
    }
  };

  const renameBoard = async (boardId: string, newName: string) => {
    try {
      await updateDoc(doc(db, "boards", boardId), { name: newName });
      setBoards(
        boards.map((board) =>
          board.id === boardId ? { ...board, name: newName } : board,
        ),
      );
    } catch (error) {
      console.error("Error renaming board:", error);
    }
  };

  const handleOpenBoard = (boardId: string) => {
    router.push(`/board?board=${boardId}`);
  };

  const handleCreateBoard = () => {
    router.push("/board");
  };

  if (loading && serviceState.enabled) {
    return <LoadingComponent />;
  }

  const showBoardManagement = serviceState.enabled;

  return (
    <div className="flex min-h-screen text-white relative">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className={`flex-1 p-4 md:p-6 ${isMobile ? "pt-20" : ""}`}>
        <Header page="Board Management" />

        {showBoardManagement ? (
          <>
            <Alert
              title="Board Management"
              description="Manage your whiteboards and create new ones."
              variant="default"
            />

            <div className="max-w-7xl mx-auto">
              {/* Stats Cards Row */}
              <StatsSection totalBoards={boards.length} />

              {/* Boards Section */}
              <div className="mb-6">
                <h2 className="text-xl font-medium text-white mb-4">
                  My Whiteboards
                </h2>

                <BoardsGrid
                  boards={boards}
                  onDeleteBoard={deleteBoard}
                  onRenameBoard={renameBoard}
                  onOpenBoard={handleOpenBoard}
                  onCreateBoard={handleCreateBoard}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <ServiceDisabled serviceName="Boards" serviceKey="boards" />
          </div>
        )}
      </main>
    </div>
  );
}
