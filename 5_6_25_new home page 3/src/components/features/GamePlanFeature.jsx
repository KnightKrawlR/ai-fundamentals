import React from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';

const GamePlanFeature = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div 
          className="max-w-4xl mx-auto text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-purple-900 mb-6">Create Your AI Implementation Game Plan</h2>
          <p className="text-xl text-gray-600">
            Transform how you approach AI projects with a personalized implementation strategy tailored to your specific needs and challenges.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Feature description */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h3 className="text-2xl font-bold text-purple-800 mb-4">How It Works</h3>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="bg-purple-100 rounded-full p-3 mr-4">
                  <span className="flex items-center justify-center w-6 h-6 bg-purple-700 text-white rounded-full font-bold">1</span>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-purple-900 mb-2">Select Your Topic</h4>
                  <p className="text-gray-600">Choose from a range of AI topics including Machine Learning, NLP, Computer Vision, and more.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-purple-100 rounded-full p-3 mr-4">
                  <span className="flex items-center justify-center w-6 h-6 bg-purple-700 text-white rounded-full font-bold">2</span>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-purple-900 mb-2">Define Your Challenge</h4>
                  <p className="text-gray-600">Specify the particular challenge or problem you're trying to solve with AI.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-purple-100 rounded-full p-3 mr-4">
                  <span className="flex items-center justify-center w-6 h-6 bg-purple-700 text-white rounded-full font-bold">3</span>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-purple-900 mb-2">Choose Project Type</h4>
                  <p className="text-gray-600">Select the type of project that best matches your implementation goals.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-purple-100 rounded-full p-3 mr-4">
                  <span className="flex items-center justify-center w-6 h-6 bg-purple-700 text-white rounded-full font-bold">4</span>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-purple-900 mb-2">Get Your Game Plan</h4>
                  <p className="text-gray-600">Receive a detailed, step-by-step implementation plan tailored to your specific needs.</p>
                </div>
              </div>
            </div>
            
            <div className="mt-10">
              <Button 
                variant="primary" 
                size="large"
                onClick={() => window.location.href = '/my-game-plan.html'}
              >
                Create Your Game Plan
              </Button>
            </div>
          </motion.div>
          
          {/* Feature visual */}
          <motion.div
            className="bg-purple-50 p-6 rounded-xl shadow-lg"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-2xl font-bold text-purple-900 mb-6">Create Your Implementation Game Plan</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                  <div className="relative">
                    <select className="block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 rounded-md shadow-sm">
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
                    <select className="block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 rounded-md shadow-sm">
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
                    <select className="block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 rounded-md shadow-sm">
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
                    className="block w-full px-3 py-3 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 rounded-md shadow-sm"
                    rows="3"
                    placeholder="Provide any context, goals, or constraints for your project..."
                  ></textarea>
                </div>
                
                <div>
                  <button className="w-full bg-purple-700 hover:bg-purple-800 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
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
