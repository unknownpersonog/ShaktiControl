import React from 'react';
import { User } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';

interface HeaderProps {
  session: { name: string };
  userData: { data: { email: string; unid: string; admin: string } };
  showProfile: boolean;
  setShowProfile: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header: React.FC<HeaderProps> = ({ session, userData, showProfile, setShowProfile }) => (
  <header className="flex justify-between items-center mb-4 md:mb-8 relative z-10">
    <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-purple-300">Dashboard</h1>
    <div className="relative">
      <div
        className="flex items-center space-x-2 bg-blue-800 bg-opacity-50 backdrop-blur-md p-2 rounded-full cursor-pointer hover:bg-gray-700 transition-colors"
        onClick={() => setShowProfile(!showProfile)}
      >
        <User className="text-purple-300" />
      </div>

      {showProfile && (
        <ProfileDropdown session={session} userData={userData} />
      )}
    </div>
  </header>
);

export default Header;
