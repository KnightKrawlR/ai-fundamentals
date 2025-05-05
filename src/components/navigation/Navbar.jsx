import React, { useState, useEffect } from 'react';

const Logo = () => (
  <a href="/" className="flex items-center">
    <div className="relative w-10 h-10">
      <div className="absolute w-full h-full rounded-full bg-purple-700 animate-float"></div>
      <div className="absolute w-8 h-8 left-1 top-1 rounded-full bg-purple-500 animate-float" style={{animationDelay: '0.5s'}}></div>
      <div className="absolute w-6 h-6 left-2 top-2 rounded-full bg-purple-300 animate-float" style={{animationDelay: '1s'}}></div>
    </div>
    <span className={`ml-2 text-2xl font-bold`}>AI Fundamentals</span>
  </a>
);

const Button = ({ children, variant = "primary", size = "medium", className = "", ...props }) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-md focus:outline-none transition-colors";
  
  const variants = {
    primary: "bg-purple-700 text-white hover:bg-purple-800",
    secondary: "bg-purple-100 text-purple-700 hover:bg-purple-200",
    tertiary: "bg-transparent border-2 hover:bg-purple-700",
    ghost: "bg-transparent hover:bg-purple-100 text-purple-700"
  };
  
  const sizes = {
    small: "text-sm py-1.5 px-3",
    medium: "text-base py-2 px-4",
    large: "text-lg py-2.5 px-6"
  };
  
  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

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

  // Navigation links
  const navLinks = [
    { name: 'Learning', href: '/learning.html' },
    { name: 'AI Tools', href: '/ai-tools.html' },
    { name: 'Premium', href: '/premium.html' }
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md text-purple-900' : 'bg-transparent text-white'
      }`}
      style={{
        transform: 'translateY(0)', 
        transition: 'transform 0.5s, background-color 0.3s, box-shadow 0.3s'
      }}
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
              onClick={() => window.location.href = '/login.html'}
            >
              Sign In
            </Button>
            <Button 
              variant={scrolled ? "primary" : "tertiary"} 
              size="small"
              className={!scrolled ? "border-white text-white hover:bg-purple-800" : ""}
              onClick={() => window.location.href = '/login.html?signup=true'}
            >
              Sign Up
            </Button>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button 
                className={`p-2 rounded-md focus:outline-none ${
                  scrolled ? 'text-purple-800' : 'text-white'
                }`}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div 
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          mobileMenuOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
        } ${scrolled ? 'bg-white text-purple-900' : 'bg-purple-800 text-white'}`}
      >
        <div className="px-4 py-2">
          {navLinks.map((link) => (
            <a 
              key={link.name}
              href={link.href}
              className="block py-2 px-4 font-medium hover:text-purple-400 transition-colors"
            >
              {link.name}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 