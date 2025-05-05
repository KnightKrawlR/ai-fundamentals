import React from 'react';
import { useMediaQuery } from 'react-responsive';

const useResponsive = () => {
  // Define responsive breakpoints
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1199 });
  const isDesktop = useMediaQuery({ minWidth: 1200 });
  
  // Return responsive state
  return {
    isMobile,
    isTablet,
    isDesktop,
    screenSize: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'
  };
};

export default useResponsive; 