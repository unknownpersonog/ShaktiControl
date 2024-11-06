"use client";
import { X, Mail, Coins, UserCheck, Terminal } from "lucide-react";
import { redirect } from "next/navigation";
import React from "react";

interface ProfileModalProps {
  session: any;
  userData: {
    data: { email: string; unid: string; admin: string; coins?: number };
  };
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({
  userData,
  session,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
      <div className="bg-gray-900 text-green-400 rounded-lg p-6 w-full max-w-lg relative shadow-lg font-mono">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-100"
        >
          <X size={24} />
        </button>

        {/* Terminal Icon Header */}
        <div className="flex items-center mb-4">
          <Terminal size={24} className="text-green-400 mr-2 border" />
          <h2 className="text-2xl font-bold">Profile</h2>
        </div>

        {/* User Info Lines */}
        <div className="bg-gray-800 p-2 rounded-lg mb-2">
          <span>{`Name: ${session.name}`}</span>
        </div>
        <div className="bg-gray-800 p-2 rounded-lg mb-2">
          <span>{`Email: ${userData.data.email}`}</span>
        </div>
        <div className="bg-gray-800 p-2 rounded-lg mb-2">
          <span>{`UNID: ${userData.data.unid}`}</span>
        </div>
        <div className="bg-gray-800 p-2 rounded-lg mb-2">
          <span>{`Role: ${userData.data.admin ? "You are SUDO" : "N/A"}`}</span>
        </div>
        <div className="bg-gray-800 p-2 rounded-lg mb-2">
          <span>{`Coins: ${userData.data.coins || "0"}`}</span>
        </div>

        {/* Logout Button */}
        <div className="mt-4 flex justify-center">
          <a
            href="/api/auth/signout"
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition"
          >
            Logout
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
