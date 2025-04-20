/**
 * AI Fundamentals - Vertex AI Integration
 * This file provides client-side functionality to interact with Firebase Functions
 * that use Vertex AI for generating AI responses.
 */

/**
 * VertexAI Client
 * This class handles the client-side interaction with Google's Vertex AI via Firebase Functions.
 * It provides methods for text generation, chat conversations, and game-specific AI interactions.
 */

import { VERTEX_MODELS, DEFAULT_MODEL_OPTIONS, getDefaultModelParams } from './vertex-models.js';

class VertexAI {
  constructor() {
    this._defaultModel = 'gemini-pro';
    this._sessionHistory = [];
    this._firebaseInitialized = false;
    this._currentSessionId = null;
    
    // Check if Firebase is initialized
    if (typeof firebase !== 'undefined' && firebase.app()) {
      this._firebaseInitialized = true;
      this._functions = firebase.functions();
    }
  }
  
  /**
   * Initializes Firebase if not already done
   * @private
   * @returns {boolean} - Whether Firebase is successfully initialized
   */
  _initFirebase() {
    if (this._firebaseInitialized) return true;
    
    try {
      if (typeof firebase !== 'undefined' && firebase.app()) {
        this._firebaseInitialized = true;
        this._functions = firebase.functions();
        return true;
      }
    } catch (error) {
      console.error('Firebase initialization error:', error);
    }
    
    return false;
  }
  
  /**
   * Generates text using Vertex AI
   * @param {string} prompt - The text prompt to generate from
   * @param {Object} options - Generation options like temperature, etc.
   * @param {string} model - The model to use (defaults to gemini-pro)
   * @param {boolean} allowAnonymous - Whether to allow anonymous access
   * @returns {Promise<Object>} - The generated text and metadata
   */
  async generateText(prompt, options = {}, model = null, allowAnonymous = false) {
    if (!this._initFirebase()) {
      return {
        error: 'Firebase not initialized',
        success: false
      };
    }
    
    try {
      const generateVertexAIResponse = this._functions.httpsCallable('generateVertexAIResponse');
      
      const response = await generateVertexAIResponse({
        prompt,
        model: model || this._defaultModel,
        options,
        allowAnonymous
      });
      
      return response.data;
    } catch (error) {
      console.error('Error generating text:', error);
      return {
        error: error.message || 'Error generating text',
        success: false
      };
    }
  }
  
  /**
   * Processes a chat conversation
   * @param {Array} messages - Array of message objects {role: 'user'|'assistant', content: string}
   * @param {Object} options - Generation options
   * @param {string} model - The model to use
   * @param {boolean} allowAnonymous - Whether to allow anonymous access
   * @returns {Promise<Object>} - The generated response and metadata
   */
  async processChat(messages, options = {}, model = null, allowAnonymous = false) {
    if (!this._initFirebase()) {
      return {
        error: 'Firebase not initialized',
        success: false
      };
    }
    
    try {
      const processChatConversation = this._functions.httpsCallable('processChatConversation');
      
      // Update session history with new messages if they're not already there
      const lastExistingMessage = this._sessionHistory[this._sessionHistory.length - 1];
      const lastInputMessage = messages[messages.length - 1];
      
      if (!lastExistingMessage || 
          lastExistingMessage.role !== lastInputMessage.role || 
          lastExistingMessage.content !== lastInputMessage.content) {
        this._sessionHistory = [...this._sessionHistory, ...messages.slice(-1)];
      }
      
      const response = await processChatConversation({
        messages: this._sessionHistory.length > 0 ? this._sessionHistory : messages,
        model: model || this._defaultModel,
        options,
        allowAnonymous
      });
      
      // Add the assistant's response to the session history
      if (response.data && response.data.text) {
        this._sessionHistory.push({
          role: 'assistant',
          content: response.data.text
        });
      }
      
      return response.data;
    } catch (error) {
      console.error('Error processing chat:', error);
      return {
        error: error.message || 'Error processing chat',
        success: false
      };
    }
  }
  
