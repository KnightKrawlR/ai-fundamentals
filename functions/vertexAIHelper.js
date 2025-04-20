/**
 * vertexAIHelper.js - Utility functions for Vertex AI integration
 */

const { VertexAI } = require('@google-cloud/vertexai');
const functions = require('firebase-functions');

// Initialize Vertex AI with your project and location
const projectId = process.env.GCLOUD_PROJECT;
const location = 'us-central1'; // Change to your preferred location
const vertexAI = new VertexAI({ project: projectId, location });

// Define the models to use
const MODEL_NAME = 'gemini-1.5-pro';
const IMAGE_MODEL_NAME = 'gemini-1.5-pro-vision';

/**
 * Get a generative model for text processing
 * @returns {GenerativeModel} A generative model instance
 */
function getGenerativeModel() {
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