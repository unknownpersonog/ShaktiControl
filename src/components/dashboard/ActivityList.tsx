import React from "react";
import { Clock } from "lucide-react";

interface Activity {
  action: string;
  time: string;
}

interface ActivityListProps {
  activities: Activity[];
}

const ActivityList: React.FC<ActivityListProps> = ({ activities }) => (
  <div className="p-4 md:p-6 rounded-lg bg-opacity-50 border backdrop-blur-md border-gray-500 col-span-1 lg:col-span-2 shadow shadow-gray-500">
    <h3 className="text-lg md:text-xl font-semibold mb-4 text-gray-200">
      Recent Activity
    </h3>
    <ul className="space-y-3 max-h-64 overflow-y-auto pr-1">
      {activities.length === 0 ? (
        <li className="text-gray-500 text-sm italic">No recent activity.</li>
      ) : (
        activities.map((activity, index) => (
          <li
            key={index}
            className="flex justify-between items-center py-2 border-b border-gray-700"
          >
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300">{activity.action}</span>
            </div>
            <span className="text-sm text-gray-500 whitespace-nowrap">
              {activity.time}
            </span>
          </li>
        ))
      )}
    </ul>
  </div>
);

export default ActivityList;
