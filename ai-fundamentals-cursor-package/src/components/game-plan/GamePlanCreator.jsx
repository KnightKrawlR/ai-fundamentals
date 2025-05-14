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
  
  // Calculate eye movements with more dramatic range but still contained
  const calculateEyePosition = () => {
    const centerX = windowDimensions.width / 2;
    const centerY = windowDimensions.height / 2;
    
    // Increase the eye movement range for more dramatic effect
    const maxMovement = 12; // Increased from 7
    const containerRadius = 15; // Size of the eye socket
    const pupilRadius = 8; // Size of the pupil
    const maxAllowedDistance = containerRadius - pupilRadius; // Maximum distance to keep pupil inside
    
    // Calculate x direction (left-right)
    let xOffset = ((mousePosition.x - centerX) / centerX) * maxMovement;
    // Calculate y direction (up-down)
    let yOffset = ((mousePosition.y - centerY) / centerY) * maxMovement;
    
    // Calculate the distance from center
    const distance = Math.sqrt(xOffset * xOffset + yOffset * yOffset);
    
    // If distance exceeds the maximum allowed, scale it down
    if (distance > maxAllowedDistance) {
      const scale = maxAllowedDistance / distance;
      xOffset *= scale;
      yOffset *= scale;
    }
    
    return {
      x: xOffset,
      y: yOffset
    };
  };
  
  const eyePosition = calculateEyePosition();
  
  // Add scroll-based animation for extra dramatic effect
  const scrollXOffset = useTransform(scrollY, [0, 300, 600, 900], [0, 5, -5, 0]);
  const scrollYOffset = useTransform(scrollY, [0, 300, 600, 900], [0, 8, -3, 0]);
  
  return (
    <div className="mx-auto w-full max-w-md relative">
      {/* Robot Head - with chrome styling */}
      <motion.div 
        className="relative rounded-3xl p-8 shadow-xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #e2e8f0 0%, #a0aec0 100%)'
        }}
        initial={{ y: 20 }}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
      >
        {/* Chrome effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-black/20 z-0"></div>
        
        {/* Shine effect */}
        <motion.div 
          className="absolute -inset-full h-[200%] w-[200%] z-0"
          animate={{
            background: [
              'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 25%)',
              'radial-gradient(circle at 70% 70%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 25%)'
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, repeatType: "mirror" }}
        />
        
        {/* Reflective highlights */}
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/30 to-transparent z-0"></div>
        
        {/* Antenna */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-16 flex flex-col items-center z-10">
          <div className="w-2 h-10 bg-gradient-to-b from-slate-300 to-slate-500 rounded-full"></div>
          <div className="w-5 h-5 rounded-full bg-red-500 animate-pulse shadow-lg shadow-red-500/50"></div>
        </div>
        
        {/* Face Elements - above the chrome effect */}
        <div className="flex flex-col items-center relative z-10">
          {/* Eyes Container */}
          <div className="flex justify-center space-x-10 mb-8">
            {/* Left Eye */}
            <div className="relative w-14 h-14 bg-gradient-to-br from-slate-800 to-slate-950 rounded-full flex items-center justify-center overflow-hidden shadow-inner shadow-black/50">
              {/* Eye shine */}
              <div className="absolute top-1 right-1 w-3 h-3 bg-white/40 rounded-full"></div>
              
              <motion.div 
                className="absolute w-9 h-9 bg-gradient-to-br from-blue-300 to-blue-500 rounded-full flex items-center justify-center"
                style={{ 
                  x: useTransform(() => eyePosition.x + scrollXOffset.get()),
                  y: useTransform(() => eyePosition.y + scrollYOffset.get())
                }}
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <motion.div 
                  className="w-4 h-4 bg-gradient-to-br from-blue-800 to-black rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                />
              </motion.div>
            </div>
            
            {/* Right Eye */}
            <div className="relative w-14 h-14 bg-gradient-to-br from-slate-800 to-slate-950 rounded-full flex items-center justify-center overflow-hidden shadow-inner shadow-black/50">
              {/* Eye shine */}
              <div className="absolute top-1 right-1 w-3 h-3 bg-white/40 rounded-full"></div>
              
              <motion.div 
                className="absolute w-9 h-9 bg-gradient-to-br from-blue-300 to-blue-500 rounded-full flex items-center justify-center"
                style={{ 
                  x: useTransform(() => eyePosition.x + scrollXOffset.get()),
                  y: useTransform(() => eyePosition.y + scrollYOffset.get())
                }}
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <motion.div 
                  className="w-4 h-4 bg-gradient-to-br from-blue-800 to-black rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                />
              </motion.div>
            </div>
          </div>
          
          {/* Mouth */}
          <motion.div 
            className="w-24 h-3 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 rounded-full mb-3"
            initial={{ width: 60 }}
            animate={{ width: [60, 90, 60] }}
            transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
          />
        </div>
        
        {/* Robot Details */}
        <div className="absolute bottom-4 right-4 w-7 h-7 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center">
          <div className="w-5 h-5 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/40"></div>
        </div>
        <div className="absolute bottom-4 left-4 w-7 h-7 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center">
          <div className="w-5 h-5 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/40"></div>
        </div>
      </motion.div>
    </div>
  );
};

const ChatInput = () => {
  const [inputText, setInputText] = useState('');
  
  return (
    <div className="flex items-center gap-4">
      <div className="flex-grow">
        <HoverEffect scale={1.01}>
          <textarea 
            className="block w-full px-5 py-4 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl shadow-sm transition-all duration-300 hover:border-indigo-300 resize-none"
            rows="3"
            placeholder="What would you like to build today? Describe your AI project or challenge..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          ></textarea>
        </HoverEffect>
      </div>
      
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <button 
          className="h-full px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 min-h-[80px] flex items-center justify-center"
          onClick={() => window.location.href = '/my-game-plan.html'}
        >
          <span className="mr-2">Generate</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
          </svg>
        </button>
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
          className="max-w-4xl mx-auto bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-indigo-100 relative"
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
            
            {/* Chat input and button only */}
            <div className="mb-6">
              <ChatInput />
            </div>
            
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
