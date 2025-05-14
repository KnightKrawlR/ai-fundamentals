import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';

const FeatureTab = ({ id, title, icon, isActive, onClick }) => (
  <motion.div
    className={`flex items-center px-5 py-4 rounded-xl cursor-pointer transition-all duration-300 ${
      isActive ? 'bg-gradient-to-r from-purple-800 to-indigo-700 text-white shadow-lg' : 'bg-white/10 backdrop-blur-sm text-purple-100'
    }`}
    onClick={() => onClick(id)}
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.98 }}
  >
    <div className={`rounded-full flex items-center justify-center mr-3 ${isActive ? 'bg-white/20' : 'bg-purple-800/20'} w-8 h-8`}>
      {icon}
    </div>
    <span className="font-medium">{title}</span>
  </motion.div>
);

const FeatureContent = ({ id, title, description, image, buttonText }) => (
  <motion.div
    key={id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.5 }}
    className="p-8"
  >
    <div className="grid md:grid-cols-2 gap-10 items-center">
      <div>
        <h3 className="text-2xl font-bold text-white mb-6">{title}</h3>
        <p className="text-purple-100 mb-8 leading-relaxed">{description}</p>
        <Button
          variant="primary"
          size="large"
          className="rounded-full px-6"
        >
          {buttonText || 'Learn More'}
        </Button>
      </div>
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5 shadow-xl">
        {image}
      </div>
    </div>
  </motion.div>
);

const GamePlanFeature = () => {
  const [activeFeature, setActiveFeature] = useState('add');
  
  const features = [
    {
      id: 'add',
      title: 'Define AI Challenge',
      icon: <svg className="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>,
      description: "Clearly define your AI challenge to get targeted solutions. Our platform helps you identify exactly what problem you're trying to solve and which AI approach would be most effective.",
      image: (
        <div className="space-y-3">
          <div className="h-12 bg-purple-900/40 rounded-lg w-full animate-pulse"></div>
          <div className="h-12 bg-purple-900/40 rounded-lg w-3/4"></div>
          <div className="h-12 bg-purple-900/40 rounded-lg w-5/6"></div>
          <div className="h-12 bg-purple-900/40 rounded-lg w-2/3"></div>
        </div>
      ),
      buttonText: 'Define Your Challenge'
    },
    {
      id: 'send',
      title: 'Receive Recommendations',
      icon: <svg className="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>,
      description: 'Get instant AI implementation recommendations customized to your specific needs. Our algorithm analyzes your requirements and delivers actionable guidance tailored specifically to your scenario.',
      image: (
        <div className="space-y-3">
          <div className="h-16 bg-purple-900/40 rounded-lg w-full flex items-center px-3">
            <div className="w-10 h-10 rounded-full bg-purple-700 mr-3"></div>
            <div className="flex-1">
              <div className="h-3 bg-white/30 rounded w-3/4 mb-2"></div>
              <div className="h-2 bg-white/20 rounded w-1/2"></div>
            </div>
          </div>
          <div className="h-16 bg-purple-900/40 rounded-lg w-full flex items-center px-3">
            <div className="w-10 h-10 rounded-full bg-purple-700 mr-3"></div>
            <div className="flex-1">
              <div className="h-3 bg-white/30 rounded w-3/4 mb-2"></div>
              <div className="h-2 bg-white/20 rounded w-1/2"></div>
            </div>
          </div>
          <div className="h-16 bg-purple-900/40 rounded-lg w-full flex items-center px-3">
            <div className="w-10 h-10 rounded-full bg-purple-700 mr-3"></div>
            <div className="flex-1">
              <div className="h-3 bg-white/30 rounded w-3/4 mb-2"></div>
              <div className="h-2 bg-white/20 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ),
      buttonText: 'Get Recommendations'
    },
    {
      id: 'exchange',
      title: 'Implement Your Plan',
      icon: <svg className="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>,
      description: 'Turn your AI game plan into reality with our step-by-step implementation guide. We break down complex AI concepts into practical, actionable steps that you can follow to achieve your goals.',
      image: (
        <div className="space-y-3">
          <div className="h-4 bg-green-500/30 rounded-lg w-full mb-4"></div>
          <div className="h-3 bg-purple-900/40 rounded-lg w-full"></div>
          <div className="h-3 bg-purple-900/40 rounded-lg w-full"></div>
          <div className="h-3 bg-purple-900/40 rounded-lg w-3/4"></div>
          <div className="h-4 bg-yellow-500/30 rounded-lg w-full my-4"></div>
          <div className="h-3 bg-purple-900/40 rounded-lg w-full"></div>
          <div className="h-3 bg-purple-900/40 rounded-lg w-5/6"></div>
          <div className="h-3 bg-purple-900/40 rounded-lg w-full"></div>
        </div>
      ),
      buttonText: 'Start Implementation'
    }
  ];
  
  const currentFeature = features.find(f => f.id === activeFeature);

  return (
    <section className="py-20 bg-gradient-to-br from-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-0 w-96 h-96 bg-purple-600 opacity-10 rounded-full filter blur-[150px]"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600 opacity-10 rounded-full filter blur-[150px]"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="max-w-4xl mx-auto text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-white text-sm font-medium mb-4">
            Simplified Process
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Unify your <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-indigo-300">AI implementation</span>
          </h2>
          <p className="text-xl text-purple-200 max-w-3xl mx-auto">
            One platform to create, deploy and monitor your AI solutions
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/10 relative">
          {/* Feature tabs - Jeton Style */}
          <div className="flex p-3 gap-3 bg-purple-950/70">
            {features.map(feature => (
              <FeatureTab 
                key={feature.id}
                id={feature.id}
                title={feature.title}
                icon={feature.icon}
                isActive={activeFeature === feature.id}
                onClick={setActiveFeature}
              />
            ))}
          </div>
          
          {/* Feature content */}
          <FeatureContent 
            id={currentFeature.id}
            title={currentFeature.title}
            description={currentFeature.description}
            image={currentFeature.image}
            buttonText={currentFeature.buttonText}
          />
        </div>
        
        {/* Bottom tag line */}
        <motion.div 
          className="max-w-2xl mx-auto text-center mt-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <p className="text-xl text-white font-medium">
            Join 10,000+ AI enthusiasts mastering artificial intelligence today
          </p>
          <motion.div
            className="mt-8"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="primary" 
              size="large"
              className="px-8 py-4 rounded-full text-lg shadow-xl"
              onClick={() => window.location.href = '/my-game-plan.html'}
            >
              Create Your Game Plan
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default GamePlanFeature;
