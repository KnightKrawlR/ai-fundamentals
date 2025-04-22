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

// Vertex AI configuration - Use Firebase config values
const PROJECT_ID = functions.config().vertexai?.project || process.env.VERTEX_PROJECT_ID || 'ai-fundamentals-ad37d';
const LOCATION = functions.config().vertexai?.location || process.env.VERTEX_LOCATION || 'us-central1';
const GEMINI_PRO_MODEL = functions.config().vertexai?.model || process.env.GEMINI_PRO_MODEL || 'gemini-pro';
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

// Initialize the Vertex AI client with better error handling
let vertexAI;
try {
  vertexAI = new VertexAI({
    project: PROJECT_ID, 
    location: LOCATION,
  });
  console.log(`Vertex AI client initialized successfully for project ${PROJECT_ID} in ${LOCATION}`);
} catch (error) {
  console.error('Error initializing Vertex AI client:', error);
  console.error('Project ID:', PROJECT_ID);
  console.error('Location:', LOCATION);
  throw new Error(`Failed to initialize Vertex AI: ${error.message}`);
}

// Text model configuration - updated to use config values
const TEXT_MODEL_NAME = GEMINI_PRO_MODEL;
const TEXT_GENERATION_CONFIG = {
  temperature: 0.2,
  topP: 0.8,
  topK: 40,
  maxOutputTokens: 8192,
};

// Image model configuration
const IMAGE_MODEL_NAME = GEMINI_PRO_VISION_MODEL;
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
const admin = require('firebase-admin');
const { VertexAI } = require('@google-cloud/vertexai');
const { v4: uuidv4 } = require('uuid');

// Initialize Vertex AI
const vertexAI = new VertexAI({
  project: process.env.VERTEX_PROJECT_ID || 'your-project-id', // Replace with your actual GCP project ID or set in environment
  location: process.env.VERTEX_LOCATION || 'us-central1', // Use your preferred region
});

// Configure model parameters
const MODEL_CONFIG = {
  geminiProModel: 'gemini-pro',
  geminiProVisionModel: 'gemini-pro-vision',
  textGenerationModel: 'text-bison@002',
  temperature: 0.2,
  maxOutputTokens: 1024,
  topK: 40,
  topP: 0.95,
};

