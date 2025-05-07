import React from 'react';
import useResponsive from '../../hooks/useResponsive';

const Layout = ({ children }) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  return (
    <div className="min-h-screen flex flex-col">
      <main className={`flex-grow ${isMobile ? 'px-4' : isTablet ? 'px-6' : 'px-8'}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
