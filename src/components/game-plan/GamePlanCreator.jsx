import React from 'react';
import { motion } from 'framer-motion';
import HoverEffect from '../animations/HoverEffect';

const GamePlanCreator = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4">
        <motion.div 
          className="max-w-4xl mx-auto text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="text-4xl font-bold text-purple-900 mb-4">Start Your AI Journey Now</h2>
          <p className="text-xl text-gray-600">
            Create your personalized AI implementation game plan in just a few clicks
          </p>
        </motion.div>

        <motion.div 
          className="max-w-3xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                <HoverEffect scale={1.02}>
                  <div className="relative">
                    <select className="block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 rounded-md shadow-sm">
                      <option>Select a topic</option>
                      <option>Machine Learning</option>
                      <option>Natural Language Processing</option>
                      <option>Computer Vision</option>
                      <option>Generative AI</option>
                    </select>
                  </div>
                </HoverEffect>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Challenge</label>
                <HoverEffect scale={1.02}>
                  <div className="relative">
                    <select className="block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 rounded-md shadow-sm">
                      <option>Select a challenge</option>
                      <option>Data Analysis</option>
                      <option>Automation</option>
                      <option>Prediction</option>
                      <option>Content Generation</option>
                    </select>
                  </div>
                </HoverEffect>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Type</label>
              <HoverEffect scale={1.02}>
                <div className="relative">
                  <select className="block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 rounded-md shadow-sm">
                    <option>Select a project type</option>
                    <option>Proof of Concept</option>
                    <option>Prototype</option>
                    <option>Production System</option>
                    <option>Research Project</option>
                  </select>
                </div>
              </HoverEffect>
            </div>
            
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Details (Optional)</label>
              <HoverEffect scale={1.02}>
                <textarea 
                  className="block w-full px-3 py-3 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 rounded-md shadow-sm"
                  rows="3"
                  placeholder="Provide any context, goals, or constraints for your project..."
                ></textarea>
              </HoverEffect>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <a href="my-game-plan.html">
                <button 
                  className="w-full bg-gradient-to-r from-purple-700 to-purple-900 text-white font-semibold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Generate Your AI Game Plan
                </button>
              </a>
            </motion.div>
          </div>
        </motion.div>
        
        <div className="mt-12 text-center">
          <motion.p 
            className="text-gray-500 italic"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Join thousands of professionals who have accelerated their AI implementation with our game plans
          </motion.p>
        </div>
      </div>
    </section>
  );
};

export default GamePlanCreator; 