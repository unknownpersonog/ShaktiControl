import React from "react";

interface Activity {
  action: string;
  time: string;
}

interface ActivityListProps {
  activities: Activity[];
}

const ActivityList: React.FC<ActivityListProps> = ({ activities }) => (
  <div className="p-4 md:p-6 rounded-lg bg-opacity-50 border backdrop-blur-md border-blue-500 col-span-1 lg:col-span-2">
    <h3 className="text-lg md:text-xl font-semibold mb-4 text-teal-300">
      Recent Activity
    </h3>
    <ul className="space-y-2">
      {activities.map((activity, index) => (
        <li
          key={index}
          className="flex justify-between items-center py-2 border-b border-gray-700"
        >
          <span className="text-gray-300">{activity.action}</span>
          <span className="text-sm text-gray-500">{activity.time}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default ActivityList;
