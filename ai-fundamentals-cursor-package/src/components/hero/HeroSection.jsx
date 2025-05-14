import React from 'react';
import { motion } from 'framer-motion';
import ParticleBackground from '../animations/ParticleBackground';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-b from-[#2D1B54] to-[#3D2866] text-white overflow-hidden w-screen flex items-center justify-center">
      {/* Animated background */}
      <ParticleBackground color="#8A7CB4" count={60} />
      
      {/* Content container */}
      <div className="w-full flex justify-center items-center py-12 md:py-20 relative z-10">
        <motion.div 
          className="relative z-20 flex flex-col items-center justify-center text-center max-w-4xl"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5, ease: "circOut" }}
        >
          <motion.h1 
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold mb-16 tracking-tight"
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
          
          {/* Removed subtitle paragraph */}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
