import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Visual feature card with icon, title, and description
const FeatureCard = ({ icon, title, description, index }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
    className="bg-gradient-to-br from-purple-900/70 to-indigo-900/70 backdrop-blur-md p-4 sm:p-6 rounded-xl border border-purple-500/30 shadow-lg hover:shadow-purple-500/20 hover:scale-[1.02] transition-all duration-300"
  >
    <div className="text-2xl sm:text-3xl mb-3 sm:mb-4 bg-gradient-to-br from-purple-400 to-pink-300 inline-block p-2 sm:p-3 rounded-full">{icon}</div>
    <h3 className="text-white text-lg sm:text-xl font-bold mb-2 sm:mb-3">{title}</h3>
    <p className="text-purple-200 text-sm sm:text-base leading-relaxed">{description}</p>
  </motion.div>
);

const FeatureModal = ({ setIsOpen }) => {
  const modalRef = useRef(null);
  
  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);
  
  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setIsOpen]);
  
  // Features data
  const features = [
    {
      icon: '🚀',
      title: 'Build Your AI GamePlan',
      description: 'Create a customized implementation strategy for your business. Our AI analyzes your unique challenges and provides a step-by-step roadmap to integrate AI into your operations.'
    },
    {
      icon: '📚',
      title: 'Interactive Learning Courses',
      description: 'Access a comprehensive library of courses tailored to your knowledge level. From AI fundamentals to advanced implementation, learn at your own pace with interactive modules.'
    },
    {
      icon: '📊',
      title: 'Track Your Progress',
      description: 'Monitor your implementation journey with analytics and dashboards. Measure the impact of AI on your business and adjust your strategy based on real-time insights.'
    }
  ];
  
  return (
    <AnimatePresence>
      <div className="fixed inset-0 flex items-start sm:items-center justify-center z-[9999] bg-black/70 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="bg-gradient-to-br from-[#2D1B54] to-[#3D2866] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden relative my-4 sm:my-6"
          style={{ maxHeight: 'calc(100vh - 32px)' }}
        >
          {/* Background pattern */}
          <div 
            className="absolute inset-0 opacity-10 z-0 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 20% 30%, #8a63d2 0%, transparent 50%), radial-gradient(circle at 80% 70%, #5d4a9c 0%, transparent 50%)',
              backgroundSize: '100% 100%'
            }}
          ></div>
          
          {/* Header - Fixed at top */}
          <div className="sticky top-0 p-4 sm:p-6 border-b border-purple-500/30 flex justify-between items-center relative z-10 backdrop-blur-md bg-[#2D1B54]/80">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center">
                <span className="bg-gradient-to-r from-purple-400 to-pink-300 text-transparent bg-clip-text">AI Fundamentals</span>
                <span className="ml-2 bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded-full">Beta</span>
              </h2>
              <p className="text-purple-300 text-sm mt-1">Building the future of AI implementation</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-purple-300 hover:text-white transition-colors rounded-full p-1 hover:bg-purple-800/30"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Content - Scrollable */}
          <div className="p-4 sm:p-8 relative z-10 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
            <motion.h3 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-lg sm:text-xl text-center font-bold text-white mb-6 sm:mb-8"
            >
              Discover how AI Fundamentals helps you implement artificial intelligence effectively
            </motion.h3>
            
            {/* Feature grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {features.map((feature, index) => (
                <FeatureCard key={index} {...feature} index={index} />
              ))}
            </div>
            
            {/* Success stats */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8 mt-6 sm:mt-10"
            >
              <div className="bg-purple-800/20 p-3 sm:p-4 rounded-lg text-center">
                <div className="text-white text-xl sm:text-3xl font-bold">500+</div>
                <div className="text-purple-300 text-xs sm:text-sm">AI Strategies</div>
              </div>
              <div className="bg-purple-800/20 p-3 sm:p-4 rounded-lg text-center">
                <div className="text-white text-xl sm:text-3xl font-bold">50+</div>
                <div className="text-purple-300 text-xs sm:text-sm">Learning Courses</div>
              </div>
              <div className="bg-purple-800/20 p-3 sm:p-4 rounded-lg text-center">
                <div className="text-white text-xl sm:text-3xl font-bold">24/7</div>
                <div className="text-purple-300 text-xs sm:text-sm">AI Support</div>
              </div>
              <div className="bg-purple-800/20 p-3 sm:p-4 rounded-lg text-center">
                <div className="text-white text-xl sm:text-3xl font-bold">93%</div>
                <div className="text-purple-300 text-xs sm:text-sm">Success Rate</div>
              </div>
            </motion.div>
            
            {/* Testimonial */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="bg-purple-900/30 p-4 sm:p-6 rounded-xl border border-purple-500/20 mb-6 sm:mb-8"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="text-2xl sm:text-3xl">💬</div>
                <div>
                  <p className="text-purple-200 text-sm sm:text-base italic mb-2 sm:mb-3">"AI Fundamentals transformed how we approach artificial intelligence. The game plans and learning modules helped us implement AI across our organization in a structured, methodical way."</p>
                  <div className="text-white text-sm sm:text-base font-medium">Sarah J. - Chief Innovation Officer</div>
                </div>
              </div>
            </motion.div>
            
            {/* Bottom CTA */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-6 sm:mt-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsOpen(false)}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 rounded-full text-white font-medium shadow-lg shadow-purple-700/20 flex items-center justify-center"
              >
                <span>Start Your AI Journey</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </motion.button>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-purple-300 hover:text-white transition-colors"
              >
                Explore Later
              </button>
            </div>
            
            {/* Scroll indicator */}
            <div className="flex justify-center mt-6 pb-1 sm:hidden animate-pulse">
              <svg width="36" height="12" viewBox="0 0 36 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 12L0.679491 0L35.3205 0L18 12Z" fill="rgba(196, 138, 247, 0.5)" />
              </svg>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default FeatureModal; 