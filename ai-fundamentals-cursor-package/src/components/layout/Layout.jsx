import React from 'react';
import useResponsive from '../../hooks/useResponsive';

const Layout = ({ children }) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  return (
    <div className="min-h-screen flex flex-col w-full">
      <main className="flex-grow w-full">
        {children}
      </main>
    </div>
  );
};

export default Layout;
