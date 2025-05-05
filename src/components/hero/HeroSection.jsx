import React from 'react';
import { motion } from 'framer-motion';
import ParticleBackground from '../animations/ParticleBackground';
import Button from '../ui/Button';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-b from-purple-900 to-purple-800 text-white overflow-hidden">
      {/* Animated background */}
      <ParticleBackground color="#8A7CB4" count={60} />
      
      {/* Content container */}
      <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
        <div className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto">
          {/* Main heading with animation */}
          <motion.h1 
            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Master AI Fundamentals
          </motion.h1>
          
          {/* Subheading with animation */}
          <motion.p 
            className="text-xl md:text-2xl mb-10 text-purple-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Create your personalized AI implementation game plan and transform how you apply artificial intelligence concepts
          </motion.p>
          
          {/* CTA buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <a href="my-game-plan.html">
              <Button 
                variant="primary" 
                size="large"
              >
                Create Your Game Plan
              </Button>
            </a>
            <a href="learning-paths.html">
              <Button 
                variant="tertiary" 
                size="large"
              >
                Learning Paths
              </Button>
            </a>
          </motion.div>
        </div>
        
        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {/* AI Game Plan */}
          <motion.div 
            className="bg-white rounded-xl shadow-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="flex flex-col">
              <h3 className="text-purple-800 font-bold text-lg mb-2">AI Game Plan</h3>
              <p className="text-gray-600 text-sm mb-4">Personalized implementation strategy based on your specific needs</p>
              <div className="bg-purple-100 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 rounded-full bg-purple-600"></div>
                  <span className="text-sm text-gray-700">Define your AI challenge</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 rounded-full bg-purple-600"></div>
                  <span className="text-sm text-gray-700">Select project type</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-purple-600"></div>
                  <span className="text-sm text-gray-700">Get implementation steps</span>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* AI Topics */}
          <motion.div 
            className="bg-white rounded-xl shadow-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <div className="flex flex-col">
              <h3 className="text-purple-800 font-bold text-lg mb-2">AI Topics</h3>
              <div className="flex flex-wrap gap-2">
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">Machine Learning</span>
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">NLP</span>
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">Computer Vision</span>
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">Generative AI</span>
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">Prompt Engineering</span>
              </div>
            </div>
          </motion.div>
          
          {/* Implementation Results */}
          <motion.div 
            className="bg-white rounded-xl shadow-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
          >
            <div className="flex flex-col">
              <h3 className="text-purple-800 font-bold text-lg mb-2">Implementation Results</h3>
              <p className="text-gray-600 text-sm">Step-by-step guidance tailored to your specific AI implementation needs</p>
              <div className="mt-3 bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm font-medium">
                Ready to implement in minutes
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <div className="flex flex-col items-center">
          <span className="text-purple-200 text-sm mb-2">Scroll to explore</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection; 