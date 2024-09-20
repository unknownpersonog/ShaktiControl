import React from 'react';

interface ProfileDropdownProps {
  session: { name: string };
  userData: { data: { email: string; unid: string } };
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ session, userData }) => (
  <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-gray-800 bg-opacity-50 backdrop-blur-md border border-gray-700 rounded-lg shadow-lg p-4 z-20">
    <div className="grid grid-cols-2 gap-2">
      <div className="text-gray-300">Name</div>
      <div className="text-green-400">{session.name}</div>
      <div className="text-gray-300">Email</div>
      <div className="text-blue-400 truncate" title={userData.data.email}>{userData.data.email}</div>
      <div className="text-gray-300">UnID</div>
      <div className="text-yellow-400">{userData.data.unid}</div>
      <div className="text-gray-300">Coins</div>
      <div className="text-cyan-400">{userData.data.coins || '0'}</div>
    </div>
  </div>
);

export default ProfileDropdown;
