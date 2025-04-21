// MyGames.jsx - React component for the My Games feature
import React, { useState, useEffect, useRef } from 'react';
// Try to import our regular Firebase first, but if it fails, the browser will use the fallback
import firebase from '../firebase';
import VertexAIGameEngine from './vertexAI';
import LowCreditsWarning from './LowCreditsWarning';
import CreditPurchaseModal from './CreditPurchaseModal';
import { checkCreditsThreshold } from '../services/creditService';

const CreditManagement = ({ credits, onAddCredits }) => {
  const [showModal, setShowModal] = useState(false);
  const [creditAmount, setCreditAmount] = useState(10);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleAddCredits = async () => {
    setIsProcessing(true);
    try {
      await onAddCredits(creditAmount);
      setShowModal(false);
    } catch (error) {
      console.error('Error adding credits:', error);
      alert('Failed to add credits. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <>
      <div className="flex items-center space-x-2">
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
      
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Add Credits</h3>
            <p className="mb-4">Add more credits to continue enjoying AI Fundamentals games!</p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Amount:</label>
              <select 
                value={creditAmount}
                onChange={(e) => setCreditAmount(Number(e.target.value))}
                className="w-full p-2 border rounded"
              >
                <option value={10}>10 Credits - $1.99</option>
                <option value={50}>50 Credits - $7.99</option>
                <option value={100}>100 Credits - $14.99</option>
                <option value={500}>500 Credits - $59.99</option>
              </select>
            </div>
            
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleAddCredits}
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Purchase Credits'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const InsufficientCreditsPrompt = ({ message, options, onAction, onClose }) => {
  // Calculate days until next month for monthly credit refresh
  const daysUntilNextMonth = () => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return lastDay - now.getDate() + 1;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-bold mb-2">Insufficient Credits</h3>
        <p className="mb-4 text-red-600">{message}</p>
        
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded">
          <p className="text-sm">
            <span className="font-medium">Monthly Credits: </span>
            Free accounts receive 20 credits on the 1st of every month.
            <span className="block mt-1">
              Next refresh in: <span className="font-bold">{daysUntilNextMonth()} days</span>
            </span>
          </p>
        </div>
        
        <div className="space-y-3 mb-6">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => onAction(option.action)}
              className="w-full text-left p-3 border rounded-md hover:bg-gray-50 flex items-center"
            >
              <div className="flex-1">
                <p className="font-medium">{option.label}</p>
                <p className="text-sm text-gray-500">{option.description}</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          ))}
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const MyGames = ({ firebaseProp }) => {
  // Use the firebase that was imported or passed in as a prop
  const firebaseInstance = firebaseProp || firebase;
  
  // State variables
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gameEngine, setGameEngine] = useState(null);
  const [currentGame, setCurrentGame] = useState(null);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [difficulty, setDifficulty] = useState('easy');
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [credits, setCredits] = useState(0);
  const [inputType, setInputType] = useState('text');
  const [imageData, setImageData] = useState(null);
  const [audioData, setAudioData] = useState(null);
  const [error, setError] = useState(null);
  const [insufficientCreditsData, setInsufficientCreditsData] = useState(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [showInsufficientCreditsPrompt, setShowInsufficientCreditsPrompt] = useState(false);
  
  const chatContainerRef = useRef(null);
  
  // Initialize on component mount
  useEffect(() => {
    console.log('MyGames component mounted');
    try {
      // Initialize game engine
      console.log('Initializing game engine');
      const engine = new VertexAIGameEngine();
      setGameEngine(engine);
      
      // Listen for auth state changes
      console.log('Setting up auth listener');
      const unsubscribe = firebaseInstance.auth().onAuthStateChanged((user) => {
        console.log('Auth state changed:', user ? 'User logged in' : 'No user');
        setUser(user);
        setLoading(false);
      });
      
      // Fetch available topics
      console.log('Fetching topics');
      fetchTopics();
      
      // Cleanup on unmount
      return () => {
        console.log('Cleaning up auth listener');
        unsubscribe();
      };
    } catch (error) {
      console.error('Error in initialization:', error);
      setError(error.message);
    }
  }, [firebaseInstance]);
  
  // Fetch available topics
  const fetchTopics = async () => {
    try {
      console.log('Fetching topics list');
      // This would typically be a Firestore query
      // For now, we'll use hardcoded topics based on your learning paths
      const topicsList = [
        { id: 'intro-to-ai', name: 'Introduction to AI', description: 'Learn the basics of artificial intelligence and its applications.' },
        { id: 'office-productivity', name: 'Office Productivity', description: 'Use AI to enhance your productivity in office environments.' },
        { id: 'personal-finance', name: 'Personal Finance', description: 'Apply AI to personal finance management and investment.' },
        { id: 'social-media-marketing', name: 'Social Media Marketing', description: 'Leverage AI for effective social media marketing strategies.' },
        { id: 'videography', name: 'Videography', description: 'Enhance video production and editing with AI tools.' },
        { id: 'ecommerce', name: 'eCommerce', description: 'Optimize eCommerce operations and sales with AI.' }
      ];
      
      console.log('Setting topics:', topicsList);
      setTopics(topicsList);
      setSelectedTopic(topicsList[0]);
    } catch (error) {
      console.error('Error fetching topics:', error);
      setError('Failed to load topics. Please try again.');
    }
  };
  
  // Start a new game
  const startNewGame = async () => {
    if (!user || !selectedTopic) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const gameResult = await gameEngine.initializeGame(
        user.uid,
        selectedTopic.id,
        difficulty
      );
      
      // Check if initialization failed due to insufficient credits
      if (!gameResult.success && gameResult.errorType === 'insufficient_credits') {
        // Set data for insufficient credits prompt
        setInsufficientCreditsData(gameResult);
        setShowInsufficientCreditsPrompt(true);
        setLoading(false);
        return;
      }
      
      // Normal success flow
      setCurrentGame(gameResult);
      setMessages(gameResult.conversationHistory);
      setCredits(gameEngine.userProfile.credits);
    } catch (error) {
      console.error('Error starting game:', error);
      
      // Check if error is related to insufficient credits
      if (error.message && error.message.includes('Insufficient credits')) {
        setInsufficientCreditsData({
          message: 'You don\'t have enough credits to start a new game.',
          currentCredits: gameEngine.userProfile ? gameEngine.userProfile.credits : 0,
          options: [
            {
              action: 'add_credits',
              label: 'Purchase Credits',
              description: 'Buy credits to continue your learning journey.'
            },
            {
              action: 'wait_for_monthly',
              label: 'Wait for Monthly Credits',
              description: 'Free accounts receive 20 credits on the 1st of each month.'
            }
          ]
        });
        setShowInsufficientCreditsPrompt(true);
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Send user input to the game engine
  const sendMessage = async () => {
    if (!userInput.trim() && inputType === 'text') return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Add user message to UI immediately
      const userMessage = {
        role: 'user',
        content: userInput
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Process different input types
      let additionalData = null;
      if (inputType === 'image') {
        additionalData = imageData;
      } else if (inputType === 'audio') {
        additionalData = audioData;
      }
      
      // Send to game engine
      const result = await gameEngine.sendUserInput(
        userInput,
        inputType,
        additionalData
      );
      
      // Handle insufficient credits response
      if (result && !result.success && result.errorType === 'insufficient_credits') {
        setInsufficientCreditsData(result);
        setShowInsufficientCreditsPrompt(true);
        
        // Remove the user message since it wasn't processed
        setMessages(prev => prev.slice(0, -1));
        return;
      }
      
      // Update state with response
      setMessages(result.conversationHistory);
      setCredits(result.remainingCredits);
      
      // Clear input
      setUserInput('');
      setInputType('text');
      setImageData(null);
      setAudioData(null);
      
      // Scroll to bottom of chat
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle input type change
  const handleInputTypeChange = (type) => {
    setInputType(type);
    
    if (type === 'image') {
      // Open file picker for image
      document.getElementById('image-upload').click();
    } else if (type === 'audio') {
      // Start audio recording
      startAudioRecording();
    }
  };
  
  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target.result.split(',')[1]; // Remove data URL prefix
      setImageData(base64Data);
    };
    reader.readAsDataURL(file);
  };
  
  // Start audio recording
  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];
      
      mediaRecorder.addEventListener('dataavailable', (event) => {
        audioChunks.push(event.data);
      });
      
      mediaRecorder.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunks);
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64Data = e.target.result.split(',')[1]; // Remove data URL prefix
          setAudioData({
            data: base64Data,
            transcription: 'Transcription in progress...' // In a real app, you'd use Speech-to-Text here
          });
        };
        reader.readAsDataURL(audioBlob);
      });
      
      // Start recording
      mediaRecorder.start();
      
      // Stop recording after 10 seconds
      setTimeout(() => {
        mediaRecorder.stop();
        stream.getTracks().forEach(track => track.stop());
      }, 10000);
    } catch (error) {
      console.error('Error starting audio recording:', error);
      setError('Failed to start audio recording. Please check your microphone permissions.');
    }
  };
  
  // Change difficulty level
  const changeDifficulty = async (newDifficulty) => {
    if (!currentGame) return;
    
    try {
      setLoading(true);
      
      await gameEngine.changeDifficulty(newDifficulty);
      setDifficulty(newDifficulty);
      
      // Update messages to include system message about difficulty change
      setMessages(gameEngine.conversationHistory);
    } catch (error) {
      console.error('Error changing difficulty:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Change topic
  const changeTopic = async (topic) => {
    setSelectedTopic(topic);
    
    if (currentGame) {
      try {
        setLoading(true);
        
        const gameSession = await gameEngine.changeTopic(topic.id);
        
        setCurrentGame(gameSession);
        setMessages(gameSession.conversationHistory);
      } catch (error) {
        console.error('Error changing topic:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
  };
  
  // Save game progress
  const saveGameProgress = async () => {
    if (!currentGame) return;
    
    try {
      setLoading(true);
      
      await gameEngine.saveGameProgress();
      
      // Show success message
      setError(null);
      alert('Game progress saved successfully!');
    } catch (error) {
      console.error('Error saving game progress:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Scroll to bottom of chat
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };
  
  // Effect to scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Add credits to the user's account
  const handleAddCredits = async (amount) => {
    try {
      setLoading(true);
      
      // Call a Firebase function to add credits
      const addCreditsFunction = firebaseInstance.functions().httpsCallable('purchaseCredits');
      
      const result = await addCreditsFunction({
        amount,
        paymentMethod: 'demo' // In a real app, this would be the payment method info
      });
      
      // Update local state
      if (result.data && result.data.success) {
        setCredits(result.data.newTotal);
        setError(null);
        
        // Close any credit-related prompts
        setShowInsufficientCreditsPrompt(false);
        setIsPurchaseModalOpen(false);
        
        // Show success message
        alert(`Successfully added ${amount} credits to your account!`);
      } else {
        throw new Error(result.data?.message || 'Failed to add credits');
      }
    } catch (error) {
      console.error('Error adding credits:', error);
      setError('Failed to add credits. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle insufficient credits action
  const handleCreditAction = async (action) => {
    if (action === 'add_credits') {
      // Show the add credits modal
      setShowInsufficientCreditsPrompt(false);
      setIsPurchaseModalOpen(true);
    } else if (action === 'wait_for_monthly') {
      // Just close the dialog and show a message
      setShowInsufficientCreditsPrompt(false);
      alert('We\'ll notify you when your monthly credits are available!');
    }
  };
  
  // Render loading state
  if (loading && !currentGame) {
    return <div className="flex items-center justify-center min-h-[500px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>;
  }
  
  // Render error state
  if (error) {
    return <div className="flex items-center justify-center min-h-[500px]">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    </div>;
  }
  
  // Render main content
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Games</h1>
        <div className="flex items-center space-x-4">
          <CreditManagement 
            credits={credits} 
            onAddCredits={() => setIsPurchaseModalOpen(true)} 
          />
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="ml-2 px-3 py-1 border rounded-md"
          >
            <option value="easy">Easy</option>
            <option value="intermediate">Intermediate</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Low credits warning banner */}
      {credits > 0 && credits <= 20 && !showInsufficientCreditsPrompt && (
        <LowCreditsWarning 
          credits={credits} 
          onAddCredits={() => setIsPurchaseModalOpen(true)} 
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topics.map((topic) => (
          <div
            key={topic.id}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedTopic?.id === topic.id
                ? 'bg-primary-100 border-primary-500'
                : 'hover:bg-gray-50'
            }`}
            onClick={() => setSelectedTopic(topic)}
          >
            <h3 className="font-semibold">{topic.name}</h3>
            <p className="text-sm text-gray-600">{topic.description}</p>
          </div>
        ))}
      </div>

      {selectedTopic && (
        <div className="mt-4">
          <button
            onClick={startNewGame}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            disabled={loading}
          >
            {loading ? 'Starting...' : 'Start New Game'}
          </button>
        </div>
      )}

      {currentGame && (
        <div className="mt-4 border rounded-lg p-4">
          <div
            ref={chatContainerRef}
            className="h-96 overflow-y-auto space-y-4 mb-4"
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-3/4 p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-primary-100 text-gray-900'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1 px-4 py-2 border rounded-md"
              placeholder="Type your message..."
            />
            <button
              onClick={() => handleInputTypeChange('image')}
              className="p-2 text-gray-600 hover:text-primary-600"
            >
              <i className="fas fa-image"></i>
            </button>
            <button
              onClick={() => handleInputTypeChange('audio')}
              className="p-2 text-gray-600 hover:text-primary-600"
            >
              <i className="fas fa-microphone"></i>
            </button>
            <button
              onClick={sendMessage}
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      )}

      {/* Hidden file input for image uploads */}
      <input 
        type="file" 
        id="image-upload" 
        accept="image/*" 
        onChange={handleImageUpload} 
        style={{ display: 'none' }} 
      />

      {/* Credit Purchase Modal */}
      <CreditPurchaseModal 
        isOpen={isPurchaseModalOpen} 
        onClose={() => setIsPurchaseModalOpen(false)} 
        insufficientCreditsData={insufficientCreditsData}
        onPurchase={handleAddCredits}
      />

      {/* Insufficient Credits Prompt */}
      {showInsufficientCreditsPrompt && insufficientCreditsData && (
        <InsufficientCreditsPrompt 
          message={insufficientCreditsData.message}
          options={insufficientCreditsData.options}
          onAction={handleCreditAction}
          onClose={() => setShowInsufficientCreditsPrompt(false)}
        />
      )}
    </div>
  );
};

export default MyGames;
