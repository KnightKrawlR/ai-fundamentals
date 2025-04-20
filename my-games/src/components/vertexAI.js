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
   * Initialize a new game session
   * @param {string} userId - The current user's ID
   * @param {string} topicId - The selected topic ID
   * @param {string} difficulty - The selected difficulty level
   * @returns {Promise<Object>} - The initialized game session
   */
  async initializeGame(userId, topicId, difficulty = 'easy') {
    console.log('initializeGame called with', { userId, topicId, difficulty });
    try {
      const db = firebase.firestore();
      
      // Check if user exists and has credits
      let userRef = db.collection('users').doc(userId);
      let userSnap = await userRef.get();
      
      // Create user document if it doesn't exist
      if (!userSnap.exists) {
        console.log('User document does not exist, creating it');
        await userRef.set({
          credits: 100,
          subscriptionTier: 'free',
          totalCreditsUsed: 0,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        userSnap = await userRef.get();
      }
      
      this.userProfile = userSnap.data();
      console.log('User profile loaded:', this.userProfile);
      
      // Check if user has enough credits
      if (this.userProfile.credits < 1) {
        throw new Error('Insufficient credits');
      }
      
      // Get topic data
      let topicRef = db.collection('topics').doc(topicId);
      let topicSnap = await topicRef.get();
      
      // Create topic document if it doesn't exist
      if (!topicSnap.exists) {
        console.log('Topic document does not exist, creating it');
        const sampleTopic = this.sampleTopics.find(t => t.id === topicId) || this.sampleTopics[0];
        await topicRef.set({
          ...sampleTopic,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        topicSnap = await topicRef.get();
      }
      
      this.currentTopic = topicSnap.data();
      console.log('Topic loaded:', this.currentTopic);
      this.difficultyLevel = difficulty;
      
      try {
        // Configure Firebase Functions region if needed
        const functions = firebase.functions();
        
        // Try to verify connectivity with a health check first
        try {
          const healthCheckUrl = 'https://us-central1-ai-fundamentals-ad37d.cloudfunctions.net/healthCheck';
          const healthResponse = await fetch(healthCheckUrl, {
            method: 'GET',
            mode: 'cors',
            credentials: 'omit',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (!healthResponse.ok) {
            console.warn('Health check failed, but continuing with function call');
          } else {
            console.log('Health check successful');
          }
        } catch (healthError) {
          console.warn('Health check error, but continuing with function call', healthError);
        }
        
        // Use Firebase Function with retry logic
        console.log('Calling initializeGameSession function');
        
        // Set functions region if needed
        try {
          // Try direct function call
          const initializeGameSession = functions.httpsCallable('initializeGameSession');
          
          const gameConfig = {
            gameType: 'educational',
            characterName: 'Student',
            topic: this.currentTopic.name,
            difficulty: this.difficultyLevel
          };
          
          // Use Promise.race to implement a timeout
          const response = await Promise.race([
            initializeGameSession({
              gameConfig,
              model: 'gemini-pro',
              options: {
                temperature: 0.7,
                maxTokens: 1024
              },
              allowAnonymous: true // Allow anonymous access as fallback
            }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Function call timed out after 30 seconds')), 30000)
            )
          ]);
          
          console.log('Game session initialized:', response.data);
          
          // Create a new game session object
          const gameSession = {
            userId,
            topicId,
            difficulty,
            sessionId: response.data.sessionId,
            startTime: new Date(),
            lastInteractionTime: new Date(),
            conversationHistory: response.data.messages || [{
              role: 'assistant',
              content: response.data.introText
            }],
            skillsGained: [],
            progress: 0,
            creditsUsed: 1
          };
          
          // Update user credits
          await userRef.update({
            credits: this.userProfile.credits - 1,
            totalCreditsUsed: (this.userProfile.totalCreditsUsed || 0) + 1
          });
          
          this.userProfile.credits -= 1;
          this.conversationHistory = gameSession.conversationHistory;
          this.currentGameSession = gameSession;
          
          return gameSession;
        } catch (functionError) {
          console.error('Primary function call failed:', functionError);
          throw functionError; // Let the outer catch handle it
        }
      } catch (functionError) {
        console.error('Firebase function error:', functionError);
        
        // If there's a CORS issue, try to handle it with a fallback solution
        if (functionError.message && (
            functionError.message.includes('CORS') || 
            functionError.message.includes('NetworkError') ||
            functionError.message.includes('Failed to fetch') ||
            functionError.message.includes('internal')
        )) {
          console.warn('CORS or network issue detected, using fallback approach');
          
          // Fallback to a simple initial game session
          const fallbackSessionId = `fallback-${Date.now()}`;
          const fallbackIntroText = `Welcome to AI Fundamentals Games! I'm your gaming assistant for learning about ${this.currentTopic.name}.
          
Due to high demand, I'm operating in fallback mode, but I can still help you learn about this topic! What would you like to know about ${this.currentTopic.name}?`;
          
          // Create a fallback session
          const fallbackSession = {
            userId,
            topicId,
            difficulty,
            sessionId: fallbackSessionId,
            startTime: new Date(),
            lastInteractionTime: new Date(),
            conversationHistory: [{
              role: 'assistant',
              content: fallbackIntroText
            }],
            skillsGained: [],
            progress: 0,
            creditsUsed: 1,
            isFallback: true
          };
          
          // Update user credits
          await userRef.update({
            credits: this.userProfile.credits - 1,
            totalCreditsUsed: (this.userProfile.totalCreditsUsed || 0) + 1
          });
          
          this.userProfile.credits -= 1;
          this.conversationHistory = fallbackSession.conversationHistory;
          this.currentGameSession = fallbackSession;
          
          return fallbackSession;
        }
        
        // Re-throw other errors
        throw functionError;
      }
    } catch (error) {
      console.error('Error initializing game:', error);
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
        throw new Error('Insufficient credits');
      }
      
      // Process different input types
      let processedInput = userInput;
      
      // Update conversation history
      this.conversationHistory.push({
        role: 'user',
        content: processedInput
      });
      
      // Check if we're in fallback mode
      if (this.currentGameSession.isFallback) {
        console.log('Using fallback mode for message processing');
        
        // Generate a simple response based on the conversation
        const topicName = this.currentTopic.name.toLowerCase();
        
        let aiResponse = '';
        
        // Try to provide a contextual response based on common topics
        if (userInput.toLowerCase().includes('how') && userInput.toLowerCase().includes('money')) {
          aiResponse = `There are several ways to use ${topicName} to earn money:
          
1. Freelancing: Offer ${topicName} services on platforms like Upwork or Fiverr
2. Create and sell digital products related to ${topicName}
3. Start a YouTube channel or blog about ${topicName} topics
4. Teach others through online courses about ${topicName}

What specific aspect interests you most?`;
        } 
        else if (userInput.toLowerCase().includes('learn') || userInput.toLowerCase().includes('start')) {
          aiResponse = `To get started with ${topicName}, I recommend:
          
1. Take an online course on platforms like Coursera or Udemy
2. Join communities and forums related to ${topicName}
3. Practice with small projects to build your skills
4. Read books and articles from experts in ${topicName}

Would you like me to elaborate on any of these approaches?`;
        }
        else if (userInput.toLowerCase().includes('best') || userInput.toLowerCase().includes('tool')) {
          aiResponse = `Some popular tools for ${topicName} include:
          
1. Industry-standard software like Adobe Suite for design or TensorFlow for AI
2. Free alternatives that are beginner-friendly
3. Cloud-based services that don't require installation
4. Mobile apps that let you practice on the go

Which type of tools are you most interested in?`;
        }
        else {
          aiResponse = `Thank you for your question about ${topicName}. 
          
I'm currently in fallback mode, but I'd be happy to share some general insights about ${topicName}. This topic has been growing rapidly, with many opportunities for learning and application.

Is there a specific aspect of ${topicName} you'd like to explore further?`;
        }
        
        // Update conversation history with AI response
        this.conversationHistory.push({
          role: 'assistant',
          content: aiResponse
        });
        
        // Update game session in Firestore
        const db = firebase.firestore();
        const gameSessionRef = db.collection('gameSessions').doc(this.currentGameSession.sessionId);
        
        try {
          await gameSessionRef.set({
            userId: this.currentGameSession.userId,
            topicId: this.currentGameSession.topicId,
            difficulty: this.currentGameSession.difficulty,
            conversationHistory: this.conversationHistory,
            lastInteractionTime: firebase.firestore.FieldValue.serverTimestamp(),
            creditsUsed: this.currentGameSession.creditsUsed + creditCost,
            isFallback: true
          });
        } catch (firestoreError) {
          console.warn('Error saving fallback session to Firestore:', firestoreError);
          // Continue anyway since we have the conversation in memory
        }
        
        // Update user's credit balance
        const userRef = db.collection('users').doc(this.currentGameSession.userId);
        
        await userRef.update({
          credits: this.userProfile.credits - creditCost,
          totalCreditsUsed: (this.userProfile.totalCreditsUsed || 0) + creditCost
        });
        
        // Update local state
        this.currentGameSession.creditsUsed += creditCost;
        this.userProfile.credits -= creditCost;
        
        return {
          aiResponse,
          creditsUsed: creditCost,
          remainingCredits: this.userProfile.credits,
          conversationHistory: this.conversationHistory
        };
      }
      
      try {
        // Use Firebase Function to send game message
        const functions = firebase.functions();
        const sendGameMessage = functions.httpsCallable('sendGameMessage');
        
        // Use Promise.race to implement a timeout
        const response = await Promise.race([
          sendGameMessage({
            sessionId: this.currentGameSession.sessionId,
            message: processedInput,
            model: 'gemini-pro',
            options: {
              temperature: 0.7,
              maxTokens: 1024
            },
            allowAnonymous: true // Allow anonymous access as fallback
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Function call timed out after 30 seconds')), 30000)
          )
        ]);
        
        console.log('Game message response:', response.data);
        
        // Update conversation history with AI response
        this.conversationHistory.push({
          role: 'assistant',
          content: response.data.aiResponse
        });
        
        // Update game session in Firestore
        const db = firebase.firestore();
        const gameSessionRef = db.collection('gameSessions').doc(this.currentGameSession.sessionId);
        
        await gameSessionRef.update({
          lastInteractionTime: firebase.firestore.FieldValue.serverTimestamp(),
          creditsUsed: this.currentGameSession.creditsUsed + creditCost
        });
        
        // Update user's credit balance
        const userRef = db.collection('users').doc(this.currentGameSession.userId);
        
        await userRef.update({
          credits: this.userProfile.credits - creditCost,
          totalCreditsUsed: (this.userProfile.totalCreditsUsed || 0) + creditCost
        });
        
        // Update local state
        this.currentGameSession.creditsUsed += creditCost;
        this.userProfile.credits -= creditCost;
        
        return {
          aiResponse: response.data.aiResponse,
          creditsUsed: creditCost,
          remainingCredits: this.userProfile.credits,
          conversationHistory: this.conversationHistory
        };
        
      } catch (functionError) {
        console.error('Firebase function error:', functionError);
        
        // If there's a CORS or network issue, use fallback
        if (functionError.message && (
            functionError.message.includes('CORS') || 
            functionError.message.includes('NetworkError') ||
            functionError.message.includes('Failed to fetch') ||
            functionError.message.includes('timed out') ||
            functionError.message.includes('internal')
        )) {
          console.warn('CORS or network issue detected, using fallback response');
          
          // Switch to fallback mode permanently for this session
          this.currentGameSession.isFallback = true;
          
          // Generate a contextual fallback response
          const topicName = this.currentTopic.name.toLowerCase();
          let fallbackResponse = '';
          
          // Try to provide a contextual response based on common topics
          if (userInput.toLowerCase().includes('how') && userInput.toLowerCase().includes('money')) {
            fallbackResponse = `There are several ways to use ${topicName} to earn money:
            
1. Freelancing: Offer ${topicName} services on platforms like Upwork or Fiverr
2. Create and sell digital products related to ${topicName}
3. Start a YouTube channel or blog about ${topicName} topics
4. Teach others through online courses about ${topicName}

What specific aspect interests you most?`;
          } 
          else if (userInput.toLowerCase().includes('learn') || userInput.toLowerCase().includes('start')) {
            fallbackResponse = `To get started with ${topicName}, I recommend:
            
1. Take an online course on platforms like Coursera or Udemy
2. Join communities and forums related to ${topicName}
3. Practice with small projects to build your skills
4. Read books and articles from experts in ${topicName}

Would you like me to elaborate on any of these approaches?`;
          }
          else if (userInput.toLowerCase().includes('best') || userInput.toLowerCase().includes('tool')) {
            fallbackResponse = `Some popular tools for ${topicName} include:
            
1. Industry-standard software like Adobe Suite for design or TensorFlow for AI
2. Free alternatives that are beginner-friendly
3. Cloud-based services that don't require installation
4. Mobile apps that let you practice on the go

Which type of tools are you most interested in?`;
          }
          else {
            fallbackResponse = `I'm currently experiencing connectivity issues with my AI service.
            
Let me provide some information about ${topicName} while our team works on resolving this. ${topicName} is a fascinating field with many applications in today's digital economy.

Is there something specific about ${topicName} you'd like to know more about?`;
          }
          
          // Update conversation history with fallback response
          this.conversationHistory.push({
            role: 'assistant',
            content: fallbackResponse
          });
          
          // Update user's credit balance
          const db = firebase.firestore();
          const userRef = db.collection('users').doc(this.currentGameSession.userId);
          
          await userRef.update({
            credits: this.userProfile.credits - creditCost,
            totalCreditsUsed: (this.userProfile.totalCreditsUsed || 0) + creditCost
          });
          
          // Update local state
          this.currentGameSession.creditsUsed += creditCost;
          this.userProfile.credits -= creditCost;
          
          return {
            aiResponse: fallbackResponse,
            creditsUsed: creditCost,
            remainingCredits: this.userProfile.credits,
            conversationHistory: this.conversationHistory,
            isFallback: true
          };
        }
        
        // Re-throw other errors
        throw functionError;
      }
      
    } catch (error) {
      console.error('Error sending user input:', error);
      throw error;
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
      const generateResponse = firebase.functions().httpsCallable('generateVertexAIResponse');
      
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
      const processImage = firebase.functions().httpsCallable('processImageForVertexAI');
      
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
      const processAudio = firebase.functions().httpsCallable('processAudioForVertexAI');
      
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
   * Save game progress
   * @returns {Promise<Object>} - The saved game session
   */
  async saveGameProgress() {
    console.log('saveGameProgress called');
    try {
      if (!this.currentGameSession) {
        throw new Error('No active game session');
      }
      
      const db = firebase.firestore();
      const gameSessionRef = db.collection('gameSessions').doc(this.currentGameSession.sessionId);
      
      await gameSessionRef.update({
        conversationHistory: this.conversationHistory,
        lastSavedAt: firebase.firestore.FieldValue.serverTimestamp()
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
      const db = firebase.firestore();
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
      const db = firebase.firestore();
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
      this.currentGameSession?.userId || firebase.auth().currentUser.uid,
      newTopicId,
      this.difficultyLevel
    );
  }
}

export default VertexAIGameEngine;
