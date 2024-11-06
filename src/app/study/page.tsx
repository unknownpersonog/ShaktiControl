'use client'
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Sidebar from "@/components/sidebar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Alert from "@/components/ui/alert";
import LoadingComponent from "@/components/loading";

// StudyManager Dashboard Component
export default async function StudyManagerPage() {
  const { status, data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/");
    },
  });

  const [loading, setLoading] = useState(true);
  const [driveSpace, setDriveSpace] = useState<any>(null);
  const [folderId, setFolderId] = useState<string | null>(null);

  useEffect(() => {
    const initializeDrive = async () => {
      if (session?.user) {
        try {
          // Fetch Google Drive space info
          const spaceInfo = await fetch("/api/google/drive");
          const space = await spaceInfo.json();
          setDriveSpace(space);

          // Create or get "UV-StudyMaterial" folder
          const folderResponse = await fetch("/api/google/drive", {
            method: "POST",
          });
          const folderData = await folderResponse.json();
          setFolderId(folderData.folderId);
        } catch (error) {
          console.error("Error initializing Google Drive:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    initializeDrive();
  }, [session]);

  if (loading || status === "loading") {
    return <LoadingComponent />;
  }

  return (
    <div className="flex min-h-screen text-white relative">
      <main className="flex-1 p-4 md:p-6">
        <Header page="Study Manager" />

        <Alert
          title="Manage Your Study Material"
          description="Upload files and organize your study material."
          variant="default"
        />

        {driveSpace && (
          <div className="mb-4">
            <p>Total Space: {driveSpace.limit}</p>
            <p>Used Space: {driveSpace.usage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <button onClick={() => alert("Upload file")}>Upload File</button>
          <button onClick={() => alert("Create Folder")}>Create Folder</button>
        </div>

        <Footer />
      </main>
    </div>
  );
}
