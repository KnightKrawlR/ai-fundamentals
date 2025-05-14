import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Logo from './Logo';
import Button from '../ui/Button';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      // Set scrolled to true even with minimal scroll to ensure consistent appearance
      setScrolled(window.scrollY > 5);
    };
    
    // Call handleScroll initially to set the state correctly on first render
    handleScroll();
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Features', href: '#features' },
    { label: 'Game Plan', href: '/my-game-plan.html' },
    { label: 'Resources', href: '#resources' },
  ];
  
  return (
    <motion.header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/90 backdrop-blur-md shadow-lg text-gray-800' 
          : 'bg-transparent text-white'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Logo color={scrolled ? 'dark' : 'light'} />
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {/* Nav Links */}
          <ul className="flex space-x-8">
            {navLinks.map((link, index) => (
              <li key={index}>
                <a 
                  href={link.href}
                  className={`font-medium text-base hover:text-purple-500 transition-colors ${
                    !scrolled && 'hover:text-purple-200'
                  }`}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <Button 
              variant={scrolled ? "secondary" : "tertiary"} 
              size="small"
            >
              Sign In
            </Button>
            <Button 
              variant="primary" 
              size="small"
            >
              Get Started
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg 
            className={`w-6 h-6 ${scrolled ? 'text-gray-800' : 'text-white'}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div 
          className={`md:hidden container mx-auto px-4 py-4 pb-6 ${
            scrolled ? 'bg-white text-gray-800' : 'bg-purple-900 text-white'
          }`}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          <ul className="flex flex-col space-y-4">
            {navLinks.map((link, index) => (
              <li key={index}>
                <a 
                  href={link.href}
                  className="font-medium text-lg block py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex flex-col space-y-3 mt-6">
            <Button 
              variant={scrolled ? "secondary" : "tertiary"} 
              size="medium"
              className="w-full"
            >
              Sign In
            </Button>
            <Button 
              variant="primary" 
              size="medium"
              className="w-full"
            >
              Get Started
            </Button>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
};

export default Navbar;
