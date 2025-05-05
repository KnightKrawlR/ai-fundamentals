import React, { useEffect, useState } from 'react';

const TransitionEffect = ({ children, direction = 'up', delay = 0, duration = 0.5, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay * 1000);
    
    return () => clearTimeout(timer);
  }, [delay]);
  
  // Define CSS classes based on direction
  const getTransitionClass = () => {
    if (!isVisible) return 'opacity-0';
    
    switch(direction) {
      case 'up':
        return 'animate-fade-up';
      case 'down':
        return 'animate-fade-down';
      case 'left':
        return 'animate-fade-left';
      case 'right':
        return 'animate-fade-right';
      case 'scale':
        return 'animate-fade-scale';
      default:
        return 'animate-fade-up';
    }
  };
  
  const transitionStyle = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'none' : getInitialTransform(),
    transition: `opacity ${duration}s, transform ${duration}s`,
    transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)'
  };
  
  function getInitialTransform() {
    switch(direction) {
      case 'up': return 'translateY(50px)';
      case 'down': return 'translateY(-50px)';
      case 'left': return 'translateX(50px)';
      case 'right': return 'translateX(-50px)';
      case 'scale': return 'scale(0.8)';
      default: return 'translateY(50px)';
    }
  }
  
  return (
    <div className={className} style={transitionStyle}>
      {children}
    </div>
  );
};

export default TransitionEffect; 