// MyGames.jsx - React component for the My Games feature
import React, { useState, useEffect, useRef } from 'react';
// Prefer the globally available Firebase first, falling back to our module import
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

// Add a function to check if user is allowed to bypass credit checks
const isVipUser = (email) => {
  const vipEmails = ['walexisjr@gmail.com'];
  return vipEmails.includes(email?.toLowerCase());
};

const MyGames = ({ firebaseProp }) => {
  // Use the global firebase first if available, then the passed prop, then the imported module
  const firebaseInstance = (typeof window !== 'undefined' && window.firebase) 
    ? window.firebase 
    : (firebaseProp || firebase);
  
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
  
  // Hide the loading indicator when component mounts
  useEffect(() => {
    // Hide the loading fallback
    const loadingFallback = document.getElementById('loading-fallback');
    if (loadingFallback) {
      loadingFallback.style.display = 'none';
    }
    
    // Initialize game engine
    console.log('Initializing game engine');
    try {
      const engine = new VertexAIGameEngine();
      setGameEngine(engine);
      
      // Attempt to set up Firebase auth listener
      if (firebaseInstance) {
        console.log("Setting up Firebase auth listener");
        const unsubscribe = firebaseInstance.auth().onAuthStateChanged(async (authUser) => {
          console.log("Auth state changed:", authUser);
          if (authUser) {
            // User is signed in
            setUser(authUser);
            
            // Try to get user profile from Firestore
            try {
              const db = firebaseInstance.firestore();
              const userDoc = await db.collection('users').doc(authUser.uid).get();
              
              if (userDoc.exists) {
                const userData = userDoc.data();
                console.log("User data from Firestore:", userData);
                
                // Set user profile in game engine
                if (engine) {
                  engine.userProfile = {
                    uid: authUser.uid,
                    email: authUser.email,
                    credits: userData.credits || 10,
                    totalCreditsUsed: userData.totalCreditsUsed || 0,
                    ...userData
                  };
                  console.log("Set user profile in game engine:", engine.userProfile);
                }
                
                // Update credits in UI
                setCredits(userData.credits || 10);
              } else {
                console.log("Creating new user profile");
                // Create user profile if it doesn't exist
                await db.collection('users').doc(authUser.uid).set({
                  email: authUser.email,
                  displayName: authUser.displayName,
                  credits: 10,
                  totalCreditsUsed: 0,
                  createdAt: firebaseInstance.firestore.FieldValue.serverTimestamp()
                });
                
                if (engine) {
                  engine.userProfile = {
                    uid: authUser.uid,
                    email: authUser.email,
                    credits: 10,
                    totalCreditsUsed: 0
                  };
                }
                
                setCredits(10);
              }
            } catch (error) {
              console.error("Error fetching user data:", error);
              // Set fallback user profile if Firestore fails
              if (engine) {
                engine.userProfile = {
                  uid: authUser.uid,
                  email: authUser.email,
                  credits: 10,
                  totalCreditsUsed: 0
                };
              }
              setCredits(10);
            }
          } else {
            // User is signed out, use demo mode
            console.log("No authenticated user, using demo mode");
            const demoUser = {
              uid: 'demo-user-' + Date.now(),
              email: 'demo@example.com',
              displayName: 'Demo User'
            };
            
            setUser(demoUser);
            
            if (engine) {
              engine.userProfile = {
                uid: demoUser.uid,
                email: demoUser.email,
                credits: 10,
                totalCreditsUsed: 0
              };
            }
            
            setCredits(10);
          }
          
          setLoading(false);
          
          // Fetch topics after user is set up
          fetchTopics();
        });
        
        return () => {
          // Cleanup auth listener on unmount
          if (unsubscribe) unsubscribe();
        };
      } else {
        // No Firebase available, use demo mode
        console.warn("Firebase not available, using demo mode");
        initializeDemoData();
        setLoading(false);
      }
    } catch (error) {
      console.error('Error initializing game engine:', error);
      setError('Failed to initialize game engine. Please try again.');
      initializeDemoData();
      setLoading(false);
    }
  }, [firebaseInstance]);
  
  // Initialize with demo data
  const initializeDemoData = () => {
    // Set some initial credits for demo
    setCredits(10);
    
    // If no topics, set demo topics
    if (topics.length === 0) {
      const demoTopics = [
        { id: 'intro-to-ai', name: 'Introduction to AI', description: 'Learn the basics of artificial intelligence and its applications.' },
        { id: 'office-productivity', name: 'Office Productivity', description: 'Use AI to enhance your productivity in office environments.' },
        { id: 'personal-finance', name: 'Personal Finance', description: 'Apply AI to personal finance management and investment.' },
        { id: 'social-media-marketing', name: 'Social Media Marketing', description: 'Leverage AI for effective social media marketing strategies.' },
        { id: 'videography', name: 'Videography', description: 'Enhance video production and editing with AI tools.' },
        { id: 'ecommerce', name: 'eCommerce', description: 'Optimize eCommerce operations and sales with AI.' }
      ];
      setTopics(demoTopics);
      setSelectedTopic(demoTopics[0]);
    }
  };
  
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
  
  // Start a new game - modified to use real game engine
  const startNewGame = async () => {
    if (!selectedTopic) {
      alert("Please select a topic first");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Use the actual game engine with real API calls
      if (gameEngine) {
        console.log("Using real game engine to start game with topic:", selectedTopic);
        
        // Set user profile info in the game engine if not set
        if (!gameEngine.userProfile) {
          gameEngine.userProfile = {
            uid: user?.uid || 'demo-user-123',
            email: user?.email || 'demo@example.com',
            credits: credits,
            totalCreditsUsed: 0
          };
        }

        // Check if this is a VIP user who can bypass credit checks
        const isVip = isVipUser(user?.email || gameEngine.userProfile?.email);
        console.log("Is VIP user:", isVip, user?.email);
        
        // If VIP user, set credits to a high number to bypass all checks
        if (isVip) {
          console.log("VIP user detected - bypassing credit checks");
          gameEngine.userProfile.credits = 9999;
          setCredits(9999);
        }
        
        try {
          const result = await gameEngine.initializeGame(selectedTopic, difficulty);
          console.log("Game session initialized:", result);
          
          // Update credits from the result (but preserve VIP status)
          if (result.remainingCredits !== undefined && !isVip) {
            setCredits(result.remainingCredits);
          }
          
          // Set the current game and initial message
          setCurrentGame({
            sessionId: result.sessionId,
            topicId: selectedTopic.id,
            difficulty,
            creditsUsed: result.creditsUsed || 1
          });
          
          // Set initial message
          setMessages([{
            role: 'assistant',
            content: result.initialPrompt || `Welcome to your AI learning game about ${selectedTopic.name}! I'm your AI guide. What would you like to know about this topic?`
          }]);
        } catch (error) {
          console.error("Error initializing game with engine:", error);
          
          // Check for insufficient credits - but bypass for VIP
          if (!isVip && error.message && error.message.includes("Insufficient credits")) {
            setInsufficientCreditsData({
              message: `You don't have enough credits to start a new game. ${error.message}`,
              currentCredits: credits,
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
            setLoading(false);
            return;
          }
          
          // Fallback to basic initialization if error
          console.log("Falling back to basic initialization due to error");
          fallbackToBasicInitialization();
        }
      } else {
        console.warn("No game engine available, using basic initialization");
        fallbackToBasicInitialization();
      }
    } catch (error) {
      console.error('Error starting game:', error);
      setError('Failed to start game. Please try again.');
      fallbackToBasicInitialization();
    } finally {
      setLoading(false);
    }
    
    // Fallback initialization function
    function fallbackToBasicInitialization() {
      const demoGameSession = {
        userId: user?.uid || 'demo-user-123',
        topicId: selectedTopic.id,
        difficulty,
        sessionId: `demo-session-${Date.now()}`,
        startTime: new Date(),
        lastInteractionTime: new Date(),
        conversationHistory: [{
          role: 'assistant',
          content: `Welcome to your AI learning game about ${selectedTopic.name}! I'm your AI guide. What would you like to know about this topic?`
        }],
        skillsGained: [],
        progress: 0,
        creditsUsed: 1
      };
      
      // Update credits (deduct 1) - but skip for VIP users
      if (!isVipUser(user?.email)) {
        const newCredits = credits - 1;
        if (newCredits < 0) {
          setInsufficientCreditsData({
            message: "You don't have enough credits to start a new game.",
            currentCredits: credits,
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
          return;
        }
        setCredits(newCredits);
      }
      
      setCurrentGame(demoGameSession);
      setMessages(demoGameSession.conversationHistory);
    }
  };
  
  // Send user input to the game engine - modified to use real API
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
      
      // Store current input
      const currentInput = userInput;
      
      // Clear input field immediately for better UX
      setUserInput('');

      // Check if this is a VIP user who can bypass credit checks
      const isVip = isVipUser(user?.email || gameEngine?.userProfile?.email);
      
      // Use the actual game engine if available
      if (gameEngine && gameEngine.currentGameSession) {
        console.log("Sending message to real game engine:", currentInput);
        
        // If VIP user, ensure they have enough credits
        if (isVip && gameEngine.userProfile) {
          gameEngine.userProfile.credits = 9999;
        }
        
        try {
          const response = await gameEngine.sendUserInput(currentInput);
          console.log("Game engine response:", response);
          
          if (response.success === false) {
            // Handle error responses - but bypass insufficient credits for VIP
            console.error("Error from game engine:", response);
            
            if (response.errorType === 'insufficient_credits' && !isVip) {
              setInsufficientCreditsData({
                message: response.message,
                currentCredits: response.currentCredits,
                options: response.options
              });
              setShowInsufficientCreditsPrompt(true);
            } else {
              setError(response.message || "Error sending message");
            }
          } else {
            // Handle successful responses
            const aiResponse = {
              role: 'assistant',
              content: response.aiResponse
            };
            
            setMessages(prev => [...prev, aiResponse]);
            
            // Update credits if provided (but preserve VIP status)
            if (response.remainingCredits !== undefined && !isVip) {
              setCredits(response.remainingCredits);
            }
          }
        } catch (error) {
          console.error("Error sending message via game engine:", error);
          fallbackToDemo(currentInput);
        }
      } else {
        console.warn("No game engine or active session, using demo response");
        fallbackToDemo(currentInput);
      }
    } catch (error) {
      console.error('Error in sendMessage:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
      
      // Scroll to bottom of chat
      scrollToBottom();
    }
    
    // Fallback function for demo response
    function fallbackToDemo(input) {
      console.log("Using fallback demo response");
      setTimeout(() => {
        const aiResponse = {
          role: 'assistant',
          content: `Thank you for your message about "${input}". This is a demo response since we're in development mode. In the real app, this would be a thoughtful AI response about ${selectedTopic?.name || 'your selected topic'}.`
        };
        
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);
    }
  };
  
  // Handle input type change
  const handleInputTypeChange = (type) => {
    setInputType(type);
    
    if (type === 'image') {
      // Open file picker for image
      document.getElementById('image-upload')?.click();
    } else if (type === 'audio') {
      alert("Audio recording is not available in the demo version");
    }
  };
  
  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target?.result.split(',')[1]; // Remove data URL prefix
      setImageData(base64Data);
      
      // Auto-send a message with the uploaded image
      setUserInput('I uploaded an image for analysis');
      setTimeout(() => sendMessage(), 500);
    };
    reader.readAsDataURL(file);
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
  
  // Add credits to the user's account - simplified for demo
  const handleAddCredits = async (amount) => {
    try {
      setLoading(true);
      
      // Simple demo - just add credits
      const newTotal = credits + amount;
      setCredits(newTotal);
      
      // Close any credit-related prompts
      setShowInsufficientCreditsPrompt(false);
      setIsPurchaseModalOpen(false);
      
      // Show success message
      alert(`Successfully added ${amount} credits to your account!`);
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
  
  // Render main content
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Games</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className={`text-sm ${credits < 5 ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
              Credits: {credits}
            </span>
            <button
              onClick={() => setIsPurchaseModalOpen(true)}
              className="text-xs px-2 py-1 bg-primary-500 text-white rounded hover:bg-primary-600"
            >
              Add Credits
            </button>
          </div>
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
      {credits > 0 && credits <= 5 && !showInsufficientCreditsPrompt && (
        <div className="p-4 mb-4 rounded-lg text-sm bg-yellow-100 text-yellow-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div>
              <span className="font-bold">Low Credits Warning: {credits} {credits === 1 ? 'credit' : 'credits'} remaining</span>
              <p className="mt-1">You're running low on credits. Consider purchasing more to avoid interruptions.</p>
            </div>
            <button 
              className="mt-3 sm:mt-0 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
              onClick={() => setIsPurchaseModalOpen(true)}
            >
              Add Credits
            </button>
          </div>
        </div>
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
      {isPurchaseModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Purchase Credits</h3>
              <button 
                onClick={() => setIsPurchaseModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {insufficientCreditsData && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">
                <p>{insufficientCreditsData.message}</p>
              </div>
            )}
            
            <div className="space-y-4 my-4">
              <div className="text-lg font-medium">Select a credit package:</div>
              
              <div className="grid gap-4">
                {[
                  { key: 'basic', amount: 20, price: '$1.99', popular: false },
                  { key: 'standard', amount: 50, price: '$3.99', popular: true },
                  { key: 'premium', amount: 100, price: '$6.99', popular: false }
                ].map((pkg) => (
                  <div 
                    key={pkg.key}
                    onClick={() => handleAddCredits(pkg.amount)}
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:border-primary-500 hover:bg-primary-50`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-bold text-xl">{pkg.amount} Credits</span>
                        <p className="text-gray-600">{pkg.price}</p>
                      </div>
                      {pkg.popular && (
                        <span className="bg-primary-100 text-primary-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                          Most Popular
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsPurchaseModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Insufficient Credits Prompt */}
      {showInsufficientCreditsPrompt && insufficientCreditsData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-2">Insufficient Credits</h3>
            <p className="mb-4 text-red-600">{insufficientCreditsData.message}</p>
            
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded">
              <p className="text-sm">
                <span className="font-medium">Monthly Credits: </span>
                Free accounts receive 20 credits on the 1st of every month.
                <span className="block mt-1">
                  Next refresh in: <span className="font-bold">15 days</span>
                </span>
              </p>
            </div>
            
            <div className="space-y-3 mb-6">
              {insufficientCreditsData.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleCreditAction(option.action)}
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
                onClick={() => setShowInsufficientCreditsPrompt(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyGames;
