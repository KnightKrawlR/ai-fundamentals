import React from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';

const HoverEffect = ({ children, scale = 1.05, rotate = 0, className = '' }) => {
  const hoverVariants = {
    initial: { 
      scale: 1,
      rotate: 0,
      transition: { 
        type: 'spring',
        stiffness: 300
      }
    },
    hover: { 
      scale: scale,
      rotate: rotate,
      transition: { 
        type: 'spring',
        stiffness: 300
      }
    }
  };

  return (
    <motion.div
      className={className}
      variants={hoverVariants}
      initial="initial"
      whileHover="hover"
    >
      {children}
    </motion.div>
  );
};

export default HoverEffect;
