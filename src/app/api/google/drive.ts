import { google } from "googleapis";
import type { NextApiRequest, NextApiResponse } from "next";
import { auth } from "../../../../auth";

// Define DriveFile type with optional fields to handle undefined values
type DriveFile = {
  id: string;
  name: string;
};

const oauth2Client = new google.auth.OAuth2(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXTAUTH_URL}/api/google/callback`
);

export default async function drive(req: NextApiRequest, res: NextApiResponse) {
  const session = await auth;

  // Check if session is available
  if (!session) {
    return res.status(401).json({ error: "Not Authenticated" });
  }

  // Get the access token from the session (if configured correctly in NextAuth.js)
  const accessToken = session?.accessToken as string | undefined;

  if (!accessToken) {
    return res.status(401).json({ error: "No access token found" });
  }

  oauth2Client.setCredentials({ access_token: accessToken });

  const drive = google.drive({ version: "v3", auth: oauth2Client });

  switch (req.method) {
    case "GET":
      try {
        const about = await drive.about.get({ fields: "storageQuota" });
        return res.status(200).json(about.data.storageQuota);
      } catch (error) {
        console.error("Error fetching storage info:", error);
        return res.status(500).json({ error: "Error fetching storage info" });
      }

    case "POST":
      const folderName = "UV-StudyMaterial";

      try {
        // Search for the folder by name
        const folderResponse = await drive.files.list({
          q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder'`,
          fields: "files(id, name)",
        });

        const files = folderResponse.data.files;

        if (!files || files.length === 0) {
          // If no folder exists, create one
          const createResponse = await drive.files.create({
            requestBody: {
              name: folderName,
              mimeType: "application/vnd.google-apps.folder",
            },
            fields: "id, name",
          });

          const createdFolder = createResponse.data;

          if (!createdFolder || !createdFolder.id) {
            return res.status(500).json({ error: "Failed to create folder" });
          }

          // Ensure TypeScript safety by checking createdFolder.id is a valid string
          return res.status(200).json({ folderId: createdFolder.id });
        } else {
          // Folder already exists, return its ID
          const existingFolder = files[0];
          if (!existingFolder.id) {
            return res.status(500).json({ error: "Existing folder has no ID" });
          }
          return res.status(200).json({ folderId: existingFolder.id });
        }
      } catch (error) {
        console.error("Error creating or finding folder:", error);
        return res.status(500).json({ error: "Error creating or finding folder" });
      }

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
