import React, { useState, useEffect } from 'react';
import { makeRequest } from '@/functions/api/makeRequest';
import { ChevronDown, ChevronUp, Search, Trash, Mail } from 'lucide-react';
import LoadingComponent from './loading';
import Sidebar from './sidebar';

interface User {
  _id: string;
  email: string;
  verified: string;
  admin: string;
}

interface SortConfig {
  key: keyof User | null;
  direction: 'ascending' | 'descending';
}

export default function AdminDashboard(userData: any) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'ascending' });
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await makeRequest('GET', '/api/uvapi/users/list');
        console.log('Received data:', data);

        let parsedUsers: User[] = [];
        if (Array.isArray(data)) {
          parsedUsers = data;
        } else if (typeof data === 'object' && data !== null) {
          const possibleArrays = Object.values(data).filter(Array.isArray);
          if (possibleArrays.length > 0) {
            parsedUsers = possibleArrays[0];
          } else {
            parsedUsers = [data as User];
          }
        }

        if (parsedUsers.length > 0) {
          setUsers(parsedUsers);
        } else {
          setError('No user data found in the response');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to fetch users');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSort = (key: keyof User) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedUsers = React.useMemo(() => {
    let sortableUsers = [...users];
    if (sortConfig.key !== null) {
      sortableUsers.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableUsers;
  }, [users, sortConfig]);

  const filteredUsers = sortedUsers.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedUsers(filteredUsers.map(user => user._id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prevSelected =>
      prevSelected.includes(userId)
        ? prevSelected.filter(id => id !== userId)
        : [...prevSelected, userId]
    );
  };

  const handleDeleteSelected = () => {
    // Implement delete functionality here
    console.log('Deleting users:', selectedUsers);
  };

  const handleEmailSelected = () => {
    // Implement email functionality here
    console.log('Emailing users:', selectedUsers);
  };

  if (loading) return <LoadingComponent />;
  if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;

  return (
    <div className="flex min-h-screen">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isAdmin={true} />
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-200">User Management Dashboard</h1>
        <div className="mb-4 flex justify-between items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
          <div className="space-x-2">
            <button
              onClick={handleDeleteSelected}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300 flex items-center"
              disabled={selectedUsers.length === 0}
            >
              <Trash size={20} className="mr-2" />
              Delete Selected
            </button>
            <button
              onClick={handleEmailSelected}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300 flex items-center"
              disabled={selectedUsers.length === 0}
            >
              <Mail size={20} className="mr-2" />
              Email Selected
            </button>
          </div>
        </div>
        <div className="border backdrop-blur-md shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="border backdrop-blur-md text-yellow-300">
              <tr>
                <th className="px-4 py-2">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                  />
                </th>
                <th
                  className="px-4 py-2 text-left cursor-pointer"
                  onClick={() => handleSort('email')}
                >
                  Email
                  {sortConfig.key === 'email' && (
                    sortConfig.direction === 'ascending' ? (
                      <ChevronUp size={20} className="inline ml-1" />
                    ) : (
                      <ChevronDown size={20} className="inline ml-1" />
                    )
                  )}
                </th>
                <th className="px-4 py-2 text-left">Verified</th>
                <th className="px-4 py-2 text-left">Admin</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id} className="border-b hover:bg-gray-50 transition duration-300">
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => handleSelectUser(user._id)}
                    />
                  </td>
                  <td className="px-4 py-2 text-gray-300 hover:text-blue-600 transition duration-300">{user.email}</td>
                  <td className="px-4 py-2 text-blue-300">{user.verified}</td>
                  <td className="px-4 py-2 text-red-300">{user.admin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
