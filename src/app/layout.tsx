import type { Metadata } from "next";
import "./globals.css";
// app/layout.js
import React, { Suspense } from "react";

import { Inter } from "next/font/google";
import LoadingComponent from "@/components/loading";
import { SessionProvider } from "next-auth/react";
import Image from "next/image";
import { ApiInfoProvider } from "@/context/ApiInfoProvider";
// If loading a variable font, you don't need to specify the font weight
const inter = Inter({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: "ShaktiCtrl • UnknownVPS",
  description: "Service management service by and for UnknownVPS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <SessionProvider>
        <ApiInfoProvider>
          <body className={inter.className}>{children}</body>
        </ApiInfoProvider>
      </SessionProvider>
    </html>
  );
}
