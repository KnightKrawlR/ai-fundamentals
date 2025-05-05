import React, { useState } from 'react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-100 py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <a href="/" className="text-purple-700 font-bold text-xl">AI Fundamentals</a>
        </div>
        
        {/* Desktop menu */}
        <div className="hidden md:flex space-x-8">
          <a href="/learning-paths.html" className="text-gray-700 hover:text-purple-600 font-medium">Learning Paths</a>
          <a href="/my-games.html" className="text-gray-700 hover:text-purple-600 font-medium">My Games</a>
          <a href="/ai-tools.html" className="text-gray-700 hover:text-purple-600 font-medium">AI Tools</a>
          <a href="/my-game-plan.html" className="text-gray-700 hover:text-purple-600 font-medium">Game Plans</a>
        </div>
        
        {/* Auth buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <a href="/login.html" className="text-purple-600 hover:text-purple-700 font-medium">Log In</a>
          <a href="/account.html" className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md">
            Account
          </a>
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-700 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white py-4 px-4">
          <div className="flex flex-col space-y-4">
            <a href="/learning-paths.html" className="text-gray-700 hover:text-purple-600 font-medium">Learning Paths</a>
            <a href="/my-games.html" className="text-gray-700 hover:text-purple-600 font-medium">My Games</a>
            <a href="/ai-tools.html" className="text-gray-700 hover:text-purple-600 font-medium">AI Tools</a>
            <a href="/my-game-plan.html" className="text-gray-700 hover:text-purple-600 font-medium">Game Plans</a>
            <hr className="my-2" />
            <a href="/login.html" className="text-purple-600 hover:text-purple-700 font-medium">Log In</a>
            <a href="/account.html" className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md text-center">
              Account
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 