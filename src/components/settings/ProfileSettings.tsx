
import React from 'react';
import { useSession } from 'next-auth/react';
import SettingsCard from './SettingsCard';
import Image from 'next/image';
import { useApiInfo } from '@/context/ApiInfoProvider';

const ProfileSettings = () => {
  const { data: session, status } = useSession(); // Session for authentication
  const { userData, loading: userDataLoading, error } = useApiInfo(); // userData from context

  return (
    <SettingsCard
      title="Account Information"
      description={`Your ${userData.data.method}-linked account details`}
    >
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
           
          {session?.user?.image && (
            <div className="border-2 border-pink-500 rounded-full p-1">
              <Image
                src={session.user.image}
                alt="Profile"
                width={64}
                height={64}
                className="rounded-full"
              />
            </div>
          )}
          <div>
            <h4 className="text-pink-300 font-medium">{session?.user?.name}</h4>
            <p className="text-gray-400 text-sm">{session?.user?.email}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="bg-black/30 p-4 rounded-lg border border-gray-700">
            <h5 className="text-gray-300 text-sm mb-2">Authentication</h5>
            <p className="text-pink-300">{userData.data.method} Sign-in</p>
          </div>
          <div className="bg-black/30 p-4 rounded-lg border border-gray-700">
            <h5 className="text-gray-300 text-sm mb-2">Account Type</h5>
            <p className="text-pink-300">Standard User</p>
          </div>
        </div>
      </div>
    </SettingsCard>
  );
};

export default ProfileSettings;
