// grokAI.js - Enhanced integration with Grok AI via Firebase Functions
import firebase from '../firebase';

class GrokAI {
  constructor() {
    this._defaultModel = 'grok-2-instruct';
    this._firebaseInitialized = false;
    
    // Check if Firebase is initialized
    if (typeof firebase !== 'undefined' && firebase.app()) {
      this._firebaseInitialized = true;
      this._functions = firebase.functions();
    }
  }
  
  /**
   * Generates a game plan using Grok AI
   * @param {string} projectDescription - Description of the project
   * @param {string} topic - Selected topic from learning paths
   * @param {string} challenge - Selected challenge within the topic
   * @param {string} projectType - Selected project type
   * @returns {Promise<Object>} - The generated game plan
   */
  async generateGamePlan(projectDescription, topic = '', challenge = '', projectType = '') {
    if (!this._firebaseInitialized) {
      return {
        error: 'Firebase not initialized',
        success: false
      };
    }
    
    try {
      // Call Firebase Function to generate game plan
      const generateGamePlan = this._functions.httpsCallable('generateGamePlan');
      
      const response = await generateGamePlan({
          projectDescription, 
        topic,
        challenge,
        projectType,
        model: this._defaultModel
      });
      
      return response.data;
    } catch (error) {
      console.error('Error generating game plan:', error);
      return {
        error: error.message || 'Error generating game plan',
        success: false
      };
    }
  }
  
  /**
   * Processes a chat conversation
   * @param {Array} messages - Array of message objects {role: 'user'|'assistant', content: string}
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} - The generated response and metadata
   */
  async processChat(messages, options = {}) {
    if (!this._firebaseInitialized) {
      return {
        error: 'Firebase not initialized',
        success: false
      };
    }
    
    try {
      const processChatConversation = this._functions.httpsCallable('processChatConversation');
      
      const response = await processChatConversation({
        messages,
        model: this._defaultModel,
        options
      });
      
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
   * Generates text using Grok AI
   * @param {string} prompt - The text prompt to generate from
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} - The generated text and metadata
   */
  async generateText(prompt, options = {}) {
    if (!this._firebaseInitialized) {
      return {
        error: 'Firebase not initialized',
        success: false
      };
    }
    
    try {
      const generateText = this._functions.httpsCallable('generateText');
      
      const response = await generateText({
        prompt,
        model: this._defaultModel,
        options
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
}

export default GrokAI;
