import React, { useState } from "react";
import { makeRequest } from "@/functions/api/makeRequest";

const EditVpsModal = ({ vps, setShowEditVpsModal, fetchVpsList }: any) => {
  const [updatedVps, setUpdatedVps] = useState(vps);

  const handleEditVps = async () => {
    try {
      await makeRequest(
        "PUT",
        `/api/uvapi/vps/edit/${updatedVps.id}`,
        updatedVps,
      );
      fetchVpsList();
      setShowEditVpsModal(false);
    } catch (error) {
      console.error("Error editing VPS:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-gray-800 p-6 w-full max-w-md rounded-lg border border-purple-500">
        <h2 className="text-xl font-bold mb-4 text-purple-300">Edit VPS</h2>
        {["name", "os", "port", "owner", "plan", "user", "ip"].map((field) => (
          <input
            key={field}
            name={field}
            value={updatedVps[field]}
            onChange={(e) =>
              setUpdatedVps({ ...updatedVps, [field]: e.target.value })
            }
            className="w-full px-4 py-2 backdrop-blur-lg bg-opacity-50 bg-gray-600 text-white border border-gray-700 rounded-lg"
          />
        ))}
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={() => setShowEditVpsModal(false)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleEditVps}
            className="px-4 py-2 bg-green-500 text-white rounded-lg"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditVpsModal;
