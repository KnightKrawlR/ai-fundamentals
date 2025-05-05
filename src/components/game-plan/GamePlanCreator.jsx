import React, { useState } from 'react';

const GamePlanCreator = () => {
  const [formData, setFormData] = useState({
    topic: '',
    challenge: '',
    projectType: '',
    description: '',
    expertiseLevel: 'beginner'
  });
  
  const topics = [
    'Office Productivity',
    'Personal Finance',
    'Social Media',
    'Marketing',
    'Data Analysis',
    'Machine Learning',
    'Web Development',
    'Mobile App Development',
    'Videography',
    'eCommerce',
  ];
  
  const challenges = {
    'Office Productivity': ['Document Automation', 'Email Management', 'Meeting Notes', 'Process Improvement'],
    'Personal Finance': ['Budget Tracking', 'Investment Analysis', 'Expense Categorization', 'Financial Planning'],
    'Social Media': ['Content Generation', 'Scheduling', 'Analytics', 'Audience Engagement'],
    'Marketing': ['Campaign Analysis', 'Copy Generation', 'SEO Optimization', 'Customer Segmentation'],
    'Data Analysis': ['Data Visualization', 'Predictive Modeling', 'Pattern Recognition', 'Report Generation'],
    'Machine Learning': ['Model Training', 'Feature Engineering', 'Model Deployment', 'Performance Monitoring'],
    'Web Development': ['Frontend UI', 'Backend Logic', 'Database Design', 'API Integration'],
    'Mobile App Development': ['UI/UX Design', 'Cross-platform Development', 'Push Notifications', 'Data Synchronization'],
    'Videography': ['Video Editing', 'Content Planning', 'Distribution Strategy', 'Analytics Tracking'],
    'eCommerce': ['Product Listings', 'Inventory Management', 'Payment Processing', 'Customer Support'],
  };
  
  const projectTypes = ['Personal Project', 'Small Business', 'Enterprise Solution'];
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Reset dependent fields
    if (name === 'topic') {
      setFormData(prev => ({
        ...prev,
        topic: value,
        challenge: '',
        projectType: ''
      }));
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real implementation, this would send the data to the backend
    // For now, we'll redirect to the my-game-plan page
    window.location.href = '/my-game-plan.html';
  };
  
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-purple-800 mb-4">
              Create Your AI Game Plan
            </h2>
            <p className="text-lg text-gray-600">
              Tell us about your AI implementation needs, and we'll generate a personalized roadmap
              for your project with step-by-step guidance.
            </p>
          </div>
          
          <div className="bg-purple-50 rounded-xl p-8 shadow-card">
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="topic" className="block text-gray-700 font-medium mb-2">
                  Select a Topic
                </label>
                <select
                  id="topic"
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Choose a topic</option>
                  {topics.map(topic => (
                    <option key={topic} value={topic}>{topic}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-6">
                <label htmlFor="challenge" className="block text-gray-700 font-medium mb-2">
                  Select a Challenge
                </label>
                <select
                  id="challenge"
                  name="challenge"
                  value={formData.challenge}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                  disabled={!formData.topic}
                >
                  <option value="">Choose a challenge</option>
                  {formData.topic && challenges[formData.topic]?.map(challenge => (
                    <option key={challenge} value={challenge}>{challenge}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-6">
                <label htmlFor="projectType" className="block text-gray-700 font-medium mb-2">
                  Project Type
                </label>
                <select
                  id="projectType"
                  name="projectType"
                  value={formData.projectType}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                  disabled={!formData.challenge}
                >
                  <option value="">Choose project type</option>
                  {projectTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-6">
                <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
                  Additional Details (Optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Describe any specific requirements or context for your project..."
                ></textarea>
              </div>
              
              <div className="mb-8">
                <label className="block text-gray-700 font-medium mb-2">
                  Your Expertise Level
                </label>
                <div className="flex flex-wrap gap-4">
                  {['beginner', 'intermediate', 'advanced'].map(level => (
                    <label key={level} className="flex items-center">
                      <input
                        type="radio"
                        name="expertiseLevel"
                        value={level}
                        checked={formData.expertiseLevel === level}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <span className="text-gray-700 capitalize">{level}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full bg-purple-700 text-white py-3 px-4 rounded-lg hover:bg-purple-800 transition-colors font-medium"
                disabled={!formData.topic || !formData.challenge || !formData.projectType}
              >
                Generate My Game Plan
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GamePlanCreator; 