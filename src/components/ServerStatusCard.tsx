import React from "react";

// Define the expected type for serverStatus
interface ServerStatus {
  API: string; // or 'Online' | 'Offline' for stricter typing
}

interface ServerStatusCardProps {
  serverStatus: ServerStatus;
}

const ServerStatusCard: React.FC<ServerStatusCardProps> = ({
  serverStatus,
}) => (
  <div className="p-4 md:p-6 rounded-lg bg-opacity-50 border backdrop-blur-md border-white-200">
    <h3 className="text-lg md:text-xl font-semibold mb-4 dark:text-gray-200">
      Server Status
    </h3>
    <div className="space-y-2">
      {Object.entries(serverStatus).map(([server, status]) => (
        <div key={server} className="flex justify-between items-center">
          <span className="dark:text-gray-300 text-gray-700">{server}</span>
          {/* Ensure the status is a string that can be rendered */}
          <span
            className={`px-2 py-1 rounded-full text-xs ${status === "Online" ? "bg-green-500" : "bg-red-500"}`}
          >
            {String(status)}{" "}
            {/* Convert status to string if it's potentially another type */}
          </span>
        </div>
      ))}
    </div>
  </div>
);

export default ServerStatusCard;
