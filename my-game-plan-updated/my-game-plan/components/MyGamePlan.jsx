// MyGamePlan.jsx - Enhanced React component with three-dropdown structure
import React, { useState, useEffect, useRef } from 'react';
import firebase from '../firebase';
import GrokAI from './grokAI';

const MyGamePlan = ({ credits, onAddCredits }) => {
  const [showModal, setShowModal] = useState(false);
  const [projectDescription, setProjectDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [gamePlans, setGamePlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  
  // Three-dropdown structure
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedChallenge, setSelectedChallenge] = useState('');
  const [selectedProjectType, setSelectedProjectType] = useState('');
  
  const grokAI = useRef(new GrokAI());

  // Topics aligned with existing learning paths
  const topics = [
    'Introduction to AI',
    'Office Productivity',
    'Personal Finance',
    'Social Media Marketing',
    'Videography',
    'eCommerce'
  ];

  // Common challenges for each topic
  const getChallenges = (topic) => {
    switch(topic) {
      case 'Introduction to AI':
        return [
          'Understanding AI Concepts',
          'Implementing Machine Learning',
          'Natural Language Processing',
          'Computer Vision',
          'AI Ethics and Bias'
        ];
      case 'Office Productivity':
        return [
          'Document Automation',
          'Email Management',
          'Meeting Optimization',
          'Task Prioritization',
          'Workflow Automation'
        ];
      case 'Personal Finance':
        return [
          'Budgeting',
          'Investment Planning',
          'Debt Management',
          'Retirement Planning',
          'Tax Optimization'
        ];
      case 'Social Media Marketing':
        return [
          'Content Creation',
          'Audience Growth',
          'Analytics and Insights',
          'Campaign Management',
          'Influencer Collaboration'
        ];
      case 'Videography':
        return [
          'Video Editing',
          'Camera Techniques',
          'Lighting Setup',
          'Audio Recording',
          'Post-Production Effects'
        ];
      case 'eCommerce':
        return [
          'Store Setup',
          'Product Management',
          'Payment Processing',
          'Customer Experience',
          'Marketing Automation'
        ];
      default:
        return [];
    }
  };

  // Project types for each challenge
  const getProjectTypes = (topic, challenge) => {
    if (!topic || !challenge) return [];
    
    // Common project types across all topics
    const commonTypes = ['Personal Project', 'Small Business', 'Enterprise Solution'];
    
    // Add specific project types based on topic and challenge
    switch(topic) {
      case 'Introduction to AI':
        return [...commonTypes, 'Research Project', 'Educational Tool'];
      case 'Office Productivity':
        return [...commonTypes, 'Team Workflow', 'Department Process'];
      case 'Personal Finance':
        return [...commonTypes, 'Family Budget', 'Investment Portfolio'];
      case 'Social Media Marketing':
        return [...commonTypes, 'Brand Campaign', 'Influencer Program'];
      case 'Videography':
        return [...commonTypes, 'Short Film', 'Tutorial Series', 'Documentary'];
      case 'eCommerce':
        return [...commonTypes, 'Product Launch', 'Store Migration', 'Marketplace Integration'];
      default:
        return commonTypes;
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

  // Reset dependent dropdowns when topic changes
  useEffect(() => {
    setSelectedChallenge('');
    setSelectedProjectType('');
  }, [selectedTopic]);

  // Reset project type when challenge changes
  useEffect(() => {
    setSelectedProjectType('');
  }, [selectedChallenge]);

  const handleCreatePlan = async () => {
    if (!projectDescription.trim() && !selectedTopic) {
      alert('Please enter a project description or select a topic');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Build a comprehensive description based on selections
      let enhancedDescription = projectDescription;
      
      if (selectedTopic) {
        enhancedDescription = enhancedDescription ? 
          `${enhancedDescription}\n\nTopic: ${selectedTopic}` : 
          `Project in ${selectedTopic}`;
      }
      
      if (selectedChallenge) {
        enhancedDescription = `${enhancedDescription}\nChallenge: ${selectedChallenge}`;
      }
      
      if (selectedProjectType) {
        enhancedDescription = `${enhancedDescription}\nProject Type: ${selectedProjectType}`;
      }
      
      // Call Grok to generate the game plan
      const response = await grokAI.current.generateGamePlan(
        enhancedDescription,
        selectedTopic,
        selectedChallenge,
        selectedProjectType
      );
      
      if (response.success) {
        // Save to Firebase
        const user = firebase.auth().currentUser;
        const newPlan = {
          description: projectDescription || `${selectedTopic} - ${selectedChallenge || 'General'}`,
          topic: selectedTopic,
          challenge: selectedChallenge,
          projectType: selectedProjectType,
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
        setSelectedTopic('');
        setSelectedChallenge('');
        setSelectedProjectType('');
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
            onClick={() => setShowModal(true)}
            className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Credits
          </button>
        )}
      </div>
      
      {/* Project description input with three-dropdown structure */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Game Plan</h2>
        
        {/* Three-dropdown structure */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* First dropdown: Topics */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Topic
            </label>
            <select 
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full p-2 border rounded-md"
              disabled={isProcessing}
            >
              <option value="">Select a topic</option>
              {topics.map(topic => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          </div>
          
          {/* Second dropdown: Challenges */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Common Challenge
            </label>
            <select 
              value={selectedChallenge}
              onChange={(e) => setSelectedChallenge(e.target.value)}
              className="w-full p-2 border rounded-md"
              disabled={!selectedTopic || isProcessing}
            >
              <option value="">Select a challenge</option>
              {getChallenges(selectedTopic).map(challenge => (
                <option key={challenge} value={challenge}>{challenge}</option>
              ))}
            </select>
          </div>
          
          {/* Third dropdown: Project Types */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Project Type
            </label>
            <select 
              value={selectedProjectType}
              onChange={(e) => setSelectedProjectType(e.target.value)}
              className="w-full p-2 border rounded-md"
              disabled={!selectedChallenge || isProcessing}
            >
              <option value="">Select a project type</option>
              {getProjectTypes(selectedTopic, selectedChallenge).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Project description textarea */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Additional Project Details (Optional)
          </label>
          <textarea
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            className="w-full p-3 border rounded-md"
            rows={4}
            placeholder="Add any specific details about your project that aren't covered by the selections above"
            disabled={isProcessing}
          ></textarea>
        </div>
        
        <button
          onClick={handleCreatePlan}
          disabled={isProcessing || (!projectDescription.trim() && !selectedTopic)}
          className="w-full mt-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
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
          
          {/* Topic, challenge, and project type tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {currentPlan.topic && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                {currentPlan.topic}
              </span>
            )}
            {currentPlan.challenge && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                {currentPlan.challenge}
              </span>
            )}
            {currentPlan.projectType && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                {currentPlan.projectType}
              </span>
            )}
          </div>
          
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
                
                {/* Topic, challenge, and project type tags */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {plan.topic && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                      {plan.topic}
                    </span>
                  )}
                  {plan.challenge && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded">
                      {plan.challenge}
                    </span>
                  )}
                  {plan.projectType && (
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                      {plan.projectType}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Purchase Credits</h2>
            <p className="mb-4">Select a credit package to continue using AI Game Plan generation.</p>
            
            <div className="grid grid-cols-1 gap-3 mb-4">
              <button 
                onClick={() => {
                  onAddCredits(5);
                  setShowModal(false);
                }}
                className="p-3 border rounded-md hover:bg-gray-50"
              >
                <div className="font-medium">5 Credits</div>
                <div className="text-sm text-gray-600">$4.99</div>
              </button>
              
              <button 
                onClick={() => {
                  onAddCredits(20);
                  setShowModal(false);
                }}
                className="p-3 border rounded-md hover:bg-gray-50"
              >
                <div className="font-medium">20 Credits</div>
                <div className="text-sm text-gray-600">$14.99</div>
              </button>
              
              <button 
                onClick={() => {
                  onAddCredits(50);
                  setShowModal(false);
                }}
                className="p-3 border rounded-md hover:bg-gray-50"
              >
                <div className="font-medium">50 Credits</div>
                <div className="text-sm text-gray-600">$29.99</div>
              </button>
            </div>
            
            <div className="flex justify-end">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyGamePlan;
