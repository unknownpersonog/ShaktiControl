'use client';

import React, { useState, useEffect } from 'react';
import { 
  Home, Server, BarChart2, Settings, Menu, X, Bell,
  Mail, Calendar, Users, Briefcase, Globe, ChevronLeft, ChevronRight, Trash2, RefreshCw, Shield
} from 'lucide-react';
import { makeRequest } from '@/functions/api/makeRequest';
import { format } from 'date-fns';
import Sidebar from './sidebar';

interface User {
  _id: string;
  email: string;
  method: string;
  joinDate: string;
  unid: string;
  coins?: number;
  role?: string;
}

interface SortConfig {
  key: keyof User | null;
  direction: 'ascending' | 'descending';
}

interface AdminDashboardProps {
  userData: {
    data: {
      admin: boolean;
    };
  } | null;
}

export default function AdminDashboard({ userData }: AdminDashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'ascending' });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState<'email' | 'unid'>('email'); // Default search by email
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await makeRequest('GET', '/api/uvapi/users/list');
      if (response && response.data) {
        const data = response.data;
        const userArray = Array.isArray(data) ? data : [data];
        const processedUsers = userArray.map(user => ({
          _id: user._id || '',
          email: user.email || '',
          method: user.method || '',
          joinDate: user.joinDate || new Date().toISOString(),
          unid: user.unid || '',
          coins: user.coins || 0,
          role: user.role || 'user', // Default role
        }));
        setUsers(processedUsers);
      } else {
        throw new Error('Invalid response format');
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users');
      setLoading(false);
    }
  };

  const handleSort = (key: keyof User) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'ascending' ? 'descending' : 'ascending'
    }));
  };

  const sortedUsers = React.useMemo(() => {
    return [...users].sort((a, b) => {
      if (!sortConfig.key) return 0;
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      
      const aComp = aVal == null ? '' : String(aVal).toLowerCase();
      const bComp = bVal == null ? '' : String(bVal).toLowerCase();
      
      if (aComp < bComp) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (aComp > bComp) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });
  }, [users, sortConfig]);

  const filteredUsers = sortedUsers.filter(user =>
    searchBy === 'email'
      ? user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false
      : user.unid?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false
  );

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedUsers(new Set(filteredUsers.map(user => user.email)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  const handleSelectUser = (email: string) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(email)) {
        newSet.delete(email);
      } else {
        newSet.add(email);
      }
      return newSet;
    });
  };

  const handleDeleteUser = (email: string) => {
    setUserToDelete(email);
    setShowConfirmation(true);
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      setLoading(true);
      try {
        await makeRequest('POST', `/api/uvapi/users/delete`, { email: userToDelete });
        setUsers(users.filter(user => user.email !== userToDelete));
        setSelectedUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userToDelete);
          return newSet;
        });
      } catch (err) {
        console.error('Error deleting user:', err);
        setError('Failed to delete user');
      } finally {
        setLoading(false);
        setShowConfirmation(false);
        setUserToDelete(null);
      }
    }
  };

  const handleDeleteSelected = () => {
    setShowConfirmation(true);
  };

  const confirmDeleteSelected = async () => {
    setLoading(true);
    try {
      for (const email of Array.from(selectedUsers)) {
        await makeRequest('POST', `/api/uvapi/users/delete`, { email });
      }
      setUsers(users.filter(user => !selectedUsers.has(user.email)));
      setSelectedUsers(new Set());
    } catch (err) {
      console.error('Error deleting selected users:', err);
      setError('Failed to delete selected users');
    } finally {
      setLoading(false);
      setShowConfirmation(false);
    }
  };

  const handleEmailSelected = () => {
    console.log('Emailing users:', Array.from(selectedUsers));
  };

  const borderColors = [
    'border-purple-500',
    'border-indigo-500',
    'border-blue-500',
    'border-cyan-500',
    'border-teal-500',
    'border-green-500',
  ];

  return (
    <div className="flex h-screen text-white">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isAdmin={true}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center p-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md lg:hidden"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="text-2xl font-bold text-purple-300">User Management Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full bg-gray-700 hover:bg-gray-600">
              <Mail size={20} />
            </button>
            <button className="p-2 rounded-full bg-gray-700 hover:bg-gray-600">
              <Bell size={20} />
            </button>
            {userData?.data.admin && (
              <button className="p-2 rounded-full bg-gray-700 hover:bg-gray-600">
                <Shield size={20} />
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <div className="mb-6 flex justify-between items-center">
            <div className="flex space-x-2">
              <select
                value={searchBy}
                onChange={(e) => setSearchBy(e.target.value as 'email' | 'unid')}
                className="px-4 py-2 backdrop-blur-lg bg-opacity-50 bg-gray-600 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="email">Search by Email</option>
                <option value="unid">Search by UNID</option>
              </select>
              <input
                type="text"
                placeholder={`Search users by ${searchBy}...`}
                className="px-4 py-2 backdrop-blur-lg bg-opacity-50 bg-gray-600 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <button
                onClick={handleDeleteSelected}
                disabled={selectedUsers.size === 0}
                className="bg-red-500 text-white px-4 py-2 rounded-lg mr-2 hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                <Trash2 className="inline-block mr-2" size={18} />
                Delete Selected
              </button>
              <button
                onClick={handleEmailSelected}
                disabled={selectedUsers.size === 0}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                <Mail className="inline-block mr-2" size={18} />
                Email Selected
              </button>
            </div>
          </div>

          <div className={`p-6 rounded-lg border ${borderColors[0]} bg-opacity-50 backdrop-blur-lg`}>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="px-4 py-2">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                        className="form-checkbox h-5 w-5 text-purple-600"
                      />
                    </th>
                    {['email', 'method', 'joinDate', 'unid', 'coins', 'actions'].map((header) => (
                      <th
                        key={header}
                        className="px-4 py-2 cursor-pointer text-left text-gray-300 hover:text-white"
                        onClick={() => handleSort(header as keyof User)}
                      >
                        {header.charAt(0).toUpperCase() + header.slice(1)}
                        {sortConfig.key === header && (
                          <span>{sortConfig.direction === 'ascending' ? ' ▲' : ' ▼'}</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="border-t border-gray-700 hover:bg-gray-700">
                      <td className="px-4 py-2">
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(user.email)}
                          onChange={() => handleSelectUser(user.email)}
                          className="form-checkbox h-5 w-5 text-purple-600"
                        />
                      </td>
                      <td className="px-4 py-2">{user.email}</td>
                      <td className="px-4 py-2">
                      {user.method === 'Google' ? (
                          <div className="flex items-center">
                            <img
                              src="/google.png"
                              alt="Google"
                              className="w-5 h-5 mr-2"
                            />
                          </div>
                        ) : 'Invalid'}
                      </td>
                      <td className="px-4 py-2">{format(new Date(user.joinDate), 'yyyy-MM-dd')}</td>
                      <td className="px-4 py-2">{user.unid}</td>
                      <td className="px-4 py-2">{user.coins}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleDeleteUser(user.email)}
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
        </main>
      </div>

      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-gray-800 p-6 rounded-lg border border-purple-500">
            <h2 className="text-xl font-bold mb-4 text-purple-300">Confirm Deletion</h2>
            <p className="text-gray-300">Are you sure you want to delete {userToDelete ? 'this user' : 'the selected users'}?</p>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={userToDelete ? confirmDelete : confirmDeleteSelected}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <RefreshCw className="animate-spin h-8 w-8 text-purple-500" />
        </div>
      )}
    </div>
  );
}
