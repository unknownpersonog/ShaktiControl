"use client";

import { useState, useEffect, useCallback } from "react";
import { Home } from "lucide-react";
import debounce from "lodash.debounce";

const borderColors = [
  "border-pink-500",
  "border-purple-500",
  "border-indigo-500",
  "border-blue-500",
  "border-cyan-500",
  "border-teal-500",
];

export default function NotFoundPage() {
  const [isMobile, setIsMobile] = useState(false);

  const checkMobile = useCallback(
    debounce(() => {
      setIsMobile(window.innerWidth < 768);
    }, 200),
    [],
  );

  useEffect(() => {
    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, [checkMobile]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="text-center p-8 md:p-12 bg-opacity-50 border rounded-lg border-gray-700 backdrop-blur-md">
        <h1 className="text-6xl font-bold text-red-500 mb-4">404</h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-300 mb-6">
          Page Not Found
        </h2>
        <p className="text-gray-400 mb-8">
          Sorry, the page you're looking for does not exist. It might have been
          moved or deleted.
        </p>
        <a
          href="/"
          className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors"
        >
          <Home className="mr-2" />
          Return to Homepage
        </a>
      </div>
    </div>
  );
}
