import type { NextRequest } from "next/server";
import { auth } from "../../../../../auth"; // Adjust the import based on your setup
import type { Session } from "next-auth";

const API_BASE_URL = process.env.API_ENDPOINT;

async function checkAdmin(session: Session): Promise<boolean> {
  const userInfo = await proxyRequest(
    `/users/info/${session.user?.email}`,
    "GET",
    undefined,
    session
  );
  return userInfo.data.admin === "true";
}

async function proxyRequest(
  url: string,
  method: string,
  body?: any,
  session?: Session
) {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    method,
    headers: {
      "X-Access-Token": process.env.API_KEY as string,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const result = await response.json();
  return { status: response.status, data: result };
}

async function handleRequest(req: NextRequest, method: "GET" | "POST" | "PUT") {
  const url = new URL(req.url);
  const session = await auth();

  if (!session || !session.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const discordId = session.user.email;
  let apiUrl = "";
  let requestBody: any = method !== "GET" ? await req.json() : undefined;

  // Ensure email in request body matches session's user email for POST and PUT requests
  if (method === "POST" || method === "PUT") {
    requestBody = {
      ...requestBody,
      email: discordId, // Ensure the email field is included and set to session.user.email
    };
    if (requestBody.email && requestBody.email !== session.user.email) {
      return new Response(JSON.stringify({ error: "Email mismatch" }), {
        status: 400,
      });
    }
  }

  // Routes that do not require admin check
  const userRoutes = {
    "/api/uvapi/ping": "/ping",
    "/api/uvapi/users/info": `/users/info/${discordId}`,
    "/api/uvapi/users/create": "/users/create",
    "/api/uvapi/users/delete": "/users/delete",
    "/api/uvapi/vps/assign": "/vps/assign",
    "/api/uvapi/vps/info": "/vps/info", // Adding new VPS info route
  } as const;

  // Routes that require admin access
  const adminRoutes = {
    "/api/uvapi/users/list": "/users/list",
    "/api/uvapi/vps/list": "/vps/list",
    "/api/uvapi/vps/add": "/vps/add",
    "/api/uvapi/vps/delete": "/vps/delete",
    "/api/uvapi/users/verify/mail": "/users/verify/mail",
    "/api/uvapi/users/verify/token": "/users/verify/token",
  } as const;

  const adminPutRoutes = {
    "/api/uvapi/vps/edit": `/vps/edit/${url.pathname.split("/").pop()}`,
    "/api/uvapi/users/edit": `/users/edit/${url.pathname.split("/").pop()}`,
  } as const;

  // Identify if the route is a user route or admin route
  const matchedRoute =
    Object.keys(userRoutes).find((route) => url.pathname.startsWith(route)) ||
    Object.keys(adminRoutes).find((route) => url.pathname.startsWith(route)) ||
    Object.keys(adminPutRoutes).find((route) =>
      url.pathname.startsWith(route)
    );

  if (!matchedRoute) {
    return new Response(JSON.stringify({ message: "Not Found" }), {
      status: 404,
    });
  }

  // Check if route is an admin route and ensure user is an admin
  if (adminRoutes[matchedRoute as keyof typeof adminRoutes] || adminPutRoutes[matchedRoute as keyof typeof adminPutRoutes]) {
    const isAdmin = await checkAdmin(session);
    if (!isAdmin) {
      return new Response(JSON.stringify({ message: "Forbidden" }), {
        status: 403,
      });
    }
  }

  // Handle VPS Info Route: Check if user owns the VPS before returning the info
  if (url.pathname.startsWith("/api/uvapi/vps/info/")) {
    const vpsId = url.pathname.split("/").pop(); // Get the vpsId from the URL
    const userInfo = await proxyRequest(`/users/info/${session.user.email}`, "GET", undefined, session);
    
    // Check if the user owns the VPS
    if (!userInfo.data.vpsIds.includes(vpsId)) {
      return new Response(JSON.stringify({ message: "Forbidden: You do not own this VPS" }), {
        status: 403,
      });
    }
    
    // Fetch VPS Info from /vps/info/:vpsId
    const vpsInfo = await proxyRequest(`/vps/info/${vpsId}`, "GET", undefined, session);
    return new Response(JSON.stringify(vpsInfo.data), { status: vpsInfo.status });
  }

  apiUrl =
    userRoutes[matchedRoute as keyof typeof userRoutes] ||
    adminRoutes[matchedRoute as keyof typeof adminRoutes] ||
    adminPutRoutes[matchedRoute as keyof typeof adminPutRoutes];

  try {
    const { status, data } = await proxyRequest(apiUrl, method, requestBody, session);
    return new Response(JSON.stringify(data), { status });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}

// Expose API methods
export async function GET(req: NextRequest) {
  return handleRequest(req, "GET");
}

export async function POST(req: NextRequest) {
  return handleRequest(req, "POST");
}

export async function PUT(req: NextRequest) {
  return handleRequest(req, "PUT");
}
