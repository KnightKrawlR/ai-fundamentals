import React from 'react';
import { motion } from 'framer-motion';
import ParticleBackground from '../animations/ParticleBackground';
import Button from '../ui/Button';

const FeatureCard = ({ icon, title, description, delay = 0 }) => (
  <motion.div
    className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 shadow-xl"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    viewport={{ once: true }}
    whileHover={{ y: -5, boxShadow: '0 25px 50px -12px rgba(124, 58, 237, 0.25)' }}
  >
    <div className="rounded-full bg-purple-800/20 w-12 h-12 flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-purple-100 opacity-80">{description}</p>
  </motion.div>
);

const StepIndicator = ({ number, isActive }) => (
  <div className="flex items-center">
    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive ? 'bg-purple-600 text-white' : 'bg-purple-200 text-purple-800'} font-bold`}>
      {number}
    </div>
    <div className={`h-1 w-12 ${isActive ? 'bg-purple-600' : 'bg-purple-200'}`}></div>
  </div>
);

const HeroSection = () => {
  const features = [
    {
      icon: <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>,
      title: "AI Implementation",
      description: "Get a customized blueprint for applying AI to your specific needs"
    },
    {
      icon: <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>,
      title: "Fast Learning",
      description: "Accelerate your AI knowledge with focused, practical guidance"
    },
    {
      icon: <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"></path></svg>,
      title: "Secure AI",
      description: "Maintain data privacy and security throughout your AI journey"
    }
  ];

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white overflow-hidden">
      {/* Enhanced animated background with more particles */}
      <ParticleBackground color="#a78bfa" count={80} />
      
      {/* Decorative blur elements */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-pink-500 opacity-20 rounded-full filter blur-[80px]"></div>
      <div className="absolute bottom-1/3 -right-20 w-80 h-80 bg-blue-500 opacity-20 rounded-full filter blur-[100px]"></div>
      
      {/* Main content */}
      <div className="container mx-auto px-4 pt-40 pb-20 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Hero Text Section - Jeton Style */}
          <div className="text-center mb-20">
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              One app for all your <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-indigo-300">AI needs</span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl mb-12 text-purple-100 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Create your personalized AI implementation game plan with just a few clicks.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Button 
                variant="primary" 
                size="large"
                className="px-8 py-4 rounded-full text-lg shadow-xl shadow-purple-900/30"
                onClick={() => window.location.href = '/my-game-plan.html'}
              >
                Get Started
              </Button>
            </motion.div>
          </div>
          
          {/* Horizontal Steps - Jeton style */}
          <motion.div 
            className="flex justify-center mb-20 pt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="flex items-center space-x-2">
              <StepIndicator number="01" isActive={true} />
              <StepIndicator number="02" isActive={true} />
              <StepIndicator number="03" isActive={false} />
              <StepIndicator number="04" isActive={false} />
              <StepIndicator number="05" isActive={false} />
            </div>
          </motion.div>
          
          {/* Feature Cards Grid - Jeton Style*/}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            {features.map((feature, index) => (
              <FeatureCard 
                key={index} 
                icon={feature.icon} 
                title={feature.title} 
                description={feature.description} 
                delay={0.2 + (index * 0.1)}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Enhanced scroll indicator */}
      <motion.div 
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        animate={{ 
          y: [0, 10, 0],
          opacity: [0.8, 1, 0.8] 
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="flex flex-col items-center">
          <span className="text-purple-200 text-sm mb-2 font-light">Scroll</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white/70">
            <path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
