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
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.2 }}
      variants={floatingAnimation}
      animate="animate"
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default FloatingCard;
