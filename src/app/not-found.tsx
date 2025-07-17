"use client";

import { Home } from "lucide-react";

export default function NotFoundPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="border border-gray-700 rounded-2xl p-8 backdrop-blur-md bg-black/40 shadow-2xl shadow-red-900/30 max-w-md w-full transition-all duration-300 hover:shadow-red-500/20">
        <h1 className="text-4xl font-bold text-center text-red-500 mb-2 tracking-tight">
          404
        </h1>

        <h2 className="text-sm text-center text-gray-400 mb-4 uppercase tracking-wider">
          Page Not Found
        </h2>

        <p className="text-sm text-gray-300 text-center mb-6 font-mono px-4">
          The page you're looking for isn't available. It might have been moved,
          deleted, or never existed.
        </p>

        <div className="flex justify-center">
          <a
            href="/"
            className="flex items-center gap-2 rounded-xl border p-3 text-white bg-gradient-to-r from-red-600/40 to-red-500/30 border-gray-600 hover:from-red-600 hover:to-red-500 transition-all duration-200 w-full justify-center max-w-xs shadow-lg shadow-red-900/20 hover:shadow-red-500/30 font-medium"
          >
            <Home className="w-4 h-4" />
            Take me home
          </a>
        </div>
      </div>
    </main>
  );
}
