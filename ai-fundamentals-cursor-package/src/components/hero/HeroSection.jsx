import React from 'react';
import { motion } from 'framer-motion';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen text-white overflow-visible w-screen flex items-start justify-center pt-24">
      {/* Content container */}
      <div className="w-full flex justify-center items-center py-0 md:py-0 relative z-10 bg-transparent">
        <motion.div 
          className="relative z-20 flex flex-col items-center justify-center text-center max-w-4xl bg-transparent"
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
              Develop An AI
            </span>
            <br />
            <span className="text-white">
              GamePlan Instantly
            </span>
          </motion.h1>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
