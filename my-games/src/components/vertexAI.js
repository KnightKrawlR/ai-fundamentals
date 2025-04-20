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
      
      // Create a new game session
      const gameSession = {
        userId,
        topicId,
        difficulty,
        startTime: new Date(),
        lastInteractionTime: new Date(),
        conversationHistory: [],
        skillsGained: [],
        progress: 0,
        creditsUsed: 0
      };
      
      // Save to Firestore
      const gameSessionRef = await db.collection('gameSessions').add(gameSession);
      console.log('Game session created with ID:', gameSessionRef.id);
      
      // Generate initial AI message
      const initialPrompt = this.generateInitialPrompt();
      // Just use a sample response for now
      const aiResponse = "Welcome to AI Fundamentals Games! I'm your gaming assistant. What specific aspect of " + 
        this.currentTopic.name + " would you like to learn about today?";
      
      // Update conversation history
      this.conversationHistory = [{
        role: 'assistant',
        content: aiResponse
      }];
      
      // Update game session with AI response
      gameSession.conversationHistory = this.conversationHistory;
      gameSession.id = gameSessionRef.id;
      
      await gameSessionRef.update({
        conversationHistory: this.conversationHistory
      });
      
      this.currentGameSession = gameSession;
      return gameSession;
      
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
      
      // Just use a sample response for now
      const aiResponse = "Thank you for your question about " + this.currentTopic.name + 
        ". This is a simulated response since we're not connecting to Vertex AI yet. In a real implementation, this would provide more detailed information related to your query.";
      
      // Update conversation history with AI response
      this.conversationHistory.push({
        role: 'assistant',
        content: aiResponse
      });
      
      // Update game session in Firestore
      const gameSessionRef = firebase.firestore().collection('gameSessions').doc(this.currentGameSession.id);
      
      await gameSessionRef.update({
        conversationHistory: this.conversationHistory,
        lastInteractionTime: new Date(),
        creditsUsed: this.currentGameSession.creditsUsed + creditCost
      });
      
      // Update user's credit balance
      const userRef = firebase.firestore().collection('users').doc(this.currentGameSession.userId);
      
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
      
    } catch (error) {
      console.error('Error sending user input:', error);
      throw error;
    }
  }

  /**
   * Generate a prompt from the conversation history
   * @returns {string} - The prompt for Vertex AI
   */
  generatePromptFromHistory() {
    return "This is a simplified prompt from history";
  }

  /**
   * Generate AI response using Firebase Function that calls Vertex AI
   * @param {string} prompt - The prompt for Vertex AI
   * @returns {Promise<string>} - The AI response
   */
  async generateAIResponse(prompt) {
    console.log('generateAIResponse called with prompt length:', prompt.length);
    return "This is a sample AI response since we're not connecting to Vertex AI yet.";
  }

  /**
   * Process image input
   * @param {string} userText - The user's text accompanying the image
   * @param {Object} imageData - The image data
   * @returns {Promise<string>} - The processed input
   */
  async processImageInput(userText, imageData) {
    return userText + " [Image description would be here]";
  }

  /**
   * Process audio input
   * @param {string} userText - The user's text accompanying the audio
   * @param {Object} audioData - The audio data
   * @returns {Promise<string>} - The processed input
   */
  async processAudioInput(userText, audioData) {
    return userText + " [Audio transcription would be here]";
  }

  /**
   * Calculate credit cost based on input type
   * @param {string} inputType - The type of input (text, image, audio)
   * @returns {number} - The credit cost
   */
  calculateCreditCost(inputType) {
    return 1; // Simplified to always return 1 credit
  }

  /**
   * Save game progress
   * @returns {Promise<Object>} - The saved game session
   */
  async saveGameProgress() {
    console.log('saveGameProgress called');
    return this.currentGameSession;
  }

  /**
   * Load game progress
   * @param {string} gameSessionId - The game session ID to load
   * @returns {Promise<Object>} - The loaded game session
   */
  async loadGameProgress(gameSessionId) {
    console.log('loadGameProgress called with ID:', gameSessionId);
    return this.currentGameSession;
  }

  /**
   * Change difficulty level
   * @param {string} newDifficulty - The new difficulty level
   * @returns {Promise<Object>} - The updated game session
   */
  async changeDifficulty(newDifficulty) {
    console.log('changeDifficulty called with:', newDifficulty);
    this.difficultyLevel = newDifficulty;
    return this.currentGameSession;
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
