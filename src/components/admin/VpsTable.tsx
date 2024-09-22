import { Edit2, Trash2 } from "lucide-react";

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

interface VpsTableProps {
  vpsList: VPS[];
  setSelectedVps: React.Dispatch<React.SetStateAction<VPS | null>>;
  setShowEditVpsModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowDeleteConfirmation: React.Dispatch<React.SetStateAction<boolean>>;
}

const VpsTable = ({
  vpsList,
  setSelectedVps,
  setShowEditVpsModal,
  setShowDeleteConfirmation,
}: VpsTableProps) => (
  <div className="p-6 rounded-lg border border-purple-500 bg-opacity-50 backdrop-blur-lg">
    <h2 className="text-xl font-bold mb-4 text-purple-300">VPS Management</h2>
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr>
            <th className="px-4 py-2">VPS Name</th>
            <th className="px-4 py-2">OS</th>
            <th className="px-4 py-2">Port</th>
            <th className="px-4 py-2">Owner</th>
            <th className="px-4 py-2">Plan</th>
            <th className="px-4 py-2">User</th>
            <th className="px-4 py-2">IP</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {vpsList.map((vps) => (
            <tr
              key={vps._id}
              className="border-t border-gray-700 hover:bg-gray-700"
            >
              <td className="px-4 py-2">{vps.name}</td>
              <td className="px-4 py-2">{vps.os}</td>
              <td className="px-4 py-2">{vps.port}</td>
              <td className="px-4 py-2">{vps.owner}</td>
              <td className="px-4 py-2">{vps.plan}</td>
              <td className="px-4 py-2">{vps.user}</td>
              <td className="px-4 py-2">{vps.ip}</td>
              <td className="px-4 py-2 flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedVps(vps);
                    setShowEditVpsModal(true);
                  }}
                  className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => {
                    setSelectedVps(vps);
                    setShowDeleteConfirmation(true);
                  }}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
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

export default VpsTable;
