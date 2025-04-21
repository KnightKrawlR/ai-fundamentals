/**
 * vertexAIHelper.js - Utility functions for Vertex AI integration
 */

const { VertexAI } = require('@google-cloud/vertexai');
const functions = require('firebase-functions');

// Initialize Vertex AI with Firebase config values
const projectId = functions.config().vertexai?.project || process.env.GCLOUD_PROJECT || 'ai-fundamentals-ad37d';
const location = functions.config().vertexai?.location || 'us-central1';
const modelName = functions.config().vertexai?.model || 'gemini-pro';

// Log configuration on initialization
console.log(`Initializing Vertex AI Helper with: Project=${projectId}, Location=${location}, Model=${modelName}`);

// Initialize Vertex AI with error handling
let vertexAI;
try {
  vertexAI = new VertexAI({ project: projectId, location });
  console.log('Vertex AI Helper initialized successfully');
} catch (error) {
  console.error('Error initializing Vertex AI Helper:', error);
  // Don't throw here - we'll handle errors in the individual functions
}

// Define the models to use - now using config values
const MODEL_NAME = modelName;
const IMAGE_MODEL_NAME = 'gemini-pro-vision';

/**
 * Get a generative model for text processing
 * @returns {GenerativeModel} A generative model instance
 */
function getGenerativeModel() {
  if (!vertexAI) {
    throw new Error('Vertex AI client not initialized');
  }
  return vertexAI.getGenerativeModel({ model: MODEL_NAME });
}

/**
 * Get a generative model for image processing (multimodal)
 * @returns {GenerativeModel} A multimodal generative model instance
 */
function getMultimodalModel() {
  return vertexAI.getGenerativeModel({ model: IMAGE_MODEL_NAME });
}

/**
 * Generate a text response based on the provided prompt
 * @param {string} prompt - The user's prompt
 * @returns {Promise<string>} The AI-generated response
 */
async function generateTextResponse(prompt) {
  try {
    const model = getGenerativeModel();
    
    const safetySettings = [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ];
    
    const generationConfig = {
      temperature: 0.7,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 1024,
    };
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      safetySettings,
      generationConfig,
    });

    return result.response.candidates[0].content.parts[0].text;
  } catch (error) {
    functions.logger.error('Error generating text response:', error);
    throw error;
  }
}

/**
 * Process an image with Vertex AI
 * @param {string} imageBase64 - The base64-encoded image
 * @param {string} prompt - The text prompt to accompany the image
 * @returns {Promise<string>} The AI-generated description or analysis
 */
async function processImage(imageBase64, prompt) {
  try {
    const model = getMultimodalModel();
    
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt || 'Describe this image in detail.' },
            { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } }
          ]
        }
      ],
    });

    return result.response.candidates[0].content.parts[0].text;
  } catch (error) {
    functions.logger.error('Error processing image:', error);
    throw error;
  }
}

/**
 * Generate a response for a conversation history
 * @param {Array} conversationHistory - The array of conversation messages
 * @returns {Promise<string>} The AI-generated response
 */
async function generateConversationResponse(conversationHistory) {
  try {
    const model = getGenerativeModel();
    
    // Map the conversation history to Vertex AI format
    const contents = conversationHistory.map(message => ({
      role: message.role, // 'user' or 'model'
      parts: [{ text: message.content }]
    }));
    
    const generationConfig = {
      temperature: 0.7,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 1024,
    };
    
    const result = await model.generateContent({
      contents,
      generationConfig,
    });

    return result.response.candidates[0].content.parts[0].text;
  } catch (error) {
    functions.logger.error('Error generating conversation response:', error);
    throw error;
  }
}

module.exports = {
  getGenerativeModel,
  getMultimodalModel,
  generateTextResponse,
  processImage,
  generateConversationResponse
}; 