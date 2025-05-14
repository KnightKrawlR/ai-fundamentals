import React from 'react';
import { motion } from 'framer-motion';
import ParticleBackground from '../animations/ParticleBackground';
import Button from '../ui/Button';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white overflow-hidden">
      {/* Enhanced animated background with more particles */}
      <ParticleBackground color="#a78bfa" count={80} />
      
      {/* Decorative blur elements */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-pink-500 opacity-20 rounded-full filter blur-[80px]"></div>
      <div className="absolute bottom-1/3 -right-20 w-80 h-80 bg-blue-500 opacity-20 rounded-full filter blur-[100px]"></div>
      
      {/* Content container */}
      <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
        <div className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto">
          {/* Main heading with enhanced animation */}
          <motion.div
            className="mb-6 relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
              Master AI Fundamentals
            </h1>
            <motion.div 
              className="absolute -z-10 w-full h-1/2 bg-gradient-to-r from-purple-500 to-pink-500 opacity-30 blur-xl"
              animate={{ 
                width: ["80%", "100%", "90%"],
                x: ["-10%", "0%", "-5%"] 
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity, 
                repeatType: "reverse" 
              }}
            />
          </motion.div>
          
          {/* Subheading with animation */}
          <motion.p 
            className="text-xl md:text-2xl mb-12 text-purple-100 leading-relaxed max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Create your personalized AI implementation game plan and transform how you apply artificial intelligence concepts
          </motion.p>
          
          {/* CTA buttons with enhanced styling */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-5 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Button 
              variant="primary" 
              size="large"
              className="px-8 py-4 rounded-full shadow-lg shadow-purple-900/30 hover:shadow-purple-600/40 transition-all duration-300"
              onClick={() => window.location.href = '/my-game-plan.html'}
            >
              Create Your Game Plan
            </Button>
            <Button 
              variant="tertiary" 
              size="large"
              className="px-8 py-4 rounded-full border-2 hover:bg-white/10 transition-colors duration-300"
            >
              Learn More
            </Button>
          </motion.div>
        </div>
        
        {/* Feature cards grid - replacing floating cards with a modern grid */}
        <motion.div 
          className="mt-10 grid md:grid-cols-3 gap-6 relative" 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {/* Game Plan Card */}
          <motion.div 
            className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-xl hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-1"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex flex-col h-full">
              <h3 className="text-white font-bold text-xl mb-3">AI Game Plan</h3>
              <p className="text-purple-100 text-sm mb-4 opacity-90">Personalized implementation strategy based on your specific needs</p>
              <div className="bg-purple-900/30 p-4 rounded-xl mt-auto">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-purple-300"></div>
                  <span className="text-sm text-purple-100">Define your AI challenge</span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-purple-300"></div>
                  <span className="text-sm text-purple-100">Select project type</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-300"></div>
                  <span className="text-sm text-purple-100">Get implementation steps</span>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Topic Card */}
          <motion.div 
            className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-xl hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-1"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex flex-col h-full">
              <h3 className="text-white font-bold text-xl mb-3">AI Topics</h3>
              <p className="text-purple-100 text-sm mb-4 opacity-90">Explore various AI domains and technologies</p>
              <div className="flex flex-wrap gap-2 mt-auto">
                <span className="bg-purple-900/50 text-purple-100 px-3 py-1.5 rounded-full text-xs border border-purple-400/20">Machine Learning</span>
                <span className="bg-purple-900/50 text-purple-100 px-3 py-1.5 rounded-full text-xs border border-purple-400/20">NLP</span>
                <span className="bg-purple-900/50 text-purple-100 px-3 py-1.5 rounded-full text-xs border border-purple-400/20">Computer Vision</span>
                <span className="bg-purple-900/50 text-purple-100 px-3 py-1.5 rounded-full text-xs border border-purple-400/20">Generative AI</span>
                <span className="bg-purple-900/50 text-purple-100 px-3 py-1.5 rounded-full text-xs border border-purple-400/20">Prompt Engineering</span>
              </div>
            </div>
          </motion.div>
          
          {/* Results Card */}
          <motion.div 
            className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-xl hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-1"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex flex-col h-full">
              <h3 className="text-white font-bold text-xl mb-3">Implementation Results</h3>
              <p className="text-purple-100 text-sm mb-4 opacity-90">Step-by-step guidance tailored to your specific AI implementation needs</p>
              <div className="mt-auto bg-emerald-900/30 text-emerald-300 px-4 py-3 rounded-xl text-sm font-medium border border-emerald-400/20">
                Ready to implement in minutes
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Enhanced scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ 
          y: [0, 10, 0],
          opacity: [0.8, 1, 0.8] 
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="flex flex-col items-center">
          <span className="text-purple-200 text-sm mb-2 font-light">Scroll to explore</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white/70">
            <path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
