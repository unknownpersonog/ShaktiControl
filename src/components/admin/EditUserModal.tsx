import React, { useState } from 'react';
import { makeRequest } from '@/functions/api/makeRequest';

const EditUserModal = ({ user, setShowEditUserModal, fetchUsers }: any) => {
  const [updatedUser, setUpdatedUser] = useState(user);

  const handleEditUser = async () => {
    try {
      await makeRequest('PUT', `/api/uvapi/users/edit/${updatedUser.email}`, updatedUser);
      fetchUsers();
      setShowEditUserModal(false);
    } catch (error) {
      console.error('Error editing user:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-gray-800 p-6 w-full max-w-md rounded-lg border border-purple-500">
        <h2 className="text-xl font-bold mb-4 text-purple-300">Edit User</h2>
        {['email', 'unid', 'coins', 'role'].map((field) => (
          <input
            key={field}
            name={field}
            value={updatedUser[field]}
            onChange={(e) => setUpdatedUser({ ...updatedUser, [field]: e.target.value })}
            className="w-full px-4 py-2 backdrop-blur-lg bg-opacity-50 bg-gray-600 text-white border border-gray-700 rounded-lg"
          />
        ))}
        <div className="mt-4 flex justify-end space-x-2">
          <button onClick={() => setShowEditUserModal(false)} className="px-4 py-2 bg-gray-600 text-white rounded-lg">Cancel</button>
          <button onClick={handleEditUser} className="px-4 py-2 bg-green-500 text-white rounded-lg">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
