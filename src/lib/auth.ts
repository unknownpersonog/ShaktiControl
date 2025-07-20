import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Discord from "next-auth/providers/discord";
import { makeRequest } from "@/functions/api/makeRequest";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google, Discord],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // Check if user exists
      const method = (user?.image || "").includes("discord")
        ? "Discord"
        : "Google";
      const userInfo = await makeRequest(
        "GET",
        process.env.API_ENDPOINT + "/users/info/" + user.email,
      );

      // If user does not exist, create user and send notification
      if (!userInfo || userInfo.status === 404) {
        const res = await makeRequest(
          "POST",
          process.env.API_ENDPOINT + "/users/create",
          { email: user.email, method },
        );
        if (!res || res.status === 400) {
          console.error(res ? res.message : "Server Error");
          return false;
        }

        const notifId = await makeRequest(
          "POST",
          process.env.API_ENDPOINT + "/notifs/create-otn",
          {
            title: "Welcome to ShaktiControl",
            message: "You have successfully signed up on UnknownVPS.",
            level: 1,
          },
        );
        if (notifId && notifId.status !== 404) {
          await makeRequest(
            "POST",
            process.env.API_ENDPOINT + "/notifs/assign",
            {
              notificationId: notifId.data.notif.id,
              emails: [user.email],
            },
          );
        }
      }

      // Allow sign in
      return true;
    },
  },
});