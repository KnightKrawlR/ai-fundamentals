// vertexAI.js - Firebase Vertex AI Integration for My Games Feature

/**
 * Class to handle Vertex AI interactions for the My Games feature
 */
class VertexAIGameEngine {
  constructor() {
    this.currentGameSession = null;
    this.userProfile = null;
    this.currentTopic = null;
    this.difficultyLevel = 'easy'; // Default difficulty
    this.conversationHistory = [];
    
    // Get Firebase instance - prefer global one
    this.firebase = (typeof window !== 'undefined' && window.firebase) ? window.firebase : null;
    
    // Log Firebase initialization status
    if (this.firebase) {
      console.log("Firebase initialized in VertexAIGameEngine:", this.firebase.app().name);
      console.log("Firebase project:", this.firebase.app().options.projectId);
    } else {
      console.error("Firebase not available in VertexAIGameEngine");
    }
    
    // Default sample topics for fallback
    this.sampleTopics = [
      { 
        id: 'intro-to-ai', 
        name: 'Introduction to AI', 
        description: 'Learn the basics of artificial intelligence and its applications.' 
      },
      { 
        id: 'office-productivity', 
        name: 'Office Productivity', 
        description: 'Use AI to enhance your productivity in office environments.' 
      },
      { 
        id: 'personal-finance', 
        name: 'Personal Finance', 
        description: 'Apply AI to personal finance management and investment.' 
      }
    ];
    
    // Bind methods
    this.initializeGame = this.initializeGame.bind(this);
    this.sendUserInput = this.sendUserInput.bind(this);
    this.generateAIResponse = this.generateAIResponse.bind(this);
    this.saveGameProgress = this.saveGameProgress.bind(this);
    this.loadGameProgress = this.loadGameProgress.bind(this);
    this.changeDifficulty = this.changeDifficulty.bind(this);
    this.changeTopic = this.changeTopic.bind(this);
    this.processImageInput = this.processImageInput.bind(this);
    this.processAudioInput = this.processAudioInput.bind(this);
    this.calculateCreditCost = this.calculateCreditCost.bind(this);
  }

