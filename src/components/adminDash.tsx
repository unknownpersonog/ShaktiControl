'use client';

import React, { useState, useEffect, useMemo, ChangeEvent } from 'react';
import {
  Home, Server, BarChart2, Settings, Menu, X, Bell, Mail, Calendar, Users, Briefcase, Globe, ChevronLeft, ChevronRight, Trash2, RefreshCw, Shield, Plus, Edit2
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

interface SortConfig {
  key: keyof User | keyof VPS | null;
  direction: 'ascending' | 'descending';
}

interface AdminDashboardProps {
  userData: {
    data: {
      admin: boolean;
    };
  } | null;
}

const AdminDashboard = ({ userData }: AdminDashboardProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [vpsList, setVpsList] = useState<VPS[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [selectedVps, setSelectedVps] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'ascending' });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState<'email' | 'unid'>('email');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'user' | 'vps', id: string } | null>(null);

  // State for the Add VPS Modal
  const [showAddVpsModal, setShowAddVpsModal] = useState(false);
  const [newVpsData, setNewVpsData] = useState({
    vps_name: '',
    vps_os: '',
    vps_pass: '',
    vps_user: '',
    vps_ip: '',
    vps_plan: ''
  });

  // State for Editing User and VPS
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editVps, setEditVps] = useState<VPS | null>(null);

  // Tab state to switch between dashboards
  const [activeTab, setActiveTab] = useState<'user' | 'vps' | 'os'>('user');

  useEffect(() => {
    if (activeTab === 'user') {
      fetchUsers();
    } else if (activeTab === 'vps') {
      fetchVpsList();
    }
    // Load OS management data in the future if needed
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      const response = await makeRequest('GET', '/api/uvapi/users/list');
      const userArray = Array.isArray(response?.data) ? response.data : [response?.data];
      const processedUsers = userArray.map((user) => ({
        _id: user._id || '',
        email: user.email || '',
        method: user.method || '',
        joinDate: user.joinDate || new Date().toISOString(),
        unid: user.unid || '',
        coins: user.coins || 0,
        role: user.role || 'user',
      }));
      setUsers(processedUsers);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users');
      setLoading(false);
    }
  };

  const fetchVpsList = async () => {
    try {
      const response = await makeRequest('GET', '/api/uvapi/vps/list');
      if (response && Array.isArray(response.data)) {
        setVpsList(response.data as VPS[]); // Correctly cast data as VPS[]
      } else {
        throw new Error('Invalid response format');
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching VPS list:', err);
      setError('Failed to fetch VPS list');
      setLoading(false);
    }
  };

  const handleSort = (key: keyof User | keyof VPS) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'ascending' ? 'descending' : 'ascending'
    }));
  };

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      if (!sortConfig.key) return 0;
      const aVal = a[sortConfig.key as keyof User];
      const bVal = b[sortConfig.key as keyof User];
  
      const aComp = aVal == null ? '' : String(aVal).toLowerCase();
      const bComp = bVal == null ? '' : String(bVal).toLowerCase();
  
      if (aComp < bComp) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (aComp > bComp) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });
  }, [users, sortConfig]);

  const sortedVps = useMemo(() => {
    return [...vpsList].sort((a, b) => {
      if (!sortConfig.key) return 0;
      const aVal = a[sortConfig.key as keyof VPS];
      const bVal = b[sortConfig.key as keyof VPS];
  
      const aComp = aVal == null ? '' : String(aVal).toLowerCase();
      const bComp = bVal == null ? '' : String(bVal).toLowerCase();
  
      if (aComp < bComp) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (aComp > bComp) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });
  }, [vpsList, sortConfig]);

  const handleSelectAll = (event: ChangeEvent<HTMLInputElement>, type: 'user' | 'vps') => {
    if (type === 'user') {
      setSelectedUsers(event.target.checked ? new Set(sortedUsers.map((user) => user.email)) : new Set());
    } else {
      setSelectedVps(event.target.checked ? new Set(sortedVps.map((vps) => vps._id)) : new Set());
    }
  };

  const handleSelectItem = (id: string, type: 'user' | 'vps') => {
    if (type === 'user') {
      setSelectedUsers((prev) => {
        const newSet = new Set(prev);
        newSet.has(id) ? newSet.delete(id) : newSet.add(id);
        return newSet;
      });
    } else {
      setSelectedVps((prev) => {
        const newSet = new Set(prev);
        newSet.has(id) ? newSet.delete(id) : newSet.add(id);
        return newSet;
      });
    }
  };

  const handleAddVps = async () => {
    try {
      const response = await makeRequest('POST', '/api/uvapi/vps/add', newVpsData);
      if (response && response.data) {
        console.log('VPS added successfully:', response.data);
        fetchVpsList(); // Refresh the VPS list
      }
      setShowAddVpsModal(false);
      setNewVpsData({
        vps_name: '',
        vps_os: '',
        vps_pass: '',
        vps_user: '',
        vps_ip: '',
        vps_plan: ''
      });
    } catch (err) {
      console.error('Error adding VPS:', err);
      setError('Failed to add VPS');
    }
  };

  const handleVpsChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewVpsData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value
    }));
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;

    try {
      let endpoint = '';
      let payload = {};

      if (itemToDelete.type === 'user') {
        endpoint = '/api/uvapi/users/delete';
        payload = { email: itemToDelete.id };
      } else {
        endpoint = '/api/uvapi/vps/delete';
        payload = { vpsId: itemToDelete.id };
      }

      const response = await makeRequest('POST', endpoint, payload);

      if (response && response.data) {
        console.log(`${itemToDelete.type.toUpperCase()} deleted successfully:`, response.data);
        
        // Refresh the appropriate list
        if (itemToDelete.type === 'user') {
          fetchUsers();
        } else {
          fetchVpsList();
        }

        // Clear selected items
        if (itemToDelete.type === 'user') {
          setSelectedUsers(new Set());
        } else {
          setSelectedVps(new Set());
        }
      }
    } catch (err) {
      console.error(`Error deleting ${itemToDelete.type}:`, err);
      setError(`Failed to delete ${itemToDelete.type}`);
    } finally {
      setShowDeleteConfirmation(false);
      setItemToDelete(null);
    }
  };

  const handleDeleteSelected = (type: 'user' | 'vps') => {
    const selectedItems = type === 'user' ? selectedUsers : selectedVps;
    if (selectedItems.size > 0) {
      setItemToDelete({ type, id: Array.from(selectedItems)[0] });
      setShowDeleteConfirmation(true);
    }
  };
  
  const handleIndividualDelete = (type: 'user' | 'vps', id: string) => {
    setItemToDelete({ type, id });
    setShowDeleteConfirmation(true);
  };

  const handleEditVps = async () => {
    if (!editVps) return;
    console.log(editVps)
    try {
        const response = await makeRequest('PUT', `/api/uvapi/vps/edit/${editVps.id}`, editVps); // Ensure the data is sent as JSON
        if (response && response.data) {
            console.log('VPS edited successfully:', response.data);
            fetchVpsList(); // Refresh the VPS list
            setEditVps(null); // Close edit modal
        }
    } catch (err) {
        console.error('Error editing VPS:', err);
        setError('Failed to edit VPS');
    }
  };

  const handleEditUser = async () => {
      if (!editUser) return;
      try {
          const response = await makeRequest('PUT', `/api/uvapi/users/edit/${editUser.email}`, editUser); // Ensure the data is sent as JSON
          if (response && response.data) {
              console.log('User edited successfully:', response.data);
              fetchUsers(); // Refresh the user list
              setEditUser(null); // Close edit modal
          }
      } catch (err) {
          console.error('Error editing user:', err);
          setError('Failed to edit user');
      }
  };

  const handleUserChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEditUser((prevData) => (prevData ? { ...prevData, [e.target.name]: e.target.value } : null));
  };

  const handleVpsInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEditVps((prevData) => (prevData ? { ...prevData, [e.target.name]: e.target.value } : null));
  };

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
          <h1 className="text-2xl font-bold text-purple-300">Admin Dashboard</h1>
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
            {userData?.data.admin && (
              <button className="p-2 rounded-full bg-gray-700 hover:bg-gray-600">
                <Shield size={20} />
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <div className="mb-4 flex justify-center space-x-4">
            <button
              className={`px-4 py-2 rounded-lg ${activeTab === 'user' ? 'bg-purple-500' : 'bg-gray-700'} text-white`}
              onClick={() => setActiveTab('user')}
            >
              User Management
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${activeTab === 'vps' ? 'bg-purple-500' : 'bg-gray-700'} text-white`}
              onClick={() => setActiveTab('vps')}
            >
              VPS Management
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${activeTab === 'os' ? 'bg-purple-500' : 'bg-gray-700'} text-white`}
              onClick={() => setActiveTab('os')}
            >
              OS Management
            </button>
          </div>

          {/* Conditionally render content based on the active tab */}
          {activeTab === 'user' ? (
            // User Management Section
            <div className="p-6 rounded-lg border border-purple-500 bg-opacity-50 backdrop-blur-lg">
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
                    onClick={() => handleDeleteSelected('user')}
                    disabled={selectedUsers.size === 0}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg mr-2 hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="inline-block mr-2" size={18} />
                    Delete Selected
                  </button>
                  <button
                    onClick={() => console.log('Emailing users:', Array.from(selectedUsers))}
                    disabled={selectedUsers.size === 0}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    <Mail className="inline-block mr-2" size={18} />
                    Email Selected
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="px-4 py-2">
                        <input
                          type="checkbox"
                          onChange={(e) => handleSelectAll(e, 'user')}
                          checked={selectedUsers.size === sortedUsers.length && sortedUsers.length > 0}
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
                    {sortedUsers.map((user) => (
                      <tr key={user._id} className="border-t border-gray-700 hover:bg-gray-700">
                        <td className="px-4 py-2">
                          <input
                            type="checkbox"
                            checked={selectedUsers.has(user.email)}
                            onChange={() => handleSelectItem(user.email, 'user')}
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
                        <td className="px-4 py-2 flex space-x-2">
                          <button
                            onClick={() => setEditUser(user)}
                            className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleIndividualDelete('user', user.email)}
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
          ) : activeTab === 'vps' ? (
            // VPS Management Section
            <div className="p-6 rounded-lg border border-purple-500 bg-opacity-50 backdrop-blur-lg">
              <h2 className="text-xl font-bold mb-4 text-purple-300">VPS Management</h2>
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <button
                    onClick={() => handleDeleteSelected('vps')}
                    disabled={selectedVps.size === 0}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg mr-2 hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="inline-block mr-2" size={18} />
                    Delete Selected
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="px-4 py-2">
                        <input
                          type="checkbox"
                          onChange={(e) => handleSelectAll(e, 'vps')}
                          checked={selectedVps.size === sortedVps.length && sortedVps.length > 0}
                          className="form-checkbox h-5 w-5 text-purple-600"
                        />
                      </th>
                      {['name', 'os', 'port', 'owner', 'plan', 'user', 'ip', 'actions'].map((header) => (
                        <th
                          key={header}
                          className="px-4 py-2 cursor-pointer text-left text-gray-300 hover:text-white"
                          onClick={() => handleSort(header as keyof VPS)}
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
                    {sortedVps.map((vps) => (
                      <tr key={vps._id} className="border-t border-gray-700 hover:bg-gray-700">
                        <td className="px-4 py-2">
                          <input
                            type="checkbox"
                            checked={selectedVps.has(vps._id)}
                            onChange={() => handleSelectItem(vps._id, 'vps')}
                            className="form-checkbox h-5 w-5 text-purple-600"
                          />
                        </td>
                        <td className="px-4 py-2">{vps.name}</td>
                        <td className="px-4 py-2">{vps.os}</td>
                        <td className="px-4 py-2">{vps.port}</td>
                        <td className="px-4 py-2">{vps.owner}</td>
                        <td className="px-4 py-2">{vps.plan}</td>
                        <td className="px-4 py-2">{vps.user}</td>
                        <td className="px-4 py-2">{vps.ip}</td>
                        <td className="px-4 py-2 flex space-x-2">
                          <button
                            onClick={() => setEditVps(vps)}
                            className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleIndividualDelete('vps', vps.id)}
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
          ) : (
            // OS Management Section
            <div className="p-6 rounded-lg border border-purple-500 bg-opacity-50 backdrop-blur-lg">
              <h2 className="text-xl font-bold mb-4 text-purple-300">OS Management</h2>
              {/* Content for OS management would go here */}
              <p className="text-gray-300">Coming soon...</p>
            </div>
          )}
        </main>
      </div>
      
      {/* Modals for adding, editing, and loading indicators */}
      {showAddVpsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-gray-800 p-6 w-full max-w-md rounded-lg border border-purple-500">
            <h2 className="text-xl font-bold mb-4 text-purple-300">Add New VPS</h2>
            <div className="space-y-2">
              {['vps_name', 'vps_os', 'vps_pass', 'vps_user', 'vps_ip', 'vps_plan'].map((field) => (
                <input
                  key={field}
                  name={field}
                  placeholder={field.replace('_', ' ').toUpperCase()}
                  value={(newVpsData as any)[field]}
                  onChange={handleVpsChange}
                  className="w-full px-4 py-2 backdrop-blur-lg bg-opacity-50 bg-gray-600 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              ))}
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setShowAddVpsModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddVps}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Add VPS
              </button>
            </div>
          </div>
        </div>
      )}

      {editUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-gray-800 p-6 w-full max-w-md rounded-lg border border-purple-500">
            <h2 className="text-xl font-bold mb-4 text-purple-300">Edit User</h2>
            <div className="space-y-2">
              {['email', 'method', 'unid', 'coins', 'role'].map((field) => (
                <input
                  key={field}
                  name={field}
                  placeholder={field.toUpperCase()}
                  value={(editUser as any)[field]}
                  onChange={handleUserChange}
                  className="w-full px-4 py-2 backdrop-blur-lg bg-opacity-50 bg-gray-600 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              ))}
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setEditUser(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditUser}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {editVps && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-gray-800 p-6 w-full max-w-md rounded-lg border border-purple-500">
            <h2 className="text-xl font-bold mb-4 text-purple-300">Edit VPS</h2>
            <div className="space-y-2">
              {['name', 'os', 'port', 'owner', 'plan', 'user', 'ip'].map((field) => (
                <input
                  key={field}
                  name={field}
                  placeholder={field.toUpperCase()}
                  value={(editVps as any)[field]}
                  onChange={handleVpsInputChange}
                  className="w-full px-4 py-2 backdrop-blur-lg bg-opacity-50 bg-gray-600 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              ))}
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setEditVps(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditVps}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-gray-800 p-6 w-full max-w-md rounded-lg border border-purple-500">
            <h2 className="text-xl font-bold mb-4 text-purple-300">Confirm Delete</h2>
            <p className="text-white mb-4">
              Are you sure you want to delete the selected {itemToDelete?.type}(s)?
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteItem}
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
};

export default AdminDashboard;