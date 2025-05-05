import React from 'react';
import { motion } from 'framer-motion';

const ScrollAnimation = ({ children, type = 'fade', delay = 0, className = '' }) => {
  // Animation variants
  const variants = {
    fade: {
      hidden: { opacity: 0, y: 20 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { 
          duration: 0.6,
          delay: delay * 0.2
        }
      }
    },
    slideUp: {
      hidden: { opacity: 0, y: 50 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { 
          duration: 0.8,
          delay: delay * 0.2
        }
      }
    },
    slideIn: {
      hidden: { opacity: 0, x: -50 },
      visible: { 
        opacity: 1, 
        x: 0,
        transition: { 
          duration: 0.8,
          delay: delay * 0.2
        }
      }
    },
    scale: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { 
        opacity: 1, 
        scale: 1,
        transition: { 
          duration: 0.6,
          delay: delay * 0.2
        }
      }
    }
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={variants[type]}
    >
      {children}
    </motion.div>
  );
};

export default ScrollAnimation;
