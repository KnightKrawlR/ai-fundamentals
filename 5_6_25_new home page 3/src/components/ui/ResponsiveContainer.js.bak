import React from 'react';
import { useMediaQuery } from 'react-responsive';

const ResponsiveContainer = ({ children, className = '' }) => {
  // Define responsive breakpoints
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1199 });
  const isDesktop = useMediaQuery({ minWidth: 1200 });
  
  // Pass responsive state to children via context or props
  const responsiveProps = {
    isMobile,
    isTablet,
    isDesktop,
    screenSize: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'
  };
  
  return (
    <div className={`w-full mx-auto ${className}`}>
      {React.Children.map(children, child => {
        // Clone the child element and pass responsive props
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { ...responsiveProps });
        }
        return child;
      })}
    </div>
  );
};

export default ResponsiveContainer;
