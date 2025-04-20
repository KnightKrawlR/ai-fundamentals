/**
 * Vertex AI Service Module
 * Provides utility functions for integrating with Google Vertex AI services
 */

// Import required dependencies
const { VertexAI } = require('@google-cloud/vertexai');
const { SpeechClient } = require('@google-cloud/speech');
const dotenv = require('dotenv');
const fs = require('fs');
const os = require('os');
const path = require('path');
const functions = require('firebase-functions');

// Load environment variables
dotenv.config();

// Vertex AI configuration
const PROJECT_ID = process.env.VERTEX_PROJECT_ID || 'your-project-id';
const LOCATION = process.env.VERTEX_LOCATION || 'us-central1';
const GEMINI_PRO_MODEL = process.env.GEMINI_PRO_MODEL || 'gemini-pro';
const GEMINI_PRO_VISION_MODEL = process.env.GEMINI_PRO_VISION_MODEL || 'gemini-pro-vision';
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'textembedding-gecko@latest';

// Safety settings for content generation
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

// Initialize the Vertex AI client
let vertexAI;
try {
  vertexAI = new VertexAI({
    project: PROJECT_ID, 
    location: LOCATION,
  });
  console.log('Vertex AI client initialized successfully');
} catch (error) {
  console.error('Error initializing Vertex AI client:', error);
  throw error;
}

// Text model configuration
const TEXT_MODEL_NAME = "gemini-1.5-pro";
const TEXT_GENERATION_CONFIG = {
  temperature: 0.2,
  topP: 0.8,
  topK: 40,
  maxOutputTokens: 8192,
};

// Image model configuration
const IMAGE_MODEL_NAME = "gemini-1.5-pro-vision";
const IMAGE_GENERATION_CONFIG = {
  temperature: 0.2,
  topP: 0.8,
  topK: 40,
  maxOutputTokens: 8192,
};

/**
 * Generates a text completion with Vertex AI
 * @param {string} prompt - The text prompt
 * @return {Promise<string>} The generated text
 */
async function generateText(prompt) {
  try {
    const model = vertexAI.getGenerativeModel({
      model: TEXT_MODEL_NAME,
      generation_config: TEXT_GENERATION_CONFIG,
    });

    const response = await model.generateText({ text: prompt });
    return response.response.candidates[0]?.content?.parts[0]?.text || '';
  } catch (error) {
    functions.logger.error('Error generating text:', error);
    throw error;
  }
}

/**
 * Processes a chat conversation with Vertex AI
 * @param {Array} messages - Array of message objects with role and content
 * @return {Promise<string>} The AI response
 */
async function processChat(messages) {
  try {
    const model = vertexAI.getGenerativeModel({
      model: TEXT_MODEL_NAME,
      generation_config: TEXT_GENERATION_CONFIG,
    });

    // Format messages for Vertex AI
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));

    const response = await model.generateContent({ contents: formattedMessages });
    return response.response.candidates[0]?.content?.parts[0]?.text || '';
  } catch (error) {
    functions.logger.error('Error processing chat:', error);
    throw error;
  }
}

/**
 * Generates an image description with Vertex AI Vision
 * @param {string} imageUrl - URL of the image to analyze
 * @param {string} prompt - The text prompt describing what to analyze
 * @return {Promise<string>} The generated description
 */
async function processImage(imageUrl, prompt = 'Describe this image in detail.') {
  try {
    const model = vertexAI.getGenerativeModel({
      model: IMAGE_MODEL_NAME,
      generation_config: IMAGE_GENERATION_CONFIG,
    });

    const request = {
      contents: [{
        role: "user",
        parts: [
          {text: prompt},
          {inline_data: {mime_type: "image/jpeg", data: imageUrl}}
        ]
      }]
    };

    const response = await model.generateContent(request);
    return response.response.candidates[0]?.content?.parts[0]?.text || '';
  } catch (error) {
    functions.logger.error('Error processing image:', error);
    throw error;
  }
}

/**
 * Generates text embeddings for semantic search and similarity
 * @param {string} text - The text to embed
 * @return {Promise<Array<number>>} The embedding vector
 */
async function generateEmbedding(text) {
  try {
    const model = vertexAI.getGenerativeModel({
      model: EMBEDDING_MODEL,
    });

    const response = await model.embedContent({
      content: { parts: [{ text }] },
    });

    return response.embedding.values;
  } catch (error) {
    functions.logger.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Processes audio with Speech-to-Text
 * @param {string} audioUri - GCS URI to the audio file
 * @return {Promise<string>} Transcribed text
 */
async function processAudio(audioUri) {
  try {
    const speech = require('@google-cloud/speech');
    const client = new speech.SpeechClient();

    const audio = {
      uri: audioUri,
    };
    const config = {
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode: 'en-US',
    };
    const request = {
      audio: audio,
      config: config,
    };

    const [response] = await client.recognize(request);
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');
    
    return transcription;
  } catch (error) {
    functions.logger.error('Error processing audio:', error);
    throw error;
  }
}

/**
 * Generates a game response based on game state
 * @param {Object} gameState - Current game state
 * @param {string} userMessage - User's message
 * @return {Promise<Object>} Game response with text and actions
 */
async function processGameMessage(gameState, userMessage) {
  try {
    const model = vertexAI.getGenerativeModel({
      model: TEXT_MODEL_NAME,
      generation_config: {
        temperature: 0.7,
        top_p: 0.95,
        top_k: 40,
        max_output_tokens: TEXT_GENERATION_CONFIG.maxOutputTokens,
      },
    });

    // Create system prompt that includes game context
    const systemPrompt = `
You are an AI game master for a Knight Krawl, a text-based adventure game.
Current game state: ${JSON.stringify(gameState)}

User message: "${userMessage}"

Respond with a JSON object containing:
1. "response": Your in-character narrative response
2. "updatedState": An updated game state object
3. "actions": An array of possible actions the player can take
4. "metadata": Any additional data like enemy stats, items found, etc.

Only provide valid JSON without code blocks or explanations.
`;

    const response = await model.generateText({ text: systemPrompt });
    const responseText = response.response.candidates[0]?.content?.parts[0]?.text || '';
    
    // Parse the JSON response
    let parsedResponse;
    try {
      // Clean up the response text to ensure it's valid JSON
      const jsonText = responseText.replace(/```json|```|^\s+|\s+$/g, '');
      parsedResponse = JSON.parse(jsonText);
    } catch (jsonError) {
      functions.logger.error('Error parsing JSON response:', jsonError);
      // Return a fallback response if JSON parsing fails
      return {
        response: "I'm having trouble processing your request. Please try again.",
        updatedState: gameState,
        actions: ["Try again"],
        metadata: { error: "JSON parsing error" }
      };
    }
    
    return parsedResponse;
  } catch (error) {
    functions.logger.error('Error processing game message:', error);
    throw error;
  }
}

// Export functions
module.exports = {
  generateText,
  processChat,
  processImage,
  generateEmbedding,
  processAudio,
  processGameMessage
}; 