import React from "react";
import { makeRequest } from "@/functions/api/makeRequest";

const DeleteConfirmationModal = ({
  itemToDelete,
  setShowDeleteConfirmation,
  fetchUsers,
  fetchVpsList,
}: any) => {
  const handleDeleteItem = async () => {
    try {
      let endpoint = "";
      let payload = {};
      if (itemToDelete.type === "user") {
        endpoint = "/api/uvapi/users/delete";
        payload = { email: itemToDelete.id };
      } else {
        endpoint = "/api/uvapi/vps/delete";
        payload = { vpsId: itemToDelete.id };
      }

      const response = await makeRequest("POST", endpoint, payload);
      if (itemToDelete.type === "user") fetchUsers();
      else fetchVpsList();
      setShowDeleteConfirmation(false);
    } catch (error) {
      console.error(`Error deleting ${itemToDelete.type}:`, error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-gray-800 p-6 w-full max-w-md rounded-lg border border-gray-300">
        <h2 className="text-xl font-bold mb-4 text-gray-200">Confirm Delete</h2>
        <p className="text-white mb-4">
          Are you sure you want to delete this {itemToDelete?.type}? This action
          cannot be undone.
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setShowDeleteConfirmation(false)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteItem}
            className="px-4 py-2 bg-red-500 text-white rounded-lg"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
