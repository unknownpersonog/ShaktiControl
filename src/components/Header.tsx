import React from "react";
import Notification from "./ui/Notification";

interface HeaderProps {
  page: string;
}

const Header: React.FC<HeaderProps> = ({ page }) => (
  <header className="flex justify-between items-center mb-4 md:mb-8 relative z-10">
    <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white-300">
      {page}
    </h1>
    <Notification />
  </header>
);

export default Header;