  /**
   * Initializes a game session
   * @param {Object} gameConfig - Configuration for the game (type, character name, etc.)
   * @param {Object} options - Generation options
   * @param {string} model - The model to use
   * @param {boolean} allowAnonymous - Whether to allow anonymous access
   * @returns {Promise<Object>} - Session ID and initial game state
   */
  async initializeGameSession(gameConfig, options = {}, model = null, allowAnonymous = false) {
    if (!this._initFirebase()) {
      return {
        error: 'Firebase not initialized',
        success: false
      };
    }
    
    try {
      const initializeGameSession = this._functions.httpsCallable('initializeGameSession');
      
      const response = await initializeGameSession({
        gameConfig,
        model: model || this._defaultModel,
        options,
        allowAnonymous
      });
      
      // Store the session ID and history
      if (response.data && response.data.sessionId) {
        this._currentSessionId = response.data.sessionId;
        this._sessionHistory = response.data.messages || [];
      }
      
      return response.data;
    } catch (error) {
      console.error('Error initializing game session:', error);
      return {
        error: error.message || 'Error initializing game session',
        success: false
      };
    }
  }
  
  /**
   * Sends a message in a game session
   * @param {string} message - The message to send
   * @param {string} sessionId - The session ID (optional, uses current session if not provided)
   * @param {Object} options - Generation options
   * @param {string} model - The model to use
   * @param {boolean} allowAnonymous - Whether to allow anonymous access
   * @returns {Promise<Object>} - The AI response and updated game state
   */
  async sendGameMessage(message, sessionId = null, options = {}, model = null, allowAnonymous = false) {
    if (!this._initFirebase()) {
      return {
        error: 'Firebase not initialized',
        success: false
      };
    }
    
    const useSessionId = sessionId || this._currentSessionId;
    
    if (!useSessionId) {
      return {
        error: 'No active game session. Call initializeGameSession first.',
        success: false
      };
    }
    
    try {
      const sendGameMessage = this._functions.httpsCallable('sendGameMessage');
      
      // Add user message to history
      this._sessionHistory.push({
        role: 'user',
        content: message
      });
      
      const response = await sendGameMessage({
        sessionId: useSessionId,
        message,
        model: model || this._defaultModel,
        options,
        allowAnonymous
      });
      
      // Add the assistant's response to the session history
      if (response.data && response.data.aiResponse) {
        this._sessionHistory.push({
          role: 'assistant',
          content: response.data.aiResponse
        });
      }
      
      return response.data;
    } catch (error) {
      console.error('Error sending game message:', error);
      return {
        error: error.message || 'Error sending game message',
        success: false
      };
    }
  }
  
  /**
   * Gets the current session history
   * @returns {Array} - The session history
   */
  getSessionHistory() {
    return [...this._sessionHistory];
  }
  
  /**
   * Clears the current session history
   */
  clearSessionHistory() {
    this._sessionHistory = [];
    this._currentSessionId = null;
  }
  
  /**
   * Gets available models
   * @returns {Promise<Object>} - List of available models
   */
  async getAvailableModels() {
    if (!this._initFirebase()) {
      return {
        error: 'Firebase not initialized',
        success: false
      };
    }
    
    try {
      const getAvailableModels = this._functions.httpsCallable('getAvailableModels');
      const response = await getAvailableModels();
      return response.data;
    } catch (error) {
      console.error('Error getting available models:', error);
      return {
        error: error.message || 'Error getting available models',
        success: false
      };
    }
  }
  
  /**
   * Sets the default model to use
   * @param {string} model - The model name
   */
  setDefaultModel(model) {
    this._defaultModel = model;
  }
  
  /**
   * Gets the default model
   * @returns {string} - The default model name
   */
  getDefaultModel() {
    return this._defaultModel;
  }
}

// Create a singleton instance
const vertexAIClient = new VertexAI();

// Export the singleton
export default vertexAIClient; 