// Safety settings for content generation
const SAFETY_SETTINGS = [
  {
    category: 'HARM_CATEGORY_DANGEROUS',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
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

// Store active game sessions
const gameSessions = {};

/**
 * Generate a text response using Vertex AI
 * @param {string} prompt - The user's prompt
 * @returns {Promise<string>} The AI generated response
 */
async function generateResponse(prompt) {
  try {
    const generativeModel = vertexAI.preview.getGenerativeModel({
      model: MODEL_CONFIG.geminiProModel,
      safetySettings: SAFETY_SETTINGS,
      generation_config: {
        temperature: MODEL_CONFIG.temperature,
        maxOutputTokens: MODEL_CONFIG.maxOutputTokens,
        topK: MODEL_CONFIG.topK,
        topP: MODEL_CONFIG.topP,
      },
    });

    const result = await generativeModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    return result.response.candidates[0].content.parts[0].text;
  } catch (error) {
    functions.logger.error('Error generating AI response:', error);
    throw new Error(`Failed to generate AI response: ${error.message}`);
  }
}

/**
 * Process a chat conversation with history
 * @param {Array} conversationHistory - Array of conversation messages
 * @returns {Promise<string>} The AI generated response
 */
async function processChatConversation(conversationHistory) {
  try {
    const generativeModel = vertexAI.preview.getGenerativeModel({
      model: MODEL_CONFIG.geminiProModel,
      safetySettings: SAFETY_SETTINGS,
      generation_config: {
        temperature: MODEL_CONFIG.temperature,
        maxOutputTokens: MODEL_CONFIG.maxOutputTokens,
        topK: MODEL_CONFIG.topK,
        topP: MODEL_CONFIG.topP,
      },
    });

    // Format conversation for Vertex AI
    const formattedHistory = conversationHistory.map(msg => ({
      role: msg.role, // 'user' or 'model'
      parts: [{ text: msg.content }]
    }));

    const result = await generativeModel.generateContent({
      contents: formattedHistory,
    });

    return result.response.candidates[0].content.parts[0].text;
  } catch (error) {
    functions.logger.error('Error processing chat conversation:', error);
    throw new Error(`Failed to process chat conversation: ${error.message}`);
  }
}

/**
 * Initialize a new game session
 * @param {string} userId - The user's ID
 * @param {string} gameType - Type of game (adventure, puzzle, etc.)
 * @param {string} prompt - Initial game prompt
 * @returns {Promise<Object>} Session information
 */
async function initializeGameSession(userId, gameType, prompt) {
  try {
    // Create a unique session ID
    const sessionId = `${userId}_${Date.now()}`;
    
    // Initialize game with system prompt based on game type
    let systemPrompt = '';
    
    switch (gameType) {
      case 'adventure':
        systemPrompt = `You are running an interactive adventure game. Create an immersive, text-based adventure experience for the player. Start with a compelling introduction to the setting and provide choices for the player to proceed. Maintain game state and remember the player's choices. The adventure should have challenges, items to collect, and a goal to achieve.`;
        break;
      case 'puzzle':
        systemPrompt = `You are running a puzzle-solving game. Present the player with creative puzzles and riddles to solve. Give hints when requested but don't give away solutions too easily. Track the player's progress and adjust difficulty based on their performance.`;
        break;
      case 'rpg':
        systemPrompt = `You are running a text-based RPG game. Create a character for the player with stats (Strength, Intelligence, Charisma), health points, and inventory. Present combat encounters using turn-based mechanics. Track player health, inventory, and progress. Allow for character growth and equipment upgrades.`;
        break;
      default:
        systemPrompt = `You are running an interactive game experience. Create an engaging scenario for the player and respond to their inputs in a way that makes the experience feel dynamic and responsive.`;
    }
    
    // Create conversation history with system prompt
    const conversationHistory = [
      { role: 'model', content: systemPrompt },
      { role: 'user', content: prompt }
    ];
    
    // Generate initial game response
    const initialResponse = await processChatConversation(conversationHistory);
    
    // Update conversation history with AI's response
    conversationHistory.push({ role: 'model', content: initialResponse });
    
    // Store the session
    gameSessions[sessionId] = {
      userId,
      gameType,
      conversationHistory,
      startTime: Date.now(),
      creditsUsed: 1, // Track credit usage
    };
    
    // Save to Firestore (would be implemented in a real system)
    // await admin.firestore().collection('gameSessions').doc(sessionId).set(gameSessions[sessionId]);
    
    return {
      sessionId,
      response: initialResponse,
      conversationHistory
    };
  } catch (error) {
    functions.logger.error('Error initializing game session:', error);
    throw new Error(`Failed to initialize game session: ${error.message}`);
  }
}

/**
 * Send a message to an existing game session
 * @param {string} sessionId - The session ID
 * @param {string} userId - The user's ID
 * @param {string} message - The user's message
 * @returns {Promise<Object>} Updated session information
 */
async function sendGameMessage(sessionId, userId, message) {
  try {
    // Get the session
    const session = gameSessions[sessionId];
    
    if (!session) {
      throw new Error(`Game session ${sessionId} not found`);
    }
    
    if (session.userId !== userId) {
      throw new Error('User ID does not match session owner');
    }
    
    // Add user message to conversation history
    session.conversationHistory.push({ role: 'user', content: message });
    
    // Generate AI response
    const aiResponse = await processChatConversation(session.conversationHistory);
    
    // Add AI response to conversation history
    session.conversationHistory.push({ role: 'model', content: aiResponse });
    
    // Update credits used
    session.creditsUsed += 1;
    
    // Update session in memory
    gameSessions[sessionId] = session;
    
    // Update in Firestore (would be implemented in a real system)
    // await admin.firestore().collection('gameSessions').doc(sessionId).update({
    //   conversationHistory: session.conversationHistory,
    //   creditsUsed: session.creditsUsed,
    //   lastUpdated: Date.now()
    // });
    
    return {
      sessionId,
      response: aiResponse,
      conversationHistory: session.conversationHistory,
      creditsUsed: session.creditsUsed
    };
  } catch (error) {
    functions.logger.error('Error sending game message:', error);
    throw new Error(`Failed to send game message: ${error.message}`);
  }
}

module.exports = {
  generateResponse,
  processChatConversation,
  initializeGameSession,
  sendGameMessage
}; 