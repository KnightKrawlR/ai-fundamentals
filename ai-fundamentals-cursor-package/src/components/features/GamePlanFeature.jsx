import React from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';

const GamePlanFeature = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-white via-purple-50 to-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-200 opacity-30 rounded-full filter blur-[80px]"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-200 opacity-30 rounded-full filter blur-[100px]"></div>
      
      <div className="container mx-auto px-4 relative z-10 max-w-7xl">
        <motion.div 
          className="max-w-4xl mx-auto text-center mb-10 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <span className="inline-block py-1 px-3 rounded-full bg-purple-100 text-purple-800 text-sm font-medium mb-3">
            AI Implementation
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-purple-900 mb-4 leading-tight">
            Create Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-600">AI Implementation</span> Game Plan
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Transform how you approach AI projects with a personalized implementation strategy tailored to your specific needs and challenges.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Feature description */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h3 className="text-xl md:text-2xl font-bold text-purple-800 mb-6 flex items-center">
              <span className="bg-purple-100 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 16L4 8L5.4 6.6L12 13.2L18.6 6.6L20 8L12 16Z" fill="#7e22ce"/>
                </svg>
              </span>
              How It Works
            </h3>
            
            <div className="space-y-5">
              <motion.div 
                className="flex items-start" 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-full p-2 mr-3 shadow-sm">
                  <span className="flex items-center justify-center w-7 h-7 bg-gradient-to-br from-purple-600 to-purple-800 text-white rounded-full font-bold">1</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-purple-900 mb-1">Select Your Topic</h4>
                  <p className="text-gray-600 text-sm">Choose from a range of AI topics including Machine Learning, NLP, Computer Vision, and more.</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-start"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-full p-2 mr-3 shadow-sm">
                  <span className="flex items-center justify-center w-7 h-7 bg-gradient-to-br from-purple-600 to-purple-800 text-white rounded-full font-bold">2</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-purple-900 mb-1">Define Your Challenge</h4>
                  <p className="text-gray-600 text-sm">Specify the particular challenge or problem you're trying to solve with AI.</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-start"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-full p-2 mr-3 shadow-sm">
                  <span className="flex items-center justify-center w-7 h-7 bg-gradient-to-br from-purple-600 to-purple-800 text-white rounded-full font-bold">3</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-purple-900 mb-1">Choose Project Type</h4>
                  <p className="text-gray-600 text-sm">Select the type of project that best matches your implementation goals.</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-start"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-full p-2 mr-3 shadow-sm">
                  <span className="flex items-center justify-center w-7 h-7 bg-gradient-to-br from-purple-600 to-purple-800 text-white rounded-full font-bold">4</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-purple-900 mb-1">Get Your Game Plan</h4>
                  <p className="text-gray-600 text-sm">Receive a detailed, step-by-step implementation plan tailored to your specific needs.</p>
                </div>
              </motion.div>
            </div>
            
            <motion.div 
              className="mt-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              viewport={{ once: true }}
            >
              <Button 
                variant="primary" 
                size="large"
                className="px-6 py-3 rounded-full shadow-lg shadow-purple-900/10 hover:shadow-purple-600/20 transition-all duration-300"
                onClick={() => window.location.href = '/my-game-plan.html'}
              >
                Create Your Game Plan
              </Button>
            </motion.div>
          </motion.div>
          
          {/* Feature visual */}
          <motion.div
            className="bg-white p-6 rounded-2xl shadow-2xl relative"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true, margin: "-100px" }}
            whileHover={{ y: -5 }}
          >
            {/* Decorative gradient accent */}
            <div className="absolute -top-3 -right-3 w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full opacity-20 blur-xl"></div>
            <div className="absolute -bottom-3 -left-3 w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full opacity-20 blur-xl"></div>
            
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-purple-900 mb-5 text-center">Create Your Implementation Game Plan</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                  <div className="relative">
                    <select className="block w-full pl-3 pr-10 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 rounded-xl shadow-sm transition-all duration-300 hover:border-purple-400">
                      <option>Select a topic</option>
                      <option>Machine Learning</option>
                      <option>Natural Language Processing</option>
                      <option>Computer Vision</option>
                      <option>Generative AI</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Challenge</label>
                  <div className="relative">
                    <select className="block w-full pl-3 pr-10 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 rounded-xl shadow-sm transition-all duration-300 hover:border-purple-400">
                      <option>Select a challenge</option>
                      <option>Data Analysis</option>
                      <option>Automation</option>
                      <option>Prediction</option>
                      <option>Content Generation</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                  <div className="relative">
                    <select className="block w-full pl-3 pr-10 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 rounded-xl shadow-sm transition-all duration-300 hover:border-purple-400">
                      <option>Select a project type</option>
                      <option>Proof of Concept</option>
                      <option>Prototype</option>
                      <option>Production System</option>
                      <option>Research Project</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Details (Optional)</label>
                  <textarea 
                    className="block w-full px-3 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 rounded-xl shadow-sm transition-all duration-300 hover:border-purple-400"
                    rows="2"
                    placeholder="Provide any context, goals, or constraints for your project..."
                  ></textarea>
                </div>
                
                <div className="pt-2">
                  <button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-2.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
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
