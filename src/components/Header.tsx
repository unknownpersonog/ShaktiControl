import React from "react";

interface HeaderProps {
  page: string;
}

const Header: React.FC<HeaderProps> = ({ page }) => (
  <header className="flex justify-between items-center mb-4 md:mb-8 relative z-10">
    <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-purple-300">
      {page}
    </h1>
  </header>
);

export default Header;
