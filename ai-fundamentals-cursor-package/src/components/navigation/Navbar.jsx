import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Logo from './Logo';
import Button from '../ui/Button';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  // Navigation links
  const navLinks = [
    { name: 'Learning', href: '#' },
    { name: 'AI Tools', href: '#' },
    { name: 'Premium', href: '#' }
  ];

  return (
    <motion.nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md text-purple-900' : 'bg-transparent text-white'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Logo />
          
          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a 
                key={link.name}
                href={link.href}
                className={`font-medium hover:text-purple-400 transition-colors ${
                  scrolled ? 'text-purple-800' : 'text-white'
                }`}
              >
                {link.name}
              </a>
            ))}
          </div>
          
          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <Button 
              variant={scrolled ? "ghost" : "tertiary"} 
              size="small"
              className={scrolled ? "text-purple-800" : "text-white border-white hover:bg-purple-800"}
            >
              Sign In
            </Button>
            <Button 
              variant={scrolled ? "primary" : "tertiary"} 
              size="small"
              className={!scrolled && "border-white text-white hover:bg-purple-800"}
            >
              Sign Up
            </Button>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button 
                className={`p-2 rounded-md focus:outline-none ${
                  scrolled ? 'text-purple-800' : 'text-white'
                }`}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
