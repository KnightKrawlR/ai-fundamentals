import React from 'react';
import { motion } from 'framer-motion';
import ParticleBackground from '../animations/ParticleBackground';

const HeroSection = () => {
  return (
    <section className="relative min-h-[65vh] h-[65vh] w-full max-w-[100vw] flex items-start justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-black text-white overflow-hidden p-4 pt-20 sm:pt-24 md:pt-28">
      {/* Advanced Particle Background - more dynamic */}
      <ParticleBackground 
        color="#8A2BE2" // Brighter purple for particles
        count={150} // More particles for a denser feel
        particleSize={2}
        speed={0.3}
        hoverEffect={true}
      />
      
      {/* Animated Gradient Overlay for depth and movement */}
      <motion.div 
        className="absolute inset-0 z-0"
        animate={{
          background: [
            'linear-gradient(45deg, rgba(76, 29, 149, 0.8) 0%, rgba(50, 20, 100, 0.6) 50%, rgba(20, 10, 50, 0.9) 100%)',
            'linear-gradient(45deg, rgba(50, 20, 100, 0.8) 0%, rgba(20, 10, 50, 0.6) 50%, rgba(76, 29, 149, 0.9) 100%)',
            'linear-gradient(45deg, rgba(76, 29, 149, 0.8) 0%, rgba(50, 20, 100, 0.6) 50%, rgba(20, 10, 50, 0.9) 100%)',
          ]
        }}
        transition={{ duration: 15, repeat: Infinity, repeatType: "mirror" }}
      />

      {/* Subtle Grid Overlay for a tech feel */}
      <div 
        className="absolute inset-0 z-10"
        style={{
          backgroundImage: 
            `linear-gradient(to right, rgba(128, 90, 213, 0.07) 1px, transparent 1px),
             linear-gradient(to bottom, rgba(128, 90, 213, 0.07) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />
      
      {/* Content Container - Centered with high-impact text, pushed higher */}
      <motion.div 
        className="relative z-20 flex flex-col items-center justify-start text-center max-w-4xl mx-auto pt-4" 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.5, ease: "circOut" }}
      >
        <motion.h1 
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold mb-4 sm:mb-6 tracking-tight"
          style={{
            textShadow: '0 0 15px rgba(196, 138, 247, 0.5), 0 0 30px rgba(196, 138, 247, 0.3)',
          }}
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-purple-300">
            Unlock AI Potential.
          </span>
          <br />
          Instantly.
        </motion.h1>
        
        <motion.p 
          className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-10 text-purple-200/90 max-w-2xl leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1, ease: "easeOut" }}
        >
          Describe your vision. We generate the A<span className="opacity-0">I</span>I blueprint. Experience the future of AI-driven strategy, tailored to your enterprise.
        </motion.p>
        
        {/* The GamePlanCreator component (chat interface) will be rendered here by Home.jsx */}
        {/* No placeholder needed anymore */}

      </motion.div>
    </section>
  );
};

export default HeroSection;
