// AIModels.js - Helper functions for different AI models
import axios from 'axios';

// Constants for API keys and configs
const GROK_API_KEY = "xai-U4MUdbjklO1fx8fkxiXxHoVvwRbqwtNPpeMXy1WCFhqMtdMzKwfHDFuvuPF1Y5az9jR6QB23FZuHY3ik";
const GROK_API_URL = "https://api.x.ai/v1";
const GROK_MODEL = "grok-2-latest";

// Model options for dropdown
export const AI_MODELS = [
  { id: 'grok', name: 'Grok AI', isDefault: true },
  { id: 'vertex', name: 'Vertex AI', isDefault: false }
];

// Grok AI API implementation
export const grokAI = {
  async generateResponse(prompt, options = {}) {
    try {
      const response = await axios.post(`${GROK_API_URL}/chat/completions`, {
        model: GROK_MODEL,
        messages: [
          {
            role: "system",
            content: "You are Grok, a helpful AI assistant teaching users about AI fundamentals."
          },
          {
            role: "user",
            content: prompt
          },
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 1024
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROK_API_KEY}`
        }
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling Grok API:', error);
      throw new Error(`Failed to generate Grok response: ${error.message}`);
    }
  },

  async initializeGame(topic, difficulty) {
    try {
      const prompt = `You are starting a new learning game about ${topic.name} at ${difficulty} difficulty level. 
Provide an engaging introduction to this topic that encourages the user to learn more. Be creative and educational.`;

      const initialResponse = await this.generateResponse(prompt);
      
      return {
        sessionId: `grok-session-${Date.now()}`,
        initialPrompt: initialResponse,
        conversationHistory: [{
          role: 'assistant',
          content: initialResponse
        }]
      };
    } catch (error) {
      console.error('Error initializing game with Grok:', error);
      throw error;
    }
  },

  async sendMessage(sessionId, message, conversationHistory) {
    try {
      // Build the conversation context from history
      const messages = [
        {
          role: "system",
          content: "You are Grok, a helpful AI assistant teaching users about AI fundamentals."
        }
      ];

      // Add conversation history, limiting to last 10 messages to avoid token limits
      const recentHistory = conversationHistory.slice(-10);
      
      for (const msg of recentHistory) {
        messages.push({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        });
      }

      // Add the new message
      messages.push({
        role: "user",
        content: message
      });

      // Make the API call
      const response = await axios.post(`${GROK_API_URL}/chat/completions`, {
        model: GROK_MODEL,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROK_API_KEY}`
        }
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error sending message to Grok:', error);
      throw error;
    }
  }
};

// Function to get the model based on the selected model ID
export const getModelClient = (modelId) => {
  if (modelId === 'vertex') {
    // Return null for Vertex AI since we're using Firebase Functions
    return null;
  }
  
  // Default to Grok
  return grokAI;
};

export default {
  AI_MODELS,
  getModelClient,
  grokAI
}; 