  /**
   * Helper method to call a function through the CORS proxy if direct calls fail
   * @param {string} functionName - The name of the function to call
   * @param {Object} data - The data to pass to the function
   * @returns {Promise<Object>} - The function response
   */
  async callWithCorsProxy(functionName, data) {
    console.log(`Calling ${functionName} with data:`, data);
    
    // Use our HTTP endpoints which have proper CORS headers
    if (functionName === 'initializeGameSession') {
      try {
        console.log('Using HTTP endpoint for game initialization');
        
        // Use the HTTP endpoint
        const response = await fetch('https://us-central1-ai-fundamentals-ad37d.cloudfunctions.net/initGameHttp', {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            topicId: data.topicId,
            difficulty: data.difficulty,
            model: data.model || 'gemini-pro',
            options: data.options || {}
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('HTTP error response:', errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Game initialization response:', result);
        return result;
      } catch (error) {
        console.error('Error with HTTP game initialization:', error);
        
        // If the HTTP endpoint fails, try to use a fallback
        const fallbackResponse = {
          sessionId: `fallback-${Date.now()}`,
          initialPrompt: `Welcome to your learning session! I'll be your AI guide for exploring ${data.topicId || 'this topic'}. What specific aspects would you like to learn about?`,
          conversationHistory: [
            {
              role: 'assistant',
              content: `Welcome to your learning session! I'll be your AI guide for exploring ${data.topicId || 'this topic'}. What specific aspects would you like to learn about?`
            }
          ],
          success: false,
          error: error.message,
          isFallback: true
        };
        
        return fallbackResponse;
      }
    }
    
    if (functionName === 'sendGameMessage') {
      try {
        console.log('Using HTTP endpoint for game message');
        
        // Use the HTTP endpoint with topic and difficulty info
        const response = await fetch('https://us-central1-ai-fundamentals-ad37d.cloudfunctions.net/sendMessageHttp', {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sessionId: data.sessionId,
            message: data.message,
            topicId: this.currentTopic?.id || data.topicId,
            difficulty: this.difficultyLevel || data.difficulty || 'intermediate',
            model: data.model || 'gemini-pro',
            options: data.options || {}
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('HTTP error response:', errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Game message response:', result);
        return result;
      } catch (error) {
        console.error('Error with HTTP game message:', error);
        
        // If the HTTP endpoint fails, return a helpful fallback
        const fallbackResponse = {
          aiResponse: `I'm having difficulty connecting to the AI service at the moment. Your question was about "${data.message}". Please try again in a moment, or try a different question.`,
          success: false,
          error: error.message,
          isFallback: true
        };
        
        return fallbackResponse;
      }
    }
    
    // If we get here, we're trying to make a real API call, but we don't have a specific handler
    console.log('Using the health check endpoint to test connectivity');
    try {
      const response = await fetch('https://us-central1-ai-fundamentals-ad37d.cloudfunctions.net/healthCheck', {
        method: 'GET',
        mode: 'cors'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Health check response:', result);
      
      // Return a generic error for unsupported functions
      throw new Error(`No handler for function: ${functionName}`);
    } catch (error) {
      console.error('Error in connectivity test:', error);
      throw error;
    }
  }

  /**
   * Initialize a new game session
   * @param {string} userId - The current user's ID
   * @param {string} topicId - The selected topic ID
   * @param {string} difficulty - The selected difficulty level
   * @returns {Promise<Object>} - The initialized game session
   */
  async initializeGame(topic, difficulty = 'intermediate') {
    try {
      console.log('Initializing game with topic:', topic, 'and difficulty:', difficulty);
      
      // Check if user has enough credits
      const initialCreditCost = this.calculateCreditCost('initialize');
      if (this.userProfile.credits < initialCreditCost) {
        throw new Error(`Insufficient credits (${this.userProfile.credits}/${initialCreditCost})`);
      }
      
      try {
        console.log('Attempting to initialize game session with Vertex AI');
        
        // Use our HTTP endpoint with proper CORS support
        const proxyResponse = await this.callWithCorsProxy('initializeGameSession', {
          topicId: topic.id,
          difficulty: difficulty,
          model: 'gemini-pro',
          options: {
            temperature: 0.7,
            maxTokens: 1024
          }
        });
        
        if (proxyResponse && proxyResponse.sessionId) {
          this.currentGameSession = {
            sessionId: proxyResponse.sessionId,
            userId: this.userProfile.uid,
            topicId: topic.id,
            difficulty: difficulty,
            creditsUsed: initialCreditCost,
            isFallback: proxyResponse.isFallback || false
          };
          
          this.currentTopic = topic;
          this.conversationHistory = proxyResponse.conversationHistory || [{
            role: 'assistant',
            content: proxyResponse.initialPrompt
          }];
          
          // Update local credit count
          this.userProfile.credits -= initialCreditCost;
          
          console.log('Game initialized:', this.currentGameSession);
          
          return {
            sessionId: this.currentGameSession.sessionId,
            initialPrompt: this.conversationHistory[0].content,
            creditsUsed: initialCreditCost,
            remainingCredits: this.userProfile.credits,
            isFallback: proxyResponse.isFallback || false
          };
        } else {
          throw new Error('Invalid response from initialization');
        }
      } catch (error) {
        console.error('Error initializing game with Vertex AI:', error);
        
        // Connectivity issue fallback
        const introText = `I'll be your guide to learning about ${topic.name}. We're currently experiencing a connection issue with our AI service. Please try again in a moment, or let me know what specific aspects of ${topic.name} you're interested in, and I'll do my best to help once connectivity is restored.`;
        
        this.currentGameSession = {
          sessionId: `fallback-${Date.now()}`,
          userId: this.userProfile.uid,
          topicId: topic.id,
          difficulty: difficulty,
          creditsUsed: initialCreditCost,
          connectivityIssue: true
        };
        
        this.currentTopic = topic;
        this.conversationHistory = [{
          role: 'assistant',
          content: introText
        }];
        
        // Update local credit count
        this.userProfile.credits -= initialCreditCost;
        
        return {
          sessionId: this.currentGameSession.sessionId,
          initialPrompt: introText,
          creditsUsed: initialCreditCost,
          remainingCredits: this.userProfile.credits,
          connectivityIssue: true
        };
      }
    } catch (error) {
      console.error('Error initializing game:', error);
      
      // Return a structured error response
      if (error.message.includes('Insufficient credits')) {
        return {
          success: false,
          errorType: 'insufficient_credits',
          message: error.message,
          currentCredits: this.userProfile.credits,
          requiredCredits: this.calculateCreditCost('initialize'),
          options: [
            {
              action: 'add_credits',
              label: 'Purchase Credits',
              description: 'Buy credits to continue your learning journey.'
            },
            {
              action: 'wait_for_monthly',
              label: 'Wait for Monthly Credits',
              description: 'Reminder: Free accounts receive 20 credits on the 1st of each month.'
            }
          ]
        };
      }
      
      throw error;
    }
  }

  /**
   * Generate the initial prompt based on topic and difficulty
   * @returns {string} - The initial prompt for Vertex AI
   */
  generateInitialPrompt() {
    const difficultyDescriptions = {
      easy: 'Use simple language and avoid technical jargon. Explain concepts thoroughly with everyday examples. Provide step-by-step guidance and frequent encouragement.',
      intermediate: 'Use industry-standard terminology with explanations when needed. Provide practical examples and use cases. Balance guidance with challenges that encourage problem-solving.',
      hard: 'Use technical language and industry-specific terminology. Present complex scenarios that require synthesis of multiple concepts. Provide minimal guidance, encouraging critical thinking and creative solutions.'
    };
    
    return `You are an AI gaming assistant for AI Fundamentals, helping users learn AI skills related to ${this.currentTopic.name}.
Difficulty: ${this.difficultyLevel.toUpperCase()}

${difficultyDescriptions[this.difficultyLevel]}
Focus on how these skills can be applied to earn money or improve career prospects.

Start by introducing yourself and asking the user what specific aspect of ${this.currentTopic.name} they're interested in learning about.`;
  }

  /**
   * Send user input to the game engine
   * @param {string} userInput - The user's text input
   * @param {string} inputType - The type of input (text, image, audio)
   * @param {Object} additionalData - Additional data for non-text inputs
   * @returns {Promise<Object>} - The AI response and updated game state
   */
  async sendUserInput(userInput, inputType = 'text', additionalData = null) {
    console.log('sendUserInput called with', { userInput, inputType });
    try {
      if (!this.currentGameSession) {
        throw new Error('No active game session');
      }
      
      // Calculate credit cost
      const creditCost = this.calculateCreditCost(inputType);
      
      // Check if user has enough credits
      if (this.userProfile.credits < creditCost) {
        // Return a structured response
        return {
          success: false,
          errorType: 'insufficient_credits',
          message: `You need ${creditCost} credits to continue, but you only have ${this.userProfile.credits}.`,
          currentCredits: this.userProfile.credits,
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
        };
      }
      
      // Update conversation history with user message
      this.conversationHistory.push({
        role: 'user',
        content: userInput
      });
      
      try {
        // Use the HTTP endpoint for game messages
        const response = await this.callWithCorsProxy('sendGameMessage', {
          sessionId: this.currentGameSession.sessionId,
          message: userInput,
          model: 'gemini-pro',
          options: {
            temperature: 0.7,
            maxTokens: 1024
          }
        });
        
        console.log('Game message response:', response);
        
        // If there was an error but we got a fallback response
        if (response.isFallback) {
          console.log('Using fallback AI response');
        }
        
        // Update conversation history with AI response
        this.conversationHistory.push({
          role: 'assistant',
          content: response.aiResponse
        });
        
        // Update local state
        this.currentGameSession.creditsUsed += creditCost;
        this.userProfile.credits -= creditCost;
        
        return {
          aiResponse: response.aiResponse,
          creditsUsed: creditCost,
          remainingCredits: this.userProfile.credits,
          conversationHistory: this.conversationHistory,
          isFallback: response.isFallback || false
        };
      } catch (error) {
        console.error('Error with sendGameMessage:', error);
        
        // General connectivity error fallback
        const fallbackResponse = `I apologize, but I'm having trouble connecting to our AI service. Your question was about "${userInput}". This appears to be a technical issue. Please try again in a moment.`;
        
        // Add fallback to conversation history
        this.conversationHistory.push({
          role: 'assistant',
          content: fallbackResponse
        });
        
        return {
          aiResponse: fallbackResponse,
          creditsUsed: creditCost,
          remainingCredits: this.userProfile.credits,
          conversationHistory: this.conversationHistory,
          isError: true
        };
      }
    } catch (error) {
      console.error('Error sending user input:', error);
      
      // Return a helpful error message
      return {
        success: false,
        errorType: 'api_error',
        message: 'Error connecting to AI service. Please try again in a moment.',
        error: error.message
      };
    }
  }

  /**
   * Generate AI response
   * @param {string} prompt - The prompt for the AI
   * @returns {Promise<string>} - The AI response
   */
  async generateAIResponse(prompt) {
    console.log('generateAIResponse called with prompt length:', prompt.length);
    try {
      // Call Firebase Function that interfaces with Vertex AI
      const generateResponse = this.firebase.functions().httpsCallable('generateVertexAIResponse');
      
      const result = await generateResponse({
        prompt: prompt,
        model: 'gemini-pro',
        options: {
          maxTokens: 1024,
          temperature: 0.7
        }
      });
      
      console.log('VertexAI response received:', result.data);
      return result.data.text;
    } catch (error) {
      console.error('Error generating AI response:', error);
      return "I apologize, but I encountered an error processing your request. Please try again.";
    }
  }

  /**
   * Process image input
   * @param {string} userText - The user's text accompanying the image
   * @param {Object} imageData - The image data
   * @returns {Promise<string>} - The processed input
   */
  async processImageInput(userText, imageData) {
    try {
      // Call Firebase Function to process image
      const processImage = this.firebase.functions().httpsCallable('processImageForVertexAI');
      
      const result = await processImage({
        imageData,
        userText
      });
      
      return result.data.processedInput;
    } catch (error) {
      console.error('Error processing image input:', error);
      return userText + " [Error processing image]";
    }
  }

  /**
   * Process audio input
   * @param {string} userText - The user's text accompanying the audio
   * @param {Object} audioData - The audio data
   * @returns {Promise<string>} - The processed input
   */
  async processAudioInput(userText, audioData) {
    try {
      // Call Firebase Function to process audio
      const processAudio = this.firebase.functions().httpsCallable('processAudioForVertexAI');
      
      const result = await processAudio({
        audioData,
        userText
      });
      
      return result.data.processedInput;
    } catch (error) {
      console.error('Error processing audio input:', error);
      return userText + " [Error processing audio]";
    }
  }

  /**
   * Calculate credit cost based on input type
   * @param {string} inputType - The type of input (text, image, audio)
   * @returns {number} - The credit cost
   */
  calculateCreditCost(inputType) {
    switch (inputType) {
      case 'image':
        return 2; // Higher cost for image processing
      case 'audio':
        return 2; // Higher cost for audio processing
      case 'text':
      default:
        return 1; // Standard cost for text
    }
  }

  /**
   * Check if user has low credits and should be warned
   * @returns {boolean} - True if credits are low
   */
  hasLowCredits() {
    return this.userProfile && this.userProfile.credits <= 5;
  }

  /**
   * Save game progress
   * @returns {Promise<Object>} - The saved game session
   */
  async saveGameProgress() {
    console.log('saveGameProgress called');
    try {
      if (!this.currentGameSession) {
        throw new Error('No active game session');
      }
      
      const db = this.firebase.firestore();
      const gameSessionRef = db.collection('gameSessions').doc(this.currentGameSession.sessionId);
      
      await gameSessionRef.update({
        conversationHistory: this.conversationHistory,
        lastSavedAt: this.firebase.firestore.FieldValue.serverTimestamp()
      });
      
      return this.currentGameSession;
    } catch (error) {
      console.error('Error saving game progress:', error);
      throw error;
    }
  }

  /**
   * Load game progress
   * @param {string} gameSessionId - The game session ID to load
   * @returns {Promise<Object>} - The loaded game session
   */
  async loadGameProgress(gameSessionId) {
    console.log('loadGameProgress called with ID:', gameSessionId);
    try {
      const db = this.firebase.firestore();
      const gameSessionRef = db.collection('gameSessions').doc(gameSessionId);
      const gameSessionSnap = await gameSessionRef.get();
      
      if (!gameSessionSnap.exists) {
        throw new Error('Game session not found');
      }
      
      const gameSession = gameSessionSnap.data();
      this.currentGameSession = gameSession;
      this.conversationHistory = gameSession.conversationHistory || [];
      
      // Get user and topic data
      const userRef = db.collection('users').doc(gameSession.userId);
      const userSnap = await userRef.get();
      this.userProfile = userSnap.data();
      
      const topicRef = db.collection('topics').doc(gameSession.topicId);
      const topicSnap = await topicRef.get();
      this.currentTopic = topicSnap.data();
      
      this.difficultyLevel = gameSession.difficulty;
      
      return gameSession;
    } catch (error) {
      console.error('Error loading game progress:', error);
      throw error;
    }
  }

  /**
   * Change difficulty level
   * @param {string} newDifficulty - The new difficulty level
   * @returns {Promise<Object>} - The updated game session
   */
  async changeDifficulty(newDifficulty) {
    console.log('changeDifficulty called with:', newDifficulty);
    try {
      if (!this.currentGameSession) {
        throw new Error('No active game session');
      }
      
      this.difficultyLevel = newDifficulty;
      
      // Add system message about difficulty change
      const systemMessage = {
        role: 'system',
        content: `Difficulty changed to ${newDifficulty.toUpperCase()}. Adjust your responses accordingly.`
      };
      
      this.conversationHistory.push(systemMessage);
      
      // Update game session in Firestore
      const db = this.firebase.firestore();
      const gameSessionRef = db.collection('gameSessions').doc(this.currentGameSession.sessionId);
      
      await gameSessionRef.update({
        difficulty: newDifficulty,
        conversationHistory: this.conversationHistory
      });
      
      this.currentGameSession.difficulty = newDifficulty;
      
      return this.currentGameSession;
    } catch (error) {
      console.error('Error changing difficulty:', error);
      throw error;
    }
  }

  /**
   * Change topic
   * @param {string} newTopicId - The new topic ID
   * @returns {Promise<Object>} - The new game session
   */
  async changeTopic(newTopicId) {
    console.log('changeTopic called with ID:', newTopicId);
    return await this.initializeGame(
      this.currentGameSession?.userId || this.firebase.auth().currentUser.uid,
      newTopicId,
      this.difficultyLevel
    );
  }
}

export default VertexAIGameEngine;
