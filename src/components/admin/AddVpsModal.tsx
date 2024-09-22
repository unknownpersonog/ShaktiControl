import React, { useState } from "react";
import { makeRequest } from "@/functions/api/makeRequest";

type VpsData = {
  vps_name: string;
  vps_os: string;
  vps_pass: string;
  vps_user: string;
  vps_ip: string;
  vps_plan: string;
};

const AddVpsModal = ({ setShowAddVpsModal, fetchVpsList }: any) => {
  const [newVpsData, setNewVpsData] = useState<VpsData>({
    vps_name: "",
    vps_os: "",
    vps_pass: "",
    vps_user: "",
    vps_ip: "",
    vps_plan: "",
  });

  const [error, setError] = useState<string | null>(null);

  const handleVpsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewVpsData({ ...newVpsData, [name]: value });
  };

  const handleAddVps = async () => {
    try {
      const response = await makeRequest(
        "POST",
        "/api/uvapi/vps/add",
        newVpsData,
      );
      if (response && response.data) {
        console.log("VPS added successfully:", response.data);
        fetchVpsList(); // Refresh the VPS list
      }
      setShowAddVpsModal(false);
      setNewVpsData({
        vps_name: "",
        vps_os: "",
        vps_pass: "",
        vps_user: "",
        vps_ip: "",
        vps_plan: "",
      });
    } catch (err) {
      console.error("Error adding VPS:", err);
      setError("Failed to add VPS");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-gray-800 p-6 w-full max-w-md rounded-lg border border-purple-500">
        <h2 className="text-xl font-bold mb-4 text-purple-300">Add New VPS</h2>
        {error && <p className="text-red-500">{error}</p>}
        <div className="space-y-2">
          {[
            "vps_name",
            "vps_os",
            "vps_pass",
            "vps_user",
            "vps_ip",
            "vps_plan",
          ].map((field) => (
            <input
              key={field}
              name={field}
              placeholder={field.replace("_", " ").toUpperCase()}
              value={newVpsData[field as keyof VpsData]}
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
  );
};

export default AddVpsModal;
