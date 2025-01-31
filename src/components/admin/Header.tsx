import React from "react";
import { Menu, X, Plus, Bell, Mail, Shield } from "lucide-react";

const Header = ({
  sidebarOpen,
  setSidebarOpen,
  isAdmin,
  setShowAddVpsModal,
}: any) => (
  <header className="flex justify-between items-center p-4">
    <h1 className="text-2xl font-bold text-gray-100">Admin Dashboard</h1>
    <div className="flex items-center space-x-4">
      <button
        className="p-2 rounded-full bg-gray-700 hover:bg-gray-600"
        onClick={() => setShowAddVpsModal(true)}
      >
        <Plus size={20} />
      </button>
      <button className="p-2 rounded-full bg-gray-700 hover:bg-gray-600">
        <Mail size={20} />
      </button>
      <button className="p-2 rounded-full bg-gray-700 hover:bg-gray-600">
        <Bell size={20} />
      </button>
      {isAdmin && (
        <button className="p-2 rounded-full bg-gray-700 hover:bg-gray-600">
          <Shield size={20} />
        </button>
      )}
    </div>
  </header>
);

export default Header;
