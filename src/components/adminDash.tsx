"use client";

import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "@/components/sidebar";
import Header from "@/components/admin/Header";
import TabButtons from "@/components/admin/TabButtons";
import UserTable from "@/components/admin/UserTable";
import VpsTable from "@/components/admin/VpsTable";
import AddVpsModal from "@/components/admin/AddVpsModal";
import EditUserModal from "@/components/admin/EditUserModal";
import EditVpsModal from "@/components/admin/EditVpsModal";
import DeleteConfirmationModal from "@/components/admin/DeleteConfirmationModal";
import { makeRequest } from "@/functions/api/makeRequest";
import { RefreshCw } from "lucide-react";

interface User {
  _id: string;
  email: string;
  method: string;
  joinDate: string | undefined;
  unid: string;
  coins?: number;
  role?: string;
}

interface VPS {
  _id: string;
  id: string;
  name: string;
  os: string;
  port: number;
  owner: string;
  pass: string;
  plan: string;
  user: string;
  ip: string;
}

interface UserSortConfig {
  key: keyof User | null;
  direction: "ascending" | "descending";
}

interface VPSSortConfig {
  key: keyof VPS | null;
  direction: "ascending" | "descending";
}

type SortConfig = UserSortConfig | VPSSortConfig;

interface AdminDashboardProps {
  session: any;
  userData: {
    data: { email: string; unid: string; admin: string; coins?: number };
  };
}

const AdminDashboard = ({ userData, session }: AdminDashboardProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [vpsList, setVpsList] = useState<VPS[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"user" | "vps" | "os">("user");
  const [showAddVpsModal, setShowAddVpsModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showEditVpsModal, setShowEditVpsModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    type: "user" | "vps";
    id: string;
  } | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedVps, setSelectedVps] = useState<VPS | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: "ascending",
  });

  useEffect(() => {
    if (activeTab === "user") fetchUsers();
    if (activeTab === "vps") fetchVpsList();
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await makeRequest("GET", "/api/uvapi/users/list");
      const userArray = Array.isArray(response?.data)
        ? response.data
        : [response?.data];
      const processedUsers = userArray.map((user) => ({
        _id: user._id || "",
        email: user.email || "",
        method: user.method || "",
        joinDate: user.joinDate || new Date().toISOString(),
        unid: user.unid || "",
        coins: user.coins || 0,
        role: user.role || "user",
      }));
      setUsers(processedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVpsList = async () => {
    setLoading(true);
    try {
      const response = await makeRequest("GET", "/api/uvapi/vps/list");
      if (response && Array.isArray(response.data)) {
        setVpsList(response.data as VPS[]);
      }
    } catch (error) {
      console.error("Error fetching VPS list:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleEditUser = (user: User | null) => {
    setSelectedUser(user);
    setShowEditUserModal(true);
  };

  const handleSort = (key: keyof User | keyof VPS) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "ascending"
          ? "descending"
          : "ascending",
    }));
  };

  const handleIndividualDelete = (type: "user" | "vps", id: string) => {
    setItemToDelete({ type, id });
    setShowDeleteConfirmation(true);
  };

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      if (!sortConfig.key) return 0;
      const aVal = a[sortConfig.key as keyof User];
      const bVal = b[sortConfig.key as keyof User];

      const aComp = aVal == null ? "" : String(aVal).toLowerCase();
      const bComp = bVal == null ? "" : String(bVal).toLowerCase();

      if (aComp < bComp) return sortConfig.direction === "ascending" ? -1 : 1;
      if (aComp > bComp) return sortConfig.direction === "ascending" ? 1 : -1;
      return 0;
    });
  }, [users, sortConfig]);

  const sortedVps = useMemo(() => {
    return [...vpsList].sort((a, b) => {
      if (!sortConfig.key) return 0;
      const aVal = a[sortConfig.key as keyof VPS];
      const bVal = b[sortConfig.key as keyof VPS];

      const aComp = aVal == null ? "" : String(aVal).toLowerCase();
      const bComp = bVal == null ? "" : String(bVal).toLowerCase();

      if (aComp < bComp) return sortConfig.direction === "ascending" ? -1 : 1;
      if (aComp > bComp) return sortConfig.direction === "ascending" ? 1 : -1;
      return 0;
    });
  }, [vpsList, sortConfig]);

  return (
    <div className="flex h-screen text-white">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="p-4 flex-1 flex flex-col overflow-hidden">
        <Header
          setSidebarOpen={setSidebarOpen}
          sidebarOpen={sidebarOpen}
          isAdmin={userData?.data.admin ?? false}
          setShowAddVpsModal={setShowAddVpsModal}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <TabButtons activeTab={activeTab} setActiveTab={setActiveTab} />
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <RefreshCw className="animate-spin h-8 w-8 text-gray-200" />
            </div>
          ) : activeTab === "user" ? (
            <UserTable
              users={sortedUsers}
              selectedUsers={selectedUsers}
              setSelectedUsers={setSelectedUsers}
              handleSort={handleSort}
              sortConfig={sortConfig as UserSortConfig}
              setEditUser={handleEditUser}
              handleIndividualDelete={handleIndividualDelete}
            />
          ) : activeTab === "vps" ? (
            <VpsTable
              vpsList={sortedVps}
              setSelectedVps={setSelectedVps}
              setShowEditVpsModal={setShowEditVpsModal}
              setShowDeleteConfirmation={setShowDeleteConfirmation}
            />
          ) : (
            <div className="p-6 rounded-lg border border-gray-300 bg-opacity-50 backdrop-blur-lg">
              <h2 className="text-xl font-bold mb-4 text-gray-200">
                OS Management
              </h2>
              <p className="text-gray-300">Coming soon...</p>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {showAddVpsModal && (
        <AddVpsModal
          setShowAddVpsModal={setShowAddVpsModal}
          fetchVpsList={fetchVpsList}
        />
      )}
      {showEditUserModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          setShowEditUserModal={setShowEditUserModal}
          fetchUsers={fetchUsers}
        />
      )}
      {showEditVpsModal && (
        <EditVpsModal
          vps={selectedVps}
          setShowEditVpsModal={setShowEditVpsModal}
          fetchVpsList={fetchVpsList}
        />
      )}
      {showDeleteConfirmation && (
        <DeleteConfirmationModal
          itemToDelete={itemToDelete}
          setShowDeleteConfirmation={setShowDeleteConfirmation}
          fetchUsers={fetchUsers}
          fetchVpsList={fetchVpsList}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
