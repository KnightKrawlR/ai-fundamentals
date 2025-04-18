// MyGames.jsx - React component for the My Games feature
import React, { useState, useEffect, useRef } from 'react';
import VertexAIGameEngine from './vertexAI';

const MyGames = ({ firebase }) => {
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
  
  const chatContainerRef = useRef(null);
  
  // Initialize on component mount
  useEffect(() => {
    // Initialize game engine
    const engine = new VertexAIGameEngine();
    setGameEngine(engine);
    
    // Listen for auth state changes
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    
    // Fetch available topics
    fetchTopics();
    
    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, [firebase]);
  
  // Fetch available topics
  const fetchTopics = async () => {
    try {
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
      
      const gameSession = await gameEngine.initializeGame(
        user.uid,
        selectedTopic.id,
        difficulty
      );
      
      setCurrentGame(gameSession);
      setMessages(gameSession.conversationHistory);
      setCredits(gameEngine.userProfile.credits);
      setError(null);
    } catch (error) {
      console.error('Error starting game:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Send user input to the game engine
  const sendMessage = async () => {
    if (!userInput.trim() && inputType === 'text') return;
    
    try {
      setLoading(true);
      
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
  
  // Render loading state
  if (loading && !currentGame) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
  // Render login prompt if not authenticated
  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Sign In to Play</h2>
        <p className="text-gray-600 mb-6">Please sign in to access the AI Games feature.</p>
        <button 
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          onClick={() => window.location.href = '/login.html'}
        >
          Sign In
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Games</h1>
        <div className="flex items-center">
          <div className="bg-purple-100 text-purple-800 rounded-full px-4 py-1 font-semibold mr-4">
            Credits: {credits}
          </div>
          {!currentGame ? (
            <button 
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              onClick={startNewGame}
            >
              New Game
            </button>
          ) : (
            <button 
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              onClick={saveGameProgress}
            >
              Save Progress
            </button>
          )}
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {/* Topic selection */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Choose a Topic</h2>
        <div className="flex flex-wrap">
          {topics.map(topic => (
            <div 
              key={topic.id}
              className={`px-4 py-2 rounded-full mr-2 mb-2 cursor-pointer transition-colors ${
                selectedTopic && selectedTopic.id === topic.id 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
              }`}
              onClick={() => changeTopic(topic)}
            >
              {topic.name}
            </div>
          ))}
        </div>
      </div>
      
      {/* Difficulty selection */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Difficulty Level</h2>
        <div className="flex">
          <button 
            className={`px-4 py-2 rounded-lg mr-2 ${
              difficulty === 'easy' 
                ? 'bg-green-600 text-white' 
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
            onClick={() => changeDifficulty('easy')}
          >
            Easy
          </button>
          <button 
            className={`px-4 py-2 rounded-lg mr-2 ${
              difficulty === 'intermediate' 
                ? 'bg-blue-600 text-white' 
                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
            }`}
            onClick={() => changeDifficulty('intermediate')}
          >
            Intermediate
          </button>
          <button 
            className={`px-4 py-2 rounded-lg ${
              difficulty === 'hard' 
                ? 'bg-red-600 text-white' 
                : 'bg-red-100 text-red-800 hover:bg-red-200'
            }`}
            onClick={() => changeDifficulty('hard')}
          >
            Hard
          </button>
        </div>
      </div>
      
      {/* Game interface */}
      {currentGame ? (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">{selectedTopic.name}</h2>
              <div className="flex items-center mt-1">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                  difficulty === 'intermediate' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </span>
                <span className="text-sm text-gray-500 ml-2">
                  {inputType === 'text' ? '1 credit per message' : 
                   inputType === 'image' ? '2 credits per message' : 
                   '1.5 credits per message'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Chat container */}
          <div 
            ref={chatContainerRef}
            className="bg-gray-50 rounded-lg p-4 mb-4 h-96 overflow-y-auto"
          >
            {messages.map((message, index) => (
              <div 
                key={index}
                className={`mb-4 ${
                  message.role === 'user' ? 'text-right' : 
                  message.role === 'system' ? 'text-center' : ''
                }`}
              >
                {message.role === 'system' ? (
                  <div className="bg-gray-200 text-gray-800 inline-block px-4 py-2 rounded-lg">
                    {message.content}
                  </div>
                ) : (
                  <div 
                    className={`inline-block px-4 py-2 rounded-lg max-w-3/4 ${
                      message.role === 'user' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-white border border-gray-200 text-gray-800'
                    }`}
                  >
                    {message.content}
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-center items-center py-4">
                <div className="animate-bounce mr-2">●</div>
                <div className="animate-bounce animation-delay-200 mr-2">●</div>
                <div className="animate-bounce animation-delay-400">●</div>
              </div>
            )}
          </div>
          
          {/* Input area */}
          <div className="flex flex-col">
            <div className="flex mb-2">
              <button 
                className={`mr-2 px-3 py-1 rounded-lg ${
                  inputType === 'text' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
                onClick={() => setInputType('text')}
              >
                Text
              </button>
              <button 
                className={`mr-2 px-3 py-1 rounded-lg ${
                  inputType === 'image' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
                onClick={() => handleInputTypeChange('image')}
              >
                Image
              </button>
              <button 
                className={`px-3 py-1 rounded-lg ${
                  inputType === 'audio' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
                onClick={() => handleInputTypeChange('audio')}
              >
                Audio
              </button>
              <input 
                type="file" 
                id="image-upload" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload} 
              />
            </div>
            
            <div className="flex items-center">
              <div className="flex-grow">
                <input 
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder={
                    inputType === 'text' ? "Type your message..." :
                    inputType === 'image' ? "Describe your image..." :
                    "Say something about your audio..."
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
              </div>
              <button 
                className="bg-purple-600 text-white p-2 rounded-lg ml-2 hover:bg-purple-700 transition-colors"
                onClick={sendMessage}
                disabled={loading}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
              </button>
            </div>
            
            {imageData && (
              <div className="mt-2 p-2 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600">Image selected. Click send to upload.</p>
              </div>
            )}
            
            {audioData && (
              <div className="mt-2 p-2 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600">Audio recorded. Click send to upload.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Ready to Play?</h2>
          <p className="text-gray-600 mb-6">
            Select a topic and difficulty level, then click "New Game" to start learning AI skills through interactive gameplay.
          </p>
          <button 
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            onClick={startNewGame}
          >
            Start New Game
          </button>
        </div>
      )}
    </div>
  );
};

export default MyGames;
