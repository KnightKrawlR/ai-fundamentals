import React, { useState, useEffect } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';

const CubeFeatureDisplay = () => {
  const [currentFace, setCurrentFace] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const controls = useAnimation();

  const cubeFeatures = [
    {
      icon: "🧠",
      title: "Build your AI Strategy",
      description: "Create a comprehensive AI implementation strategy tailored to your business needs and technical capabilities."
    },
    {
      icon: "📘",
      title: "Learn with AI Courses",
      description: "Access interactive courses and resources designed to enhance your AI knowledge and practical skills."
    },
    {
      icon: "📊",
      title: "Track Results in Real-Time",
      description: "Monitor the performance and impact of your AI implementations with advanced analytics dashboards."
    }
  ];

  // Handle automatic rotation when not hovered
  useEffect(() => {
    let interval;
    
    if (!isHovered && !isExpanded) {
      interval = setInterval(() => {
        setCurrentFace((prev) => (prev + 1) % 3);
      }, 5000);
    }
    
    return () => clearInterval(interval);
  }, [isHovered, isExpanded]);

  // Update animation when face changes
  useEffect(() => {
    controls.start({
      rotateY: currentFace * -120,
      transition: { duration: 1.5, ease: "easeInOut" }
    });
  }, [currentFace, controls]);

  const handleCubeClick = () => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  const handleCloseModal = () => {
    setIsExpanded(false);
  };

  return (
    <section className="w-full min-h-screen bg-gradient-to-b from-[#1A0F35] to-[#0A0A0F] flex flex-col items-center justify-center py-32">
      <div className="max-w-6xl mx-auto text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-purple-300">
            Explore AI Features
          </span>
        </h2>
        <p className="text-purple-300/80 text-lg max-w-2xl mx-auto">
          Discover how our platform can transform your approach to artificial intelligence
        </p>
      </div>
      
      <div className="w-full flex justify-center items-center perspective-1000">
        {/* 3D cube container */}
        <div 
          className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleCubeClick}
        >
          {/* Reflection/shadow beneath cube */}
          <div 
            className="absolute bottom-0 w-48 h-12 bg-purple-500/20 rounded-full blur-xl z-0"
            style={{ 
              transform: 'translateY(20px) rotateX(70deg) scale(1.2, 0.3)',
              opacity: 0.4,
              filter: 'blur(8px)',
              background: 'radial-gradient(circle, rgba(196, 138, 247, 0.4) 0%, rgba(196, 138, 247, 0.1) 70%, rgba(196, 138, 247, 0) 100%)'
            }}
          />
          
          {/* 3D cube with framer motion */}
          <motion.div 
            className="cube w-full h-full relative preserve-3d cursor-pointer"
            animate={controls}
            initial={{ rotateY: 0 }}
            style={{ 
              transformStyle: 'preserve-3d',
              transformOrigin: 'center center',
              willChange: 'transform'
            }}
          >
            {/* Cube faces */}
            {[0, 1, 2].map((faceIndex) => (
              <motion.div
                key={faceIndex}
                className="absolute inset-0 w-full h-full flex items-center justify-center"
                style={{
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden',
                  transform: `rotateY(${faceIndex * 120}deg) translateZ(9rem)`,
                  background: 'rgba(30, 20, 60, 0.3)',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 0 20px rgba(196, 138, 247, 0.3), inset 0 0 20px rgba(196, 138, 247, 0.1)',
                  border: '1px solid rgba(196, 138, 247, 0.3)',
                  borderRadius: '16px',
                  overflow: 'hidden'
                }}
                whileHover={{ scale: 1.05 }}
              >
                {/* Face content */}
                <div className="p-6 text-center">
                  <div className="text-4xl mb-3">{cubeFeatures[faceIndex].icon}</div>
                  <h3 className="text-xl font-bold text-white mb-3">{cubeFeatures[faceIndex].title}</h3>
                  {/* Hologram projection effect */}
                  <motion.div 
                    className="absolute inset-0 z-[-1]"
                    animate={{ 
                      opacity: [0.2, 0.4, 0.2],
                      scale: [0.95, 1, 0.95]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "mirror"
                    }}
                    style={{
                      background: `radial-gradient(circle, rgba(196, 138, 247, 0.2) 0%, rgba(196, 138, 247, 0.05) 70%)`,
                      filter: 'blur(3px)'
                    }}
                  />
                </div>
              </motion.div>
            ))}
            
            {/* Cube edges - glowing outlines */}
            <div className="cube-edges absolute inset-0 w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
              {[...Array(12)].map((_, i) => (
                <div 
                  key={i} 
                  className="absolute bg-purple-400/30" 
                  style={{
                    boxShadow: '0 0 10px rgba(196, 138, 247, 0.8), 0 0 20px rgba(196, 138, 247, 0.3), inset 0 0 5px rgba(255, 255, 255, 0.5)',
                    ...(i < 4 
                      ? { height: '2px', width: 'calc(100% - 2rem)', top: i < 2 ? '0' : 'calc(100% - 2px)', left: '1rem' } 
                      : i < 8 
                        ? { width: '2px', height: 'calc(100% - 2rem)', left: i < 6 ? '0' : 'calc(100% - 2px)', top: '1rem' }
                        : { height: '2px', width: 'calc(100% - 2rem)', top: i < 10 ? '0' : 'calc(100% - 2px)', left: '1rem', transform: `rotateY(120deg) translateZ(9rem)` }
                    )
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modal for expanded view when clicked */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
          >
            <motion.div
              className="bg-[#1F1135]/90 backdrop-blur-md p-8 rounded-2xl max-w-2xl mx-4 border border-purple-500/30"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                boxShadow: '0 0 30px rgba(196, 138, 247, 0.3)'
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <span className="text-4xl mr-4">{cubeFeatures[currentFace].icon}</span>
                  <h3 className="text-2xl font-bold text-white">{cubeFeatures[currentFace].title}</h3>
                </div>
                <button 
                  className="text-purple-300 hover:text-white text-2xl"
                  onClick={handleCloseModal}
                >
                  ×
                </button>
              </div>
              
              <p className="text-purple-200 mb-6 text-lg">
                {cubeFeatures[currentFace].description}
              </p>
              
              <div className="bg-purple-900/30 p-6 rounded-xl border border-purple-500/20">
                <h4 className="text-purple-300 font-semibold mb-3">Key Benefits:</h4>
                <ul className="space-y-2 text-purple-100">
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-2">✦</span>
                    <span>Enhanced decision making with AI-powered insights</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-2">✦</span>
                    <span>Streamlined implementation processes</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-2">✦</span>
                    <span>Continuous learning and optimization</span>
                  </li>
                </ul>
              </div>
              
              <div className="mt-8 text-center">
                <motion.button
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg font-medium"
                  whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(196, 138, 247, 0.5)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  Learn More
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default CubeFeatureDisplay; 