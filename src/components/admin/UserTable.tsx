import React, { useState, useEffect, useMemo, ChangeEvent } from "react";
import { Edit2, Trash2, Mail } from "lucide-react";
import { format, isValid } from "date-fns";

interface User {
  _id: string;
  email: string;
  method: string;
  joinDate: string | undefined;
  unid: string;
  coins?: number;
  role?: string;
}

interface SortConfig {
  key: keyof User | null;
  direction: "ascending" | "descending";
}

interface UserTableProps {
  users: User[];
  selectedUsers: Set<string>;
  setSelectedUsers: React.Dispatch<React.SetStateAction<Set<string>>>;
  handleSort: (key: keyof User) => void;
  sortConfig: SortConfig;
  setEditUser: (user: User | null) => void;
  handleIndividualDelete: (type: "user" | "vps", id: string) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  selectedUsers,
  setSelectedUsers,
  handleSort,
  sortConfig,
  setEditUser,
  handleIndividualDelete,
}) => {
  const handleSelectAll = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedUsers(
      event.target.checked
        ? new Set(users.map((user) => user.email))
        : new Set(),
    );
  };

  const handleSelectItem = (email: string) => {
    setSelectedUsers((prev) => {
      const newSet = new Set(prev);
      newSet.has(email) ? newSet.delete(email) : newSet.add(email);
      return newSet;
    });
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isValid(date) ? format(date, "yyyy-MM-dd") : "Invalid Date";
  };

  const handleEditUser = (user: User) => {
    // Create a new object with all user properties
    const editableUser: User = {
      _id: user._id,
      email: user.email,
      method: user.method,
      joinDate: user.joinDate,
      unid: user.unid,
      coins: user.coins,
      role: user.role,
    };
    setEditUser(editableUser);
  };

  return (
    <div className="p-6 rounded-lg border border-gray-300 bg-opacity-50 backdrop-blur-lg shadow shadow-gray-300">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-4 py-2">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={
                    selectedUsers.size === users.length && users.length > 0
                  }
                  className="form-checkbox h-5 w-5 text-purple-600"
                />
              </th>
              {[
                "email",
                "method",
                "joinDate",
                "unid",
                "coins",
                "role",
                "actions",
              ].map((header) => (
                <th
                  key={header}
                  className="px-4 py-2 cursor-pointer text-left text-gray-300 hover:text-white"
                  onClick={() => handleSort(header as keyof User)}
                >
                  {header.charAt(0).toUpperCase() + header.slice(1)}
                  {sortConfig.key === header && (
                    <span>
                      {sortConfig.direction === "ascending" ? " ▲" : " ▼"}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user._id}
                className="border-t border-gray-700 hover:bg-gray-700"
              >
                <td className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={selectedUsers.has(user.email)}
                    onChange={() => handleSelectItem(user.email)}
                    className="form-checkbox h-5 w-5 text-purple-600"
                  />
                </td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">
                  {(user.method === "Google" || "Discord") ? (
                    <div className="flex items-center">
                      <img
                        src={user.method.charAt(0).toLowerCase() + user.method.slice(1) + ".png"}
                        alt={user.method}
                        className="w-5 h-5 mr-2"
                      />
                    </div>
                  ) : (
                    user.method
                  )}
                </td>
                <td className="px-4 py-2">{formatDate(user.joinDate)}</td>
                <td className="px-4 py-2">{user.unid}</td>
                <td className="px-4 py-2">{user.coins}</td>
                <td className="px-4 py-2">{user.role}</td>
                <td className="px-4 py-2 flex space-x-2">
                  <button
                    onClick={() => handleEditUser(user)}
                    className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleIndividualDelete("user", user.email)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;
