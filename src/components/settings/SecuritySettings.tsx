
import React from 'react';
import SettingsCard from './SettingsCard';
import { Shield, Lock, Bell } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useApiInfo } from '@/context/ApiInfoProvider';

const SecuritySettings = () => {
  const { data: session, status } = useSession(); // Session for authentication
  const { userData, loading: userDataLoading, error } = useApiInfo(); // userData from context
  const method = (session?.user?.image || "").includes("discord") ? "Discord" : "Google";
  return (
    <SettingsCard
      title="Security Overview"
      description="Your account security status"
    >
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 p-4 rounded-lg border border-pink-500/30">
          <div className="flex items-center space-x-3">
            <Shield className="text-pink-400" />
            <span className="text-white"> {method} Security Protection Active</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-3 bg-black/30 p-4 rounded-lg border border-gray-700">
            <Lock className="text-gray-400" />
            <div>
              <h4 className="text-white text-sm">2FA Status</h4>
              <p className="text-gray-400 text-xs">Via {userData.data.method}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 bg-black/30 p-4 rounded-lg border border-gray-700">
            <Bell className="text-gray-400" />
            <div>
              <h4 className="text-white text-sm">Notifications</h4>
              <p className="text-gray-400 text-xs">Email Alerts Active</p>
            </div>
          </div>
        </div>
        {(method === userData.data.method) ? null : "You have logged in using a different method than your signup. This will be fixed in future updates"}
      </div>
    </SettingsCard>
  );
};

export default SecuritySettings;
