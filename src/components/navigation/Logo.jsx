import React from 'react';
import { motion } from 'framer-motion';

const Logo = () => {
  return (
    <motion.div 
      className="flex items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-10 h-10 bg-purple-700 rounded-full flex items-center justify-center mr-2">
        <span className="text-white font-bold text-xl">AI</span>
      </div>
      <span className="text-xl font-bold text-purple-800 dark:text-white">AI Fundamentals</span>
    </motion.div>
  );
};

export default Logo; 