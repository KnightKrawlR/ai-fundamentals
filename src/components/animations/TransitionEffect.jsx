import React from 'react';
import { motion } from 'framer-motion';

const TransitionEffect = ({ children, direction = 'up', delay = 0, duration = 0.5, className = '' }) => {
  // Define different transition effects based on direction
  const variants = {
    up: {
      hidden: { y: 50, opacity: 0 },
      visible: { 
        y: 0, 
        opacity: 1,
        transition: {
          duration: duration,
          delay: delay,
          ease: [0.25, 0.1, 0.25, 1.0]
        }
      }
    },
    down: {
      hidden: { y: -50, opacity: 0 },
      visible: { 
        y: 0, 
        opacity: 1,
        transition: {
          duration: duration,
          delay: delay,
          ease: [0.25, 0.1, 0.25, 1.0]
        }
      }
    },
    left: {
      hidden: { x: 50, opacity: 0 },
      visible: { 
        x: 0, 
        opacity: 1,
        transition: {
          duration: duration,
          delay: delay,
          ease: [0.25, 0.1, 0.25, 1.0]
        }
      }
    },
    right: {
      hidden: { x: -50, opacity: 0 },
      visible: { 
        x: 0, 
        opacity: 1,
        transition: {
          duration: duration,
          delay: delay,
          ease: [0.25, 0.1, 0.25, 1.0]
        }
      }
    },
    scale: {
      hidden: { scale: 0.8, opacity: 0 },
      visible: { 
        scale: 1, 
        opacity: 1,
        transition: {
          duration: duration,
          delay: delay,
          ease: [0.25, 0.1, 0.25, 1.0]
        }
      }
    }
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={variants[direction]}
    >
      {children}
    </motion.div>
  );
};

export default TransitionEffect; 