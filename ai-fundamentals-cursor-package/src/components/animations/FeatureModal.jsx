import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-purple-900/50 backdrop-blur-md p-5 rounded-lg border border-purple-500/30 shadow-lg hover:shadow-xl transition-all">
    <div className="text-purple-300 text-2xl mb-3">{icon}</div>
    <h3 className="text-white text-lg font-semibold mb-2">{title}</h3>
    <p className="text-purple-200 text-sm leading-relaxed">{description}</p>
  </div>
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
      title: 'Build your AI GamePlan',
      description: 'Create a customized implementation strategy based on your specific needs. Our AI analyzes your requirements and generates step-by-step guidance.'
    },
    {
      icon: '📚',
      title: 'Learn with Interactive AI Content',
      description: 'Access dynamic learning materials that adapt to your knowledge level. Practice with interactive exercises and receive real-time feedback.'
    },
    {
      icon: '📊',
      title: 'Track Progress and Refine Strategy',
      description: 'Monitor your implementation journey with analytics and insights. Adjust your approach based on data-driven recommendations.'
    }
  ];
  
  return (
    <AnimatePresence>
      <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black/50 backdrop-blur-sm p-4">
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="bg-gradient-to-br from-[#2D1B54] to-[#3D2866] w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b border-purple-500/30 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">AI Fundamentals Platform</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-purple-300 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6">
            <p className="text-purple-200 mb-6">
              Discover how AI Fundamentals can revolutionize your approach to artificial intelligence. Our platform provides the tools and resources you need to succeed.
            </p>
            
            {/* Feature grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                >
                  <FeatureCard {...feature} />
                </motion.div>
              ))}
            </div>
            
            {/* Bottom CTA */}
            <div className="flex justify-center mt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsOpen(false)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full text-white font-medium shadow-lg"
              >
                Start Your Journey
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default FeatureModal; 