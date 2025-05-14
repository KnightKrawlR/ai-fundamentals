import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import HoverEffect from '../animations/HoverEffect';

const RobotCharacter = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [windowDimensions, setWindowDimensions] = useState({ 
    width: typeof window !== 'undefined' ? window.innerWidth : 0, 
    height: typeof window !== 'undefined' ? window.innerHeight : 0 
  });
  
  // For scroll tracking
  const { scrollY } = useScroll();
  const eyeYPosition = useTransform(scrollY, [0, 1000], [0, 15]);
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY
      });
    };
    
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Calculate eye movements
  const calculateEyePosition = () => {
    const centerX = windowDimensions.width / 2;
    const centerY = windowDimensions.height / 2;
    
    // Limit the eye movement range
    const maxMovement = 7;
    
    // Calculate x direction (left-right)
    let xOffset = ((mousePosition.x - centerX) / centerX) * maxMovement;
    // Calculate y direction (up-down) - combine with scroll position
    let yOffset = ((mousePosition.y - centerY) / centerY) * maxMovement;
    
    // Clamp values
    xOffset = Math.min(Math.max(xOffset, -maxMovement), maxMovement);
    yOffset = Math.min(Math.max(yOffset, -maxMovement), maxMovement);
    
    return {
      x: xOffset,
      y: yOffset
    };
  };
  
  const eyePosition = calculateEyePosition();
  
  return (
    <div className="mx-auto w-full max-w-xs md:max-w-sm relative">
      {/* Robot Head */}
      <motion.div 
        className="relative bg-gradient-to-b from-slate-200 to-slate-300 rounded-3xl p-6 shadow-lg border-4 border-slate-400"
        initial={{ y: 20 }}
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
      >
        {/* Antenna */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-12 flex flex-col items-center">
          <div className="w-1.5 h-8 bg-slate-400 rounded-full"></div>
          <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse"></div>
        </div>
        
        {/* Face Elements */}
        <div className="flex flex-col items-center">
          {/* Eyes Container */}
          <div className="flex justify-center space-x-8 mb-6">
            {/* Left Eye */}
            <div className="relative w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center">
              <motion.div 
                className="absolute w-7 h-7 bg-blue-400 rounded-full flex items-center justify-center"
                style={{ 
                  x: eyePosition.x,
                  y: useTransform(scrollY, [0, 500, 1000], [eyePosition.y, eyePosition.y + 5, eyePosition.y + 10])
                }}
              >
                <div className="w-3 h-3 bg-blue-700 rounded-full"></div>
              </motion.div>
            </div>
            
            {/* Right Eye */}
            <div className="relative w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center">
              <motion.div 
                className="absolute w-7 h-7 bg-blue-400 rounded-full flex items-center justify-center"
                style={{ 
                  x: eyePosition.x,
                  y: useTransform(scrollY, [0, 500, 1000], [eyePosition.y, eyePosition.y + 5, eyePosition.y + 10])
                }}
              >
                <div className="w-3 h-3 bg-blue-700 rounded-full"></div>
              </motion.div>
            </div>
          </div>
          
          {/* Mouth */}
          <motion.div 
            className="w-20 h-2 bg-slate-700 rounded-full mb-3"
            initial={{ width: 60 }}
            animate={{ width: [60, 80, 60] }}
            transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
          />
          
          {/* Speech Bubble */}
          <motion.div 
            className="relative mt-4 px-6 py-4 bg-purple-100 rounded-xl border border-purple-300 shadow-md"
            initial={{ scale: 0.95, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          >
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-purple-100 border-l border-t border-purple-300 rotate-45"></div>
            <p className="text-center text-purple-800 font-medium">
              What would you like to build today?
            </p>
          </motion.div>
        </div>
        
        {/* Robot Details */}
        <div className="absolute bottom-3 right-3 w-6 h-6 rounded-full bg-slate-500 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-green-400 animate-pulse"></div>
        </div>
        <div className="absolute bottom-3 left-3 w-6 h-6 rounded-full bg-slate-500 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-green-400 animate-pulse"></div>
        </div>
      </motion.div>
    </div>
  );
};

const GamePlanCreator = () => {
  return (
    <section className="py-24 bg-gradient-to-t from-white via-indigo-50 to-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-40 right-20 w-72 h-72 bg-indigo-200 opacity-20 rounded-full filter blur-[100px]"></div>
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-purple-200 opacity-30 rounded-full filter blur-[120px]"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="max-w-4xl mx-auto text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <span className="inline-block py-1 px-3 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium mb-4">
            Personalized Plan
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-purple-900 mb-6">
            Start Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-700">AI Journey</span> Now
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Create your personalized AI implementation game plan in just a few clicks
          </p>
        </motion.div>

        <motion.div 
          className="max-w-3xl mx-auto bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-indigo-100 relative"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true, margin: "-100px" }}
          whileHover={{ y: -5 }}
        >
          {/* Subtle gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
          
          <div className="p-10">
            {/* Robot character */}
            <div className="mb-10">
              <RobotCharacter />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                <HoverEffect scale={1.02}>
                  <div className="relative">
                    <select className="block w-full pl-4 pr-10 py-3.5 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl shadow-sm transition-all duration-300 hover:border-indigo-300">
                      <option>Select a topic</option>
                      <option>Machine Learning</option>
                      <option>Natural Language Processing</option>
                      <option>Computer Vision</option>
                      <option>Generative AI</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-purple-600">
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </HoverEffect>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Challenge</label>
                <HoverEffect scale={1.02}>
                  <div className="relative">
                    <select className="block w-full pl-4 pr-10 py-3.5 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl shadow-sm transition-all duration-300 hover:border-indigo-300">
                      <option>Select a challenge</option>
                      <option>Data Analysis</option>
                      <option>Automation</option>
                      <option>Prediction</option>
                      <option>Content Generation</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-purple-600">
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </HoverEffect>
              </div>
            </div>
            
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Type</label>
              <HoverEffect scale={1.02}>
                <div className="relative">
                  <select className="block w-full pl-4 pr-10 py-3.5 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl shadow-sm transition-all duration-300 hover:border-indigo-300">
                    <option>Select a project type</option>
                    <option>Proof of Concept</option>
                    <option>Prototype</option>
                    <option>Production System</option>
                    <option>Research Project</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-purple-600">
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </HoverEffect>
            </div>
            
            <div className="mb-10">
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Details (Optional)</label>
              <HoverEffect scale={1.02}>
                <textarea 
                  className="block w-full px-4 py-3.5 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl shadow-sm transition-all duration-300 hover:border-indigo-300"
                  rows="4"
                  placeholder="Provide any context, goals, or constraints for your project..."
                ></textarea>
              </HoverEffect>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <button 
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => window.location.href = '/my-game-plan.html'}
              >
                Generate Your AI Game Plan
              </button>
            </motion.div>
            
            <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-gray-500">
              <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Your data remains private and secure</span>
            </div>
          </div>
        </motion.div>
        
        <div className="mt-16 text-center">
          <motion.div 
            className="flex flex-wrap justify-center gap-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center bg-white/80 backdrop-blur-sm px-5 py-3 rounded-full shadow-sm">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
                <svg className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-600 text-sm">Custom Implementation Steps</span>
            </div>
            
            <div className="flex items-center bg-white/80 backdrop-blur-sm px-5 py-3 rounded-full shadow-sm">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
                <svg className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-600 text-sm">Detailed Resources</span>
            </div>
            
            <div className="flex items-center bg-white/80 backdrop-blur-sm px-5 py-3 rounded-full shadow-sm">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
                <svg className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-600 text-sm">Relevant Examples</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default GamePlanCreator;
