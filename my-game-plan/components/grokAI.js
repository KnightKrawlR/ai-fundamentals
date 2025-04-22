// grokAI.js - Enhanced integration with Grok AI via Vercel's xAI integration
import firebase from '../firebase';

// Base URL for HTTP functions
const FUNCTION_BASE_URL = 'https://us-central1-ai-fundamentals-ad37d.cloudfunctions.net';

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
   * Generates a game plan using Grok AI - first tries the HTTP endpoint, then falls back to callable
   * @param {string} projectDescription - Description of the project
   * @param {string} category - Optional category for the project
   * @param {string} topic - Optional topic within the category
   * @returns {Promise<Object>} - The generated game plan
   */
  async generateGamePlan(projectDescription, category = '', topic = '') {
    if (!this._firebaseInitialized) {
      return {
        error: 'Firebase not initialized',
        success: false
      };
    }
    
    const requestData = {
      projectDescription,
      category,
      topic,
      model: this._defaultModel
    };
    
    try {
      // First try HTTP endpoint
      try {
        console.log('Trying HTTP endpoint for generateGamePlan');
        const response = await fetch(`${FUNCTION_BASE_URL}/generateGamePlanHttp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        if (!data.success) {
          throw new Error(data.error || 'Unknown error in HTTP response');
        }
        
        return data;
      } catch (httpError) {
        // Log HTTP error and try callable function as fallback
        console.warn('HTTP endpoint failed, falling back to callable function:', httpError);
        
        // Call Firebase Function to generate game plan
        const generateGamePlan = this._functions.httpsCallable('generateGamePlan');
        const response = await generateGamePlan(requestData);
        
        return response.data;
      }
    } catch (error) {
      console.error('All methods for generating game plan failed:', error);
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
