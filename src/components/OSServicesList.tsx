import React from "react";

interface OSService {
  name: string;
  description: string;
  icon: string;
}

interface OSServicesListProps {
  osList: OSService[];
}

const OSServicesList: React.FC<OSServicesListProps> = ({ osList }) => (
  <div className="p-4 md:p-6 rounded-lg bg-opacity-50 border backdrop-blur-md border-gray-500">
    <h3 className="text-lg md:text-xl font-semibold mb-4 text-gray-200">
      Available OS & Services
    </h3>
    <ul className="space-y-2">
      {osList.map((os) => (
        <li key={os.name} className="flex items-center">
          <img
            src={`https://cdn.jsdelivr.net/gh/unknownpersonog/unknownvps-client@assets/png/${os.icon}`}
            alt={os.name}
            className="w-5 h-5 md:w-6 md:h-6 mr-2"
          />
          <div>
            <span className="text-gray-300">{os.name}</span>
            <p className="text-xs text-gray-400">{os.description}</p>
          </div>
        </li>
      ))}
    </ul>
  </div>
);

export default OSServicesList;
