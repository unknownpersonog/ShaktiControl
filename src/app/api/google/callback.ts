import { google } from "googleapis";
import type { NextApiRequest, NextApiResponse } from "next";

const oauth2Client = new google.auth.OAuth2(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXTAUTH_URL}/api/google/callback`
);

export default async function callback(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;

  if (!code) return res.status(400).json({ error: "Missing code parameter" });

  try {
    const { tokens } = await oauth2Client.getToken(code as string);
    oauth2Client.setCredentials(tokens);

    // Redirect the user back to the dashboard after authentication
    res.redirect("/dashboard");
  } catch (error) {
    res.status(500).json({ error: "Error retrieving access token" });
  }
}
