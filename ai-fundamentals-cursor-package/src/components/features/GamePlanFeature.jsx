import React from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';

const GamePlanFeature = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-white via-purple-50 to-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-200 opacity-30 rounded-full filter blur-[80px]"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-200 opacity-30 rounded-full filter blur-[100px]"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="max-w-4xl mx-auto text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <span className="inline-block py-1 px-3 rounded-full bg-purple-100 text-purple-800 text-sm font-medium mb-4">
            AI Implementation
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-purple-900 mb-6 leading-tight">
            Create Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-600">AI Implementation</span> Game Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transform how you approach AI projects with a personalized implementation strategy tailored to your specific needs and challenges.
          </p>
        </motion.div>

        <div className="flex justify-center">
          {/* Feature visual - centered and wider */}
          <motion.div
            className="bg-white p-8 rounded-2xl shadow-2xl relative max-w-2xl w-full"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true, margin: "-100px" }}
            whileHover={{ y: -5 }}
          >
            {/* Decorative gradient accent */}
            <div className="absolute -top-3 -right-3 w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full opacity-20 blur-xl"></div>
            <div className="absolute -bottom-3 -left-3 w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full opacity-20 blur-xl"></div>
            
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-purple-900 mb-8 text-center">Create Your Implementation Game Plan</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                  <div className="relative">
                    <select className="block w-full pl-3 pr-10 py-3 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 rounded-xl shadow-sm transition-all duration-300 hover:border-purple-400">
                      <option>Select a topic</option>
                      <option>Machine Learning</option>
                      <option>Natural Language Processing</option>
                      <option>Computer Vision</option>
                      <option>Generative AI</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Challenge</label>
                  <div className="relative">
                    <select className="block w-full pl-3 pr-10 py-3 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 rounded-xl shadow-sm transition-all duration-300 hover:border-purple-400">
                      <option>Select a challenge</option>
                      <option>Data Analysis</option>
                      <option>Automation</option>
                      <option>Prediction</option>
                      <option>Content Generation</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Type</label>
                  <div className="relative">
                    <select className="block w-full pl-3 pr-10 py-3 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 rounded-xl shadow-sm transition-all duration-300 hover:border-purple-400">
                      <option>Select a project type</option>
                      <option>Proof of Concept</option>
                      <option>Prototype</option>
                      <option>Production System</option>
                      <option>Research Project</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Details (Optional)</label>
                  <textarea 
                    className="block w-full px-3 py-3 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 rounded-xl shadow-sm transition-all duration-300 hover:border-purple-400"
                    rows="3"
                    placeholder="Provide any context, goals, or constraints for your project..."
                  ></textarea>
                </div>
                
                <div>
                  <button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                    Generate Game Plan
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default GamePlanFeature;
