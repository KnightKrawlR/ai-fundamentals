import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Logo from './Logo';
import Button from '../ui/Button';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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

  // Navigation links to existing HTML pages
  const navLinks = [
    { name: 'Learning Paths', href: 'learning-paths.html' },
    { name: 'AI Tools', href: 'ai-tools.html' },
    { name: 'Game Plans', href: 'my-game-plan.html' },
    { name: 'My Games', href: 'my-games.html' }
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
          <a href="index.html">
            <Logo />
          </a>
          
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
            <a href="login.html">
              <Button 
                variant={scrolled ? "ghost" : "tertiary"} 
                size="small"
                className={scrolled ? "text-purple-800" : "text-white border-white hover:bg-purple-800"}
              >
                Sign In
              </Button>
            </a>
            <a href="account.html">
              <Button 
                variant={scrolled ? "primary" : "tertiary"} 
                size="small"
                className={!scrolled && "border-white text-white hover:bg-purple-800"}
              >
                Account
              </Button>
            </a>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button 
                className={`p-2 rounded-md focus:outline-none ${
                  scrolled ? 'text-purple-800' : 'text-white'
                }`}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {mobileMenuOpen ? (
                    <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  ) : (
                    <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white shadow-lg rounded-b-lg p-4">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <a 
                  key={link.name}
                  href={link.href}
                  className="text-purple-800 font-medium hover:text-purple-600 transition-colors"
                >
                  {link.name}
                </a>
              ))}
              <div className="border-t border-gray-200 pt-4 mt-2">
                <a href="login.html" className="block text-purple-700 font-medium hover:text-purple-600 transition-colors mb-3">
                  Sign In
                </a>
                <a href="account.html" className="block bg-purple-700 text-white px-4 py-2 rounded-md text-center font-medium hover:bg-purple-800 transition-colors">
                  Account
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar; 