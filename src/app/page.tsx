"use server";
import Login from "@/components/login";
import { redirect } from "next/navigation";
import { auth } from "../../auth";
import { makeRequest } from "@/functions/api/makeRequest";
import LoadingComponent from "@/components/loading";

export default async function Index() {
  const session = await auth();
  if (session) {
    const email = session.user?.email;
    const method = (session?.user?.image || "").includes("discord") ? "Discord" : "Google";
    let user = await makeRequest(
      "GET",
      process.env.API_ENDPOINT + "/users/info/" + email,
    );
    if (!user) <LoadingComponent />;
    try {
      if (user && user.status === 404) {
        const res = await makeRequest(
          "POST",
          process.env.API_ENDPOINT + "/users/create",
          { email, method: method },
        );
        if (!res || !(res.status === 400))
          console.error(res ? res.message : "Server Error");

        if (res && res.status === 200) {
          console.log("Success");
        }
        const notifId = await makeRequest("POST", process.env.API_ENDPOINT + "/notifs/create-otn", {
          title: "Welcome to ShaktiControl",
          message: "You have successfully logged in to ShaktiControl.",
          level: 1
        });

        if (!notifId || notifId.status === 404) {
          console.error(notifId ? notifId.message : "Server Error");
        } else {
          console.log("Notification created successfully with ID:", notifId.data.notif.id);
          await makeRequest("POST", process.env.API_ENDPOINT + "/notifs/assign", {
            notificationId: notifId.data.notif.id,
            emails: [email],
          });
        }
      }
    } catch (e) {
      console.log(e);

      return <Login />;
    }
    return redirect("/dashboard");
  } else {
    return <Login />;
  }
}
