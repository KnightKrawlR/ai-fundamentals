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

// Processing steps display at the bottom of the form
const ProcessingSteps = ({ currentStep }) => {
  const steps = [
    { id: 1, label: "Request" },
    { id: 2, label: "Process" },
    { id: 3, label: "Analyze" },
    { id: 4, label: "Generate" },
    { id: 5, label: "Complete" }
  ];
  
  return (
    <div className="flex justify-between items-center w-full max-w-md mx-auto mt-8 px-2">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          {index > 0 && (
            <div className={`h-1 flex-grow ${currentStep >= step.id ? 'bg-purple-600' : 'bg-gray-300'}`}></div>
          )}
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep >= step.id 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-300 text-gray-600'
            } font-semibold text-sm`}>
              {step.id}
            </div>
            <span className="text-xs mt-1 text-gray-500">{step.label}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

const ChatInput = () => {
  const [inputValue, setInputValue] = useState('');
  
  return (
    <div className="w-full bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <motion.div 
        className="flex flex-col"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <textarea
          className="w-full p-4 text-gray-800 bg-transparent border-none resize-none focus:ring-0 focus:outline-none"
          rows="3"
          placeholder="What would you like to build today? Describe your AI project or challenge..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        ></textarea>
        
        <div className="flex justify-between items-center p-3 bg-gray-100 border-t border-gray-200">
          <div className="text-xs text-gray-400">Tell us about your AI project needs</div>
          <button 
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-4 py-2 rounded-xl text-white font-medium text-sm transition-all duration-200 flex items-center gap-2"
          >
            <span>Generate</span>
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Main component for the Game Plan Creator Section / Chat Interface
const GamePlanCreator = () => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Simulate AI response and reset
  const handleGenerate = () => {
    if (!inputValue.trim()) return; // Don't generate if input is empty
    setIsGenerating(true);
    // Simulate API call
    setTimeout(() => {
      setIsGenerating(false);
      // Potentially navigate to a results page or show results here
      console.log("Generated plan for: ", inputValue);
      // setInputValue(''); // Optionally clear input after generation
    }, 3000);
  };

  return (
    <motion.div 
      className="w-full max-w-3xl mx-auto relative z-30" // Ensure it's above hero overlays
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1.2, ease: "circOut" }} // Synced with hero text appearance
    >
      <div className={`relative bg-black/30 backdrop-blur-xl border ${isFocused ? 'border-purple-500' : 'border-purple-800/70'} rounded-2xl shadow-2xl transition-all duration-300`}>
        {/* Glowing effect when focused */}
        {isFocused && (
          <motion.div 
            className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 opacity-75 blur-md animate-pulse-slow z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.75 }}
            transition={{ duration: 0.5 }}
          />
        )}

        <div className="relative p-1.5 z-10">
          <textarea
            className="w-full min-h-[80px] md:min-h-[100px] p-4 sm:p-6 bg-transparent text-lg sm:text-xl text-purple-100 placeholder-purple-300/70 resize-none focus:outline-none transition-all duration-300 rounded-t-xl"
            placeholder="Describe your AI vision... What challenges can we solve?"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            rows={3}
            disabled={isGenerating}
          />
          <div className="flex flex-col sm:flex-row items-center justify-between p-3 sm:p-4 bg-black/20 rounded-b-xl border-t border-purple-800/50">
            <p className="text-xs text-purple-300/80 mb-2 sm:mb-0">
              AI-Powered Strategic Blueprint Generation
            </p>
            <motion.button
              onClick={handleGenerate}
              disabled={isGenerating || !inputValue.trim()}
              className={`px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 flex items-center justify-center
                ${isGenerating || !inputValue.trim() ? 'bg-purple-700/50 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 hover:from-purple-700 hover:via-pink-600 hover:to-red-600 shadow-lg hover:shadow-pink-500/40'}
              `}
              whileHover={{ scale: (isGenerating || !inputValue.trim()) ? 1 : 1.05 }}
              whileTap={{ scale: (isGenerating || !inputValue.trim()) ? 1 : 0.98 }}
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Blueprint...
                </>
              ) : (
                <>
                  <span className="mr-2">Unleash AI</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                  </svg>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
      {isGenerating && (
        <div className="mt-4 text-center">
            <p className="text-purple-300 text-sm animate-pulse">Our AI is crafting your strategic document...</p>
        </div>
      )}
    </motion.div>
  );
};

export default GamePlanCreator;
