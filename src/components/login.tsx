"use client";
import { signIn } from "next-auth/react";
import Image from "next/image";


export default async function Login() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="border border-gray-600 rounded-xl p-6 backdrop-blur-md bg-black/50 shadow-gray-700 shadow-lg max-w-md hover:shadow-white/20 transition-all duration-300">
        <div className="flex justify-center py-3">
          <Image
            src="/favicon.ico"
            alt="UnknownVPS Logo"
            width={512}
            height={512}
            className="w-32 h-32 border rounded-lg border-orange-300 backdrop-blur-lg shadow-orange-500/20 shadow-lg transition-all duration-300 hover:scale-105"
          />
        </div>
        
        <h1 className="text-white text-2xl font-bold text-center mt-2 mb-4">Welcome to UnknownVPS</h1>
        
        <div className="flex justify-center mb-4">
          <p className="text-white text-sm font-mono p-3 rounded-lg backdrop-blur-lg bg-white/5 max-w-xs text-center shadow-inner shadow-white/5">
            Please sign in to continue to your dashboard
          </p>
        </div>
        
        <div className="w-full font-mono flex flex-col items-center gap-3 mb-4">
            <button
              onClick={() => signIn("google")}
              className="flex items-center rounded-lg border p-3 text-white bg-white/10 border-gray-500 hover:bg-white/20 transition-all duration-200 w-full justify-center shadow-md shadow-white/5 hover:shadow-white/10"
              type="submit"
            >
              <Image
                src="/google.png"
                alt="Google"
                width={512}
                height={512}
                className="w-6 h-6 mr-3"
              />
              Sign in with Google
            </button>
          
            <button
              onClick={() => signIn("discord")}
              className="flex items-center rounded-lg border p-3 text-white bg-white/10 border-gray-500 hover:bg-white/20 transition-all duration-200 w-full justify-center shadow-md shadow-white/5 hover:shadow-white/10"
              type="submit"
            >
              <Image
                src="/discord.png"
                alt="Discord"
                width={256}
                height={256}
                className="w-6 h-6 mr-3"
              />
              Sign in with Discord
            </button>
        </div>
        
        <div className="flex justify-center mt-2">
          <p className="rounded backdrop-blur-lg text-gray-400 text-xs p-2 text-center max-w-xs">
            By signing in, you agree to UnknownVPS <a href="#" className="text-orange-300 hover:text-orange-400 transition-colors">Terms & Conditions</a> and <a href="#" className="text-orange-300 hover:text-orange-400 transition-colors">Privacy Policy</a>
          </p>
        </div>
      </div>
    </main>
  );
}