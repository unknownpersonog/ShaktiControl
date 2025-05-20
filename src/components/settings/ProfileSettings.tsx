import React from 'react';
import { useSession } from 'next-auth/react';
import SettingsCard from './SettingsCard';
import Image from 'next/image';
import { useApiInfo } from '@/context/ApiInfoProvider';

const ProfileSettings = () => {
  const { data: session } = useSession();
  const { userData } = useApiInfo();
  const method = (session?.user?.image || "").includes("discord") ? "Discord" : "Google";

  return (
    <div className="w-full border rounded-lg p-4 border-gray-600 shadow-md">
      <h2 className="text-lg font-semibold text-white mb-4">Account Information</h2>

      <div className="flex items-center space-x-4 mb-6 bg-white/5 rounded border border-gray-500 p-2">
        {session?.user?.image && (
          <div className="border-2 border-gray-200 rounded-full p-1">
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
          <h4 className="text-white font-medium">{session?.user?.name}</h4>
          <p className="text-gray-400 text-sm">{session?.user?.email}</p>
        </div>
      </div>

      <ul className="grid grid-cols-2 gap-4">
        <li className="p-3 border border-gray-500 rounded bg-white/5">
          <h5 className="text-gray-400 text-sm mb-1">Authentication</h5>
          <p className="text-white text-sm">{userData.data.method} Sign-in</p>
        </li>
        <li className="p-3 border border-gray-500 rounded bg-white/5">
          <h5 className="text-gray-400 text-sm mb-1">Account Type</h5>
          <p className="text-white text-sm">Standard User</p>
        </li>
      </ul>
    </div>
  );
};

export default ProfileSettings;