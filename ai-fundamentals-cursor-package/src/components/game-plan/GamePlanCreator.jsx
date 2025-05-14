import React from 'react';
import { motion } from 'framer-motion';
import HoverEffect from '../animations/HoverEffect';

const GamePlanCreator = () => {
  return (
    <section className="py-16 bg-gradient-to-t from-white via-indigo-50 to-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-40 right-20 w-72 h-72 bg-indigo-200 opacity-20 rounded-full filter blur-[100px]"></div>
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-purple-200 opacity-30 rounded-full filter blur-[120px]"></div>
      
      <div className="container mx-auto px-4 relative z-10 max-w-7xl">
        <motion.div 
          className="max-w-4xl mx-auto text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <span className="inline-block py-1 px-3 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium mb-3">
            Personalized Plan
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-purple-900 mb-4">
            Start Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-700">AI Journey</span> Now
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Create your personalized AI implementation game plan in just a few clicks
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <motion.div 
            className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-indigo-100 relative col-span-full md:col-span-1"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true, margin: "-100px" }}
            whileHover={{ y: -5 }}
          >
            {/* Subtle gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                  <HoverEffect scale={1.02}>
                    <div className="relative">
                      <select className="block w-full pl-3 pr-10 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl shadow-sm transition-all duration-300 hover:border-indigo-300">
                        <option>Select a topic</option>
                        <option>Machine Learning</option>
                        <option>Natural Language Processing</option>
                        <option>Computer Vision</option>
                        <option>Generative AI</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-purple-600">
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </HoverEffect>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Challenge</label>
                  <HoverEffect scale={1.02}>
                    <div className="relative">
                      <select className="block w-full pl-3 pr-10 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl shadow-sm transition-all duration-300 hover:border-indigo-300">
                        <option>Select a challenge</option>
                        <option>Data Analysis</option>
                        <option>Automation</option>
                        <option>Prediction</option>
                        <option>Content Generation</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-purple-600">
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </HoverEffect>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                <HoverEffect scale={1.02}>
                  <div className="relative">
                    <select className="block w-full pl-3 pr-10 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl shadow-sm transition-all duration-300 hover:border-indigo-300">
                      <option>Select a project type</option>
                      <option>Proof of Concept</option>
                      <option>Prototype</option>
                      <option>Production System</option>
                      <option>Research Project</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-purple-600">
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </HoverEffect>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Details (Optional)</label>
                <HoverEffect scale={1.02}>
                  <textarea 
                    className="block w-full px-3 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl shadow-sm transition-all duration-300 hover:border-indigo-300"
                    rows="3"
                    placeholder="Provide any context, goals, or constraints for your project..."
                  ></textarea>
                </HoverEffect>
              </div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <button 
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => window.location.href = '/my-game-plan.html'}
                >
                  Generate Your AI Game Plan
                </button>
              </motion.div>
              
              <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-gray-500">
                <svg className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Your data remains private and secure</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex flex-col space-y-6 md:pl-8 col-span-full md:col-span-1"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h3 className="text-2xl font-bold text-purple-900 mb-2">What You'll Get</h3>
            
            <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl shadow-md">
              <div className="flex items-start">
                <div className="bg-indigo-100 rounded-full p-2 mr-3">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Custom Implementation Steps</h4>
                  <p className="text-gray-600 text-sm">Step-by-step guidance tailored specifically to your project needs</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl shadow-md">
              <div className="flex items-start">
                <div className="bg-indigo-100 rounded-full p-2 mr-3">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Detailed Resources</h4>
                  <p className="text-gray-600 text-sm">Access to relevant documentation, tutorials, and learning materials</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl shadow-md">
              <div className="flex items-start">
                <div className="bg-indigo-100 rounded-full p-2 mr-3">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Implementation Shortcuts</h4>
                  <p className="text-gray-600 text-sm">Time-saving approaches, code snippets, and best practices</p>
                </div>
              </div>
            </div>
            
            <div className="mt-2 flex justify-start">
              <div className="inline-flex items-center bg-gradient-to-r from-purple-600/10 to-indigo-600/10 px-4 py-2 rounded-full">
                <svg className="h-5 w-5 text-purple-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-700 text-sm font-medium">Ready in minutes</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default GamePlanCreator;
