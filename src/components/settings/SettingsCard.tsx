
import { useApiInfo } from '@/context/ApiInfoProvider';
import { useSession } from 'next-auth/react';
import React from 'react';

interface SettingsCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const SettingsCard: React.FC<SettingsCardProps> = ({ title, description, children }) => {
  const { data: session, status } = useSession(); // Session for authentication
  const { userData, loading: userDataLoading, error } = useApiInfo(); // userData from context

  return (
    <div className="p-6 rounded-lg bg-opacity-50 border backdrop-blur-md border-gray-500 shadow shadow-gray-500 hover:shadow-white/20 transition-all duration-300">
      <h3 className="text-xl font-semibold mb-2 text-white-300">{title}</h3>
      <p className="text-gray-300 mb-4 text-sm">{description}</p>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

export default SettingsCard;
