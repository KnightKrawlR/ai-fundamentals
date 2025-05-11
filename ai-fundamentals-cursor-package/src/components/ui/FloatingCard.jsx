import React from 'react';
import { motion } from 'framer-motion';

const FloatingCard = ({ 
  children, 
  className = '', 
  delay = 0,
  duration = 4,
  y = 15,
  ...props 
}) => {
  const floatingAnimation = {
    animate: {
      opacity: 1, // Added opacity here
      y: [0, -y, 0],
      transition: {
        duration: duration,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut',
        delay: delay
      }
    }
  };

  return (
    <motion.div
      className={`bg-white rounded-xl shadow-xl p-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      // Removed direct animate and transition props
      variants={floatingAnimation}
      animate="animate" // This will now use the 'animate' key from floatingAnimation
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default FloatingCard;

