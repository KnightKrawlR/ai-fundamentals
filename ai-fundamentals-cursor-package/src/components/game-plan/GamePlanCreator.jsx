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

const GamePlanCreator = () => {
  const [processingStep, setProcessingStep] = useState(2);
  
  // Simulate stepping through the process
  useEffect(() => {
    const timer = setInterval(() => {
      setProcessingStep(prev => prev < 5 ? prev + 1 : 1);
    }, 3000);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24 bg-gradient-to-br from-purple-50 to-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-40 right-20 w-72 h-72 bg-indigo-200 opacity-20 rounded-full filter blur-[100px]"></div>
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-purple-200 opacity-30 rounded-full filter blur-[120px]"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="max-w-3xl mx-auto text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <span className="inline-block py-1 px-3 rounded-full bg-purple-100 text-purple-800 text-sm font-medium mb-4">
            All currencies, one app
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-purple-900 mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-800 to-indigo-600">Simple, fast &amp; safe</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect with our AI to create your personalized implementation plan
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Robot Character */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <RobotCharacter />
              <ProcessingSteps currentStep={processingStep} />
            </motion.div>
            
            {/* Chat Interface */}
            <motion.div
              className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Talk to our AI</h3>
                <p className="text-gray-500 text-sm">Describe your AI implementation needs and get a personalized game plan.</p>
              </div>
              
              <ChatInput />
              
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                <svg className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Your data remains private and secure</span>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Features */}
        <div className="max-w-5xl mx-auto mt-24">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { 
                icon: <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>,
                title: "Fast Generation",
                description: "Get your AI game plan in seconds, not hours"
              },
              { 
                icon: <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>,
                title: "Secure & Private",
                description: "Your data and plans are never shared"
              },
              { 
                icon: <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>,
                title: "Personalized",
                description: "Unique plans tailored to your specific needs"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="rounded-full bg-purple-100 w-12 h-12 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-500">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GamePlanCreator;
