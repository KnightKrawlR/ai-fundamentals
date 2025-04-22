// MyGamePlan.jsx - Enhanced React component with category/topic dropdowns
import React, { useState, useEffect, useRef } from 'react';
import firebase from '../firebase';
import GrokAI from './grokAI';
import LowCreditsWarning from './LowCreditsWarning';
import CreditPurchaseModal from './CreditPurchaseModal';
import { checkCreditsThreshold } from '../services/creditService';

const MyGamePlan = ({ credits, onAddCredits }) => {
  const [showModal, setShowModal] = useState(false);
  const [projectDescription, setProjectDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [gamePlans, setGamePlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const grokAI = useRef(new GrokAI());

  // Categories based on existing learning paths
  const categories = [
    'Web Development',
    'Mobile Development',
    'Data Science',
    'Videography',
    'Social Media Marketing',
    'Office Productivity',
    'Personal Finance',
    'eCommerce'
  ];

  // Topics dynamically loaded based on selected category
  const getTopics = (category) => {
    switch(category) {
      case 'Web Development':
        return ['Frontend Development', 'Backend Development', 'Full Stack', 'Web Design', 'JavaScript Frameworks'];
      case 'Mobile Development':
        return ['iOS Development', 'Android Development', 'React Native', 'Flutter', 'Mobile UI/UX'];
      case 'Data Science':
        return ['Machine Learning', 'Data Analysis', 'Data Visualization', 'Big Data', 'Statistical Analysis'];
      case 'Videography':
        return ['Video Editing', 'Camera Techniques', 'Lighting', 'Sound Design', 'Post-Production'];
      case 'Social Media Marketing':
        return ['Content Strategy', 'Analytics', 'Paid Advertising', 'Audience Growth', 'Platform Optimization'];
      case 'Office Productivity':
        return ['Document Management', 'Spreadsheet Analysis', 'Presentation Design', 'Email Management', 'Project Planning'];
      case 'Personal Finance':
        return ['Budgeting', 'Investment', 'Retirement Planning', 'Debt Management', 'Financial Analysis'];
      case 'eCommerce':
        return ['Online Store Setup', 'Product Management', 'Payment Processing', 'Customer Experience', 'Marketing Automation'];
      default:
        return [];
    }
  };

  useEffect(() => {
    // Load saved game plans from Firebase
    const loadGamePlans = async () => {
      try {
        const user = firebase.auth().currentUser;
        if (user) {
          const snapshot = await firebase.firestore()
            .collection('users')
            .doc(user.uid)
            .collection('gamePlans')
            .orderBy('createdAt', 'desc')
            .get();
          
          const plans = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          setGamePlans(plans);
        }
      } catch (error) {
        console.error('Error loading game plans:', error);
      }
    };
    
    loadGamePlans();
  }, []);

  const handleCreatePlan = async () => {
    if (!projectDescription.trim() && !selectedCategory) {
      alert('Please enter a project description or select a category');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Call Grok to generate the game plan with category and topic
      const response = await grokAI.current.generateGamePlan(
        projectDescription,
        selectedCategory,
        selectedTopic
      );
      
      if (response.success) {
        // Save to Firebase
        const user = firebase.auth().currentUser;
        const newPlan = {
          description: projectDescription,
          category: selectedCategory,
          topic: selectedTopic,
          plan: response.plan,
          technologies: response.technologies,
          resources: response.resources,
          createdAt: new Date(),
        };
        
        const docRef = await firebase.firestore()
          .collection('users')
          .doc(user.uid)
          .collection('gamePlans')
          .add(newPlan);
        
        setGamePlans([{ id: docRef.id, ...newPlan }, ...gamePlans]);
        setProjectDescription('');
        setSelectedCategory('');
        setSelectedTopic('');
        setCurrentPlan({ id: docRef.id, ...newPlan });
      } else {
        alert('Failed to generate game plan. Please try again.');
      }
    } catch (error) {
      console.error('Error creating game plan:', error);
      alert('Error creating game plan. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Game Plan</h1>
      
      {/* Credits display */}
      <div className="flex items-center space-x-2 mb-6">
        <span className={`text-sm ${credits < 5 ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
          Credits: {credits}
        </span>
        {credits < 5 && (
          <button
            data-credit-button
            onClick={() => setShowModal(true)}
            className="text-xs px-2 py-1 bg-primary-500 text-white rounded hover:bg-primary-600"
          >
            Add Credits
          </button>
        )}
      </div>
      
      {/* Project description input with category/topic dropdowns */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Game Plan</h2>
        
        {/* Category and Topic dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Category
            </label>
            <select 
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedTopic('');
              }}
              className="w-full p-2 border rounded-md"
              disabled={isProcessing}
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Topic
            </label>
            <select 
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full p-2 border rounded-md"
              disabled={!selectedCategory || isProcessing}
            >
              <option value="">Select a topic</option>
              {getTopics(selectedCategory).map(topic => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Project description textarea */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Describe your project or what you want to do:
          </label>
          <textarea
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            className="w-full p-3 border rounded-md"
            rows={4}
            placeholder="Example: I want to build a personal finance tracking app that connects to my bank accounts"
            disabled={isProcessing}
          ></textarea>
        </div>
        
        <button
          onClick={handleCreatePlan}
          disabled={isProcessing || (!projectDescription.trim() && !selectedCategory)}
          className="w-full mt-3 px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50"
        >
          {isProcessing ? 'Generating Plan...' : 'Create Game Plan'}
        </button>
      </div>
      
      {/* Display current plan */}
      {currentPlan && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold">{currentPlan.description || 'Game Plan'}</h2>
            <button 
              onClick={() => setCurrentPlan(null)} 
              className="text-gray-500 hover:text-gray-700"
            >
              <span className="sr-only">Close</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Category and topic tags */}
          {(currentPlan.category || currentPlan.topic) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {currentPlan.category && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                  {currentPlan.category}
                </span>
              )}
              {currentPlan.topic && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                  {currentPlan.topic}
                </span>
              )}
            </div>
          )}
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Implementation Plan</h3>
            <div className="bg-gray-50 p-4 rounded">
              {currentPlan.plan.map((step, index) => (
                <div key={index} className="mb-3">
                  <div className="font-medium">Step {index + 1}</div>
                  <div>{step}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Recommended Technologies</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentPlan.technologies.map((tech, index) => (
                <div key={index} className="bg-blue-50 p-3 rounded">
                  <div className="font-medium">{tech.name}</div>
                  <div className="text-sm">{tech.description}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Learning Resources</h3>
            <ul className="list-disc pl-5">
              {currentPlan.resources.map((resource, index) => (
                <li key={index} className="mb-1">
                  <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {resource.title}
                  </a>
                  <span className="text-sm text-gray-600"> - {resource.type}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {/* Saved game plans */}
      {gamePlans.length > 0 && !currentPlan && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Your Game Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gamePlans.map(plan => (
              <div 
                key={plan.id} 
                className="bg-gray-50 rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setCurrentPlan(plan)}
              >
                <h3 className="font-medium mb-2 truncate">{plan.description || 'Game Plan'}</h3>
                
                {/* Category and topic tags */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {plan.category && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                      {plan.category}
                    </span>
                  )}
                  {plan.topic && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded">
                      {plan.topic}
                    </span>
                  )}
                </div>
                
                <div className="text-sm text-gray-600">
                  {plan.createdAt && new Date(plan.createdAt.toDate()).toLocaleDateString()}
                </div>
                <div className="text-sm mt-2">
                  {plan.technologies?.length || 0} technologies • {plan.resources?.length || 0} resources
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Credit purchase modal */}
      {showModal && (
        <CreditPurchaseModal 
          onClose={() => setShowModal(false)} 
          onAddCredits={onAddCredits}
        />
      )}
    </div>
  );
};

export default MyGamePlan;
