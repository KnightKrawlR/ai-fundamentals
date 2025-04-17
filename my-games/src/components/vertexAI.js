// vertexAI.js - Firebase Vertex AI Integration for My Games Feature

// Import Firebase and Vertex AI dependencies
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

// Firebase configuration - replace with your actual config
const firebaseConfig = {
  apiKey: "AIzaSyDjMisQkMgdA6qNg7gnXDumhNOOWOD-Y00",
  authDomain: "ai-fundamentals-ad37d.firebaseapp.com",
  projectId: "ai-fundamentals-ad37d",
  storageBucket: "ai-fundamentals-ad37d.appspot.com",
  messagingSenderId: "668115447112",
  appId: "1:668115447112:web:c0772e9f8c6a498737977d",
  measurementId: "G-2D5V39EQ3T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);

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
    try {
      // Check if user exists and has credits
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        throw new Error('User not found');
      }
      
      this.userProfile = userSnap.data();
      
      // Check if user has enough credits
      if (this.userProfile.credits < 1) {
        throw new Error('Insufficient credits');
      }
      
      // Get topic data
      const topicRef = doc(db, 'topics', topicId);
      const topicSnap = await getDoc(topicRef);
      
      if (!topicSnap.exists()) {
        throw new Error('Topic not found');
      }
      
      this.currentTopic = topicSnap.data();
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
      const gameSessionRef = await addDoc(collection(db, 'gameSessions'), gameSession);
      
      // Generate initial AI message
      const initialPrompt = this.generateInitialPrompt();
      const aiResponse = await this.generateAIResponse(initialPrompt);
      
      // Update conversation history
      this.conversationHistory = [{
        role: 'assistant',
        content: aiResponse
      }];
      
      // Update game session with AI response
      gameSession.conversationHistory = this.conversationHistory;
      gameSession.id = gameSessionRef.id;
      
      await updateDoc(gameSessionRef, {
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
      
      if (inputType === 'image') {
        processedInput = await this.processImageInput(userInput, additionalData);
      } else if (inputType === 'audio') {
        processedInput = await this.processAudioInput(userInput, additionalData);
      }
      
      // Update conversation history
      this.conversationHistory.push({
        role: 'user',
        content: processedInput
      });
      
      // Generate AI response
      const prompt = this.generatePromptFromHistory();
      const aiResponse = await this.generateAIResponse(prompt);
      
      // Update conversation history with AI response
      this.conversationHistory.push({
        role: 'assistant',
        content: aiResponse
      });
      
      // Update game session in Firestore
      const gameSessionRef = doc(db, 'gameSessions', this.currentGameSession.id);
      
      await updateDoc(gameSessionRef, {
        conversationHistory: this.conversationHistory,
        lastInteractionTime: new Date(),
        creditsUsed: this.currentGameSession.creditsUsed + creditCost
      });
      
      // Update user's credit balance
      const userRef = doc(db, 'users', this.currentGameSession.userId);
      
      await updateDoc(userRef, {
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
    const difficultyDescriptions = {
      easy: 'Use simple language and avoid technical jargon. Explain concepts thoroughly with everyday examples. Provide step-by-step guidance and frequent encouragement.',
      intermediate: 'Use industry-standard terminology with explanations when needed. Provide practical examples and use cases. Balance guidance with challenges that encourage problem-solving.',
      hard: 'Use technical language and industry-specific terminology. Present complex scenarios that require synthesis of multiple concepts. Provide minimal guidance, encouraging critical thinking and creative solutions.'
    };
    
    let prompt = `You are an AI gaming assistant for AI Fundamentals, helping users learn AI skills related to ${this.currentTopic.name}.
Difficulty: ${this.difficultyLevel.toUpperCase()}

${difficultyDescriptions[this.difficultyLevel]}
Focus on how these skills can be applied to earn money or improve career prospects.

Current conversation:
`;
    
    // Add conversation history
    this.conversationHistory.forEach(message => {
      prompt += `${message.role === 'user' ? 'User' : 'Assistant'}: ${message.content}\n\n`;
    });
    
    prompt += 'Assistant:';
    
    return prompt;
  }

  /**
   * Generate AI response using Firebase Function that calls Vertex AI
   * @param {string} prompt - The prompt for Vertex AI
   * @returns {Promise<string>} - The AI response
   */
  async generateAIResponse(prompt) {
    try {
      // Call Firebase Function that interfaces with Vertex AI
      const generateResponse = httpsCallable(functions, 'generateVertexAIResponse');
      
      const result = await generateResponse({
        prompt,
        model: 'gemini-pro',
        maxTokens: 1024,
        temperature: 0.7
      });
      
      return result.data.response;
      
    } catch (error) {
      console.error('Error generating AI response:', error);
      return 'I apologize, but I encountered an error. Please try again.';
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
      const processImage = httpsCallable(functions, 'processImageForVertexAI');
      
      const result = await processImage({
        imageData,
        userText
      });
      
      return result.data.processedInput;
      
    } catch (error) {
      console.error('Error processing image input:', error);
      throw error;
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
      const processAudio = httpsCallable(functions, 'processAudioForVertexAI');
      
      const result = await processAudio({
        audioData,
        userText
      });
      
      return result.data.processedInput;
      
    } catch (error) {
      console.error('Error processing audio input:', error);
      throw error;
    }
  }

  /**
   * Calculate credit cost based on input type
   * @param {string} inputType - The type of input (text, image, audio)
   * @returns {number} - The credit cost
   */
  calculateCreditCost(inputType) {
    const baseCost = 1;
    
    switch (inputType) {
      case 'image':
        return baseCost * 2;
      case 'audio':
        return baseCost * 1.5;
      case 'text':
      default:
        return baseCost;
    }
  }

  /**
   * Save game progress
   * @returns {Promise<Object>} - The saved game session
   */
  async saveGameProgress() {
    try {
      if (!this.currentGameSession) {
        throw new Error('No active game session');
      }
      
      const gameSessionRef = doc(db, 'gameSessions', this.currentGameSession.id);
      
      await updateDoc(gameSessionRef, {
        lastSaved: new Date()
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
    try {
      const gameSessionRef = doc(db, 'gameSessions', gameSessionId);
      const gameSessionSnap = await getDoc(gameSessionRef);
      
      if (!gameSessionSnap.exists()) {
        throw new Error('Game session not found');
      }
      
      const gameSession = {
        id: gameSessionId,
        ...gameSessionSnap.data()
      };
      
      // Load user profile
      const userRef = doc(db, 'users', gameSession.userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        throw new Error('User not found');
      }
      
      this.userProfile = userSnap.data();
      
      // Load topic
      const topicRef = doc(db, 'topics', gameSession.topicId);
      const topicSnap = await getDoc(topicRef);
      
      if (!topicSnap.exists()) {
        throw new Error('Topic not found');
      }
      
      this.currentTopic = topicSnap.data();
      this.difficultyLevel = gameSession.difficulty;
      this.conversationHistory = gameSession.conversationHistory;
      this.currentGameSession = gameSession;
      
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
    try {
      if (!this.currentGameSession) {
        throw new Error('No active game session');
      }
      
      // Check if user is premium for hard difficulty
      if (newDifficulty === 'hard' && this.userProfile.subscriptionTier === 'free') {
        throw new Error('Hard difficulty is only available for premium users');
      }
      
      this.difficultyLevel = newDifficulty;
      
      // Update game session in Firestore
      const gameSessionRef = doc(db, 'gameSessions', this.currentGameSession.id);
      
      await updateDoc(gameSessionRef, {
        difficulty: newDifficulty
      });
      
      this.currentGameSession.difficulty = newDifficulty;
      
      // Add system message about difficulty change
      this.conversationHistory.push({
        role: 'system',
        content: `Difficulty changed to ${newDifficulty}. The assistant will adjust its responses accordingly.`
      });
      
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
    try {
      // Get user ID from current session
      const userId = this.currentGameSession ? this.currentGameSession.userId : auth.currentUser.uid;
      
      // Initialize a new game with the new topic
      return await this.initializeGame(userId, newTopicId, this.difficultyLevel);
      
    } catch (error) {
      console.error('Error changing topic:', error);
      throw error;
    }
  }
}

export default VertexAIGameEngine;
