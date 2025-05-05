import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  onClick, 
  className = '',
  ...props 
}) => {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-300 flex items-center justify-center';
  
  const variantStyles = {
    primary: 'bg-purple-700 hover:bg-purple-800 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg',
    tertiary: 'bg-transparent border-2 border-purple-700 text-purple-700 hover:bg-purple-50',
    ghost: 'bg-transparent text-purple-700 hover:bg-purple-50'
  };
  
  const sizeStyles = {
    small: 'text-sm py-2 px-4',
    medium: 'text-base py-3 px-6',
    large: 'text-lg py-4 px-8'
  };
  
  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.98 }
  };

  return (
    <motion.button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      onClick={onClick}
      whileHover="hover"
      whileTap="tap"
      variants={buttonVariants}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button; 