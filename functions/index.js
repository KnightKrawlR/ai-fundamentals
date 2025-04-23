/**
 * Firebase Cloud Functions for Vertex AI
 * These functions provide an API to integrate with Google's Vertex AI services
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
// Update CORS configuration to allow website domain explicitly
const cors = require('cors')({ 
  origin: ['https://www.ai-fundamentals.me', 'https://ai-fundamentals.me'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
});
const { VertexAI } = require('@google-cloud/vertexai');

// Import Vercel AI SDK components
const { xai } = require("@ai-sdk/xai");
const { generateText } = require("ai");

// Initialize Firebase Admin SDK
admin.initializeApp();

// Reference to Firestore database
const db = admin.firestore();

// Configuration constants
const GROK_API_URL = process.env.GROK_API_URL || 'https://api.x.ai/v1';
const GROK_API_KEY = process.env.GROK_API_KEY || process.env.XAI_API_KEY;
const DEFAULT_CREDITS = 10;

console.log('Using Grok API URL:', GROK_API_URL);

/**
 * Credit management constants
 */
const TEXT_CREDIT_COST = 1;
const CHAT_CREDIT_COST = 1;
const IMAGE_CREDIT_COST = 5;
const GAME_SESSION_COST = 2;
const GAME_MESSAGE_COST = 1;

// Initialize Vertex AI using Firebase config values
const PROJECT_ID = functions.config().vertexai?.project || process.env.GCLOUD_PROJECT || 'ai-fundamentals-ad37d';
const LOCATION = functions.config().vertexai?.location || 'us-central1';
const MODEL_NAME = functions.config().vertexai?.model || 'gemini-pro';

// Log configuration for debugging
console.log(`Initializing Vertex AI with: Project=${PROJECT_ID}, Location=${LOCATION}, Model=${MODEL_NAME}`);

// For older versions of the vertexai library (0.1.3), we need to use a simpler approach
// We'll initialize clients on demand in each function to avoid deployment timeouts
let vertexAI = null;
let vertexClient = null;

// Create a wrapper function that will initialize the client on first use
const getVertexClient = async () => {
  if (!vertexClient) {
    try {
      // Import the legacy version of Vertex AI APIs
      const {PredictionServiceClient} = require('@google-cloud/aiplatform');
      
      // Initialize the PredictionServiceClient
      const predictionClient = new PredictionServiceClient({
        projectId: PROJECT_ID
      });
      
      // Create a wrapper for the vertexAI interface
      vertexAI = {
        getGenerativeModel: ({model, generation_config}) => {
          return {
            generateContent: async ({contents}) => {
              try {
                // Format the request for the prediction API
                const request = {
                  endpoint: `projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${model || MODEL_NAME}`,
                  instances: [
                    {
                      content: contents
                    }
                  ],
                  parameters: {
                    temperature: generation_config?.temperature || 0.7,
                    maxOutputTokens: generation_config?.max_output_tokens || 1024,
                    topK: generation_config?.top_k || 40,
                    topP: generation_config?.top_p || 0.9
                  }
                };
                
                // Make the actual API call
                const [response] = await predictionClient.predict(request);
                
                // Format the response to match what our code expects
                return {
                  response: {
                    candidates: [
                      {
                        content: {
                          parts: [
                            {
                              text: response.predictions[0]
                            }
                          ]
                        }
                      }
                    ],
                    usageMetadata: {
                      promptTokenCount: 0, // Not available in this API
                      candidatesTokenCount: 0, // Not available in this API
                      totalTokenCount: 0 // Not available in this API
                    }
                  }
                };
              } catch (error) {
                console.error('Error in generateContent wrapper:', error);
                throw error;
              }
            }
          };
        }
      };
      
      // Also provide direct access to the prediction client
      vertexClient = predictionClient;
      
      console.log('Vertex AI client initialized successfully');
    } catch (error) {
      console.error('Error initializing Vertex AI client:', error);
      throw error;
    }
  }
  
  return vertexAI;
};

// Create a wrapper for callable functions that properly sets CORS headers
const createCallableFunction = (handler) => {
  return functions.https.onCall((data, context) => {
    try {
      // For callable functions, we don't need to manually set CORS headers
      // Firebase handles this automatically, but we can customize the function behavior
      
      // Always allow function calls even without authentication
      // This is a temporary change for debugging - remove in production
      const allowAnonymous = true; // Force allow all access temporarily
      
      // Only check authentication if explicitly required by the function
      if (!allowAnonymous && !context.auth) {
        throw new functions.https.HttpsError(
          'unauthenticated',
          'Authentication required'
        );
      }
      
      // Call the original handler
      return handler(data, context);
    } catch (error) {
      console.error('Error in callable function:', error);
      
      // Convert any error to an HttpsError
      if (!(error instanceof functions.https.HttpsError)) {
        throw new functions.https.HttpsError(
          'internal',
          error.message || 'An unexpected error occurred'
        );
      }
      
      throw error;
    }
  });
};

// Create a wrapper for HTTP functions that adds CORS handling
const createHttpFunction = (handler) => {
  return functions.https.onRequest((req, res) => {
    // Set CORS headers for all allowed domains
    res.set('Access-Control-Allow-Origin', 'https://www.ai-fundamentals.me');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.set('Access-Control-Allow-Credentials', 'true');
    res.set('Access-Control-Max-Age', '3600');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }
    
    // Enable CORS using the 'cors' middleware as fallback
    return cors(req, res, () => {
      return handler(req, res);
    });
  });
};

// Add a health check endpoint to test CORS
exports.healthCheck = createHttpFunction((req, res) => {
  // Set CORS headers directly
  res.set('Access-Control-Allow-Origin', 'https://www.ai-fundamentals.me');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.set('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  res.status(200).json({ status: 'ok', message: 'Vertex AI functions are running' });
});

// Add a CORS proxy function
exports.corsProxy = functions.https.onRequest(async (req, res) => {
  // Set permissive CORS headers
  res.set('Access-Control-Allow-Origin', 'https://www.ai-fundamentals.me');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.set('Access-Control-Allow-Credentials', 'true');
  res.set('Access-Control-Max-Age', '3600');
  
  // Handle OPTIONS requests (preflight)
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  // Get the target function from query parameters
  const targetFunction = req.query.function || 'healthCheck';
  const functionData = req.body || {};
  
  console.log(`CORS Proxy: Forwarding request to ${targetFunction} with data:`, functionData);
  
  // Basic implementation to forward to a few key functions
  try {
    // Special case for health check
    if (targetFunction === 'healthCheck') {
      return res.status(200).json({ status: 'ok', message: 'CORS Proxy is working' });
    }
    
    // For initializeGameSession
    if (targetFunction === 'initializeGameSession') {
      const { gameConfig, model = 'gemini-pro', options = {} } = functionData;
      
      if (!gameConfig || !gameConfig.gameType) {
        return res.status(400).json({
          error: 'Game type is required',
          code: 'invalid-argument'
        });
      }
      
      // Create a unique session ID
      const sessionId = admin.firestore().collection('gameSessions').doc().id;
      const userId = functionData.userId || 'anonymous';
      
      // Build the system prompt for the game
      const systemPrompt = `You are an AI game master for a ${gameConfig.gameType} game. The player's character is named ${gameConfig.characterName || 'Player'}. 
Generate an engaging introduction to the game world and the first scenario. Be creative, descriptive, and interactive.
Your responses should be immersive and provide clear choices or actions for the player.`;
      
      // Generate a simulated response for now to avoid API issues
      const introText = `Welcome to AI Fundamentals Games! I'm your gaming assistant for ${gameConfig.gameType}, focusing on ${gameConfig.topic || 'various topics'}.
      
In this game, we'll explore concepts at the ${gameConfig.difficulty || 'beginner'} level. I'll guide you through interactive scenarios and provide useful information.

What specific aspect of ${gameConfig.topic || 'this subject'} would you like to start with?`;
      
      // Store the game session in Firestore
      await admin.firestore().collection('gameSessions').doc(sessionId).set({
        userId,
        sessionId,
        gameType: gameConfig.gameType,
        characterName: gameConfig.characterName || 'Player',
        model: model,
        topic: gameConfig.topic,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'assistant', content: introText }
        ],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      return res.status(200).json({
        sessionId,
        introText,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'assistant', content: introText }
        ],
        success: true
      });
    }
    
    // For sendGameMessage
    if (targetFunction === 'sendGameMessage') {
      const { sessionId, message, model = 'gemini-pro', options = {} } = functionData;
      
      if (!sessionId || !message) {
        return res.status(400).json({
          error: 'Session ID and message are required',
          code: 'invalid-argument'
        });
      }
      
      // Get the game session
      const sessionDoc = await admin.firestore().collection('gameSessions').doc(sessionId).get();
      
      if (!sessionDoc.exists) {
        return res.status(404).json({
          error: 'Game session not found',
          code: 'not-found'
        });
      }
      
      const sessionData = sessionDoc.data();
      
      // Get the conversation history
      const messages = sessionData.messages || [];
      
      // Add the user message to history
      const updatedMessages = [
        ...messages,
        { role: 'user', content: message }
      ];
      
      // Generate a simulated AI response for now to avoid API issues
      const aiResponse = `Thanks for your message about "${message}". 
      
As your game assistant for ${sessionData.gameType}, I'm here to help you explore ${sessionData.topic || 'this topic'}. 

What would you like to know more about or what would you like to do next?`;
      
      // Update the game session in Firestore
      await admin.firestore().collection('gameSessions').doc(sessionId).update({
        messages: updatedMessages,
        lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      return res.status(200).json({
        aiResponse,
        gameState: {
          sessionId,
          messageCount: updatedMessages.length + 1
        },
        success: true
      });
    }
    
    // Default case for unsupported functions
    return res.status(400).json({
      error: `Function '${targetFunction}' not supported by the CORS proxy`,
      code: 'not-implemented'
    });
    
  } catch (error) {
    console.error('CORS Proxy error:', error);
    res.status(500).json({ 
      error: error.message || 'Internal Server Error',
      code: error.code || 500
    });
  }
});

/**
 * Middleware to get user from auth token
 * @param {Object} req - Request object
 * @returns {Promise<Object>} User object with uid
 */
const getUserFromAuth = async (req) => {
  // Get the authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized: No valid auth token provided');
  }

  // Verify the token
  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return { uid: decodedToken.uid };
  } catch (error) {
    console.error('Error verifying auth token:', error);
    throw new Error('Unauthorized: Invalid auth token');
  }
};

/**
 * Middleware to verify user has sufficient credits for operation
 * @param {string} uid - User ID
 * @param {string} operationType - Type of operation
 * @returns {Promise<number>} Remaining credits after operation
 */
const verifyCredits = async (uid, operationType) => {
  // Get the cost for the operation
  const cost = {
    text: TEXT_CREDIT_COST,
    chat: CHAT_CREDIT_COST,
    image: IMAGE_CREDIT_COST,
    audio: 3,
    game: GAME_SESSION_COST,
    embeddings: 1
  }[operationType] || 1;
  
  // Get the user's document from Firestore
  const userRef = admin.firestore().collection('users').doc(uid);
  const userDoc = await userRef.get();
  
  // If user document doesn't exist, create it with default credits
  if (!userDoc.exists) {
    await userRef.set({ credits: DEFAULT_CREDITS });
    return DEFAULT_CREDITS - cost;
  }
  
  // Check if user has enough credits
  const userData = userDoc.data();
  const currentCredits = userData.credits || 0;
  
  if (currentCredits < cost) {
    throw new Error(`Insufficient credits: You need ${cost} credits for this operation but have only ${currentCredits}.`);
  }
  
  // Update credits and return remaining amount
  const newCredits = currentCredits - cost;
  await userRef.update({ credits: newCredits });
  
  // Log the transaction - FIXED: Changed userId to uid
  await admin.firestore().collection('creditTransactions').add({
    userId: uid,
    operationType,
    creditsCost: cost,
    remainingCredits: newCredits,
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });
  
  return newCredits;
};

/**
 * Helper to validate authentication unless anonymous access is allowed
 */
const validateAuth = async (context, allowAnonymous = false) => {
  if (allowAnonymous) return true;
  
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Authentication required'
    );
  }
  return true;
};

/**
 * Helper to log API usage for billing/quotas
 */
const logAPIUsage = async (userId, model, tokensUsed, endpoint) => {
  try {
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    await admin.firestore().collection('apiUsage').add({
      userId: userId || 'anonymous',
      model,
      tokensUsed,
      endpoint,
      timestamp
    });
  } catch (error) {
    console.error('Error logging API usage:', error);
  }
};

/**
 * Generate a response from Vertex AI
 */
exports.generateVertexAIResponse = createCallableFunction(async (data, context) => {
  try {
    const { prompt, model = 'gemini-pro', options = {}, allowAnonymous = false } = data;
    
    // Validate input
    if (!prompt) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Prompt is required'
      );
    }
    
    // Validate authentication
    await validateAuth(context, allowAnonymous);
    
    // FIXED: Get the Vertex AI client first
    const vertexAI = await getVertexClient();
    
    // Initialize the generative model
    const generativeModel = vertexAI.getGenerativeModel({
      model: model,
      generation_config: {
        max_output_tokens: options.maxTokens || 1024,
        temperature: options.temperature || 0.7,
        top_p: options.topP || 0.9,
        top_k: options.topK || 40
      },
    });

    // Generate content
    const result = await generativeModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const response = result.response;
    
    // Extract the generated text
    const generatedText = response.candidates[0].content.parts[0].text;
    
    // Get usage metadata
    const usageMetadata = {
      promptTokens: response.usageMetadata?.promptTokenCount || 0,
      candidatesTokens: response.usageMetadata?.candidatesTokenCount || 0,
      totalTokens: response.usageMetadata?.totalTokenCount || 0
    };
    
    // Log API usage
    await logAPIUsage(
      context.auth?.uid || null,
      model,
      usageMetadata.totalTokens,
      'generateResponse'
    );
    
    return {
      text: generatedText,
      model: model,
      usageMetadata,
      success: true
    };
  } catch (error) {
    console.error('Error generating response:', error);
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'Error generating response'
    );
  }
});

/**
 * Process a chat conversation with Vertex AI
 */
exports.processChatConversation = createCallableFunction(async (data, context) => {
  try {
    const { messages, model = 'gemini-pro', options = {}, allowAnonymous = false } = data;
    
    // Validate input
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Valid messages array is required'
      );
    }
    
    // Validate authentication
    await validateAuth(context, allowAnonymous);
    
    // FIXED: Get the Vertex AI client first
    const vertexAI = await getVertexClient();
    
    // Initialize the chat model
    const generativeModel = vertexAI.getGenerativeModel({
      model: model,
      generation_config: {
        max_output_tokens: options.maxTokens || 1024,
        temperature: options.temperature || 0.7,
        top_p: options.topP || 0.9,
        top_k: options.topK || 40
      },
    });
    
    // Format messages for Vertex AI
    const formattedMessages = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));
    
    // Generate content
    const result = await generativeModel.generateContent({
      contents: formattedMessages,
    });
    
    const response = result.response;
    const generatedText = response.candidates[0].content.parts[0].text;
    
    // Get usage metadata
    const usageMetadata = {
      promptTokens: response.usageMetadata?.promptTokenCount || 0,
      candidatesTokens: response.usageMetadata?.candidatesTokenCount || 0,
      totalTokens: response.usageMetadata?.totalTokenCount || 0
    };
    
    // Log API usage
    await logAPIUsage(
      context.auth?.uid || null,
      model,
      usageMetadata.totalTokens,
      'processChatConversation'
    );
    
    return {
      text: generatedText,
      model: model,
      usageMetadata,
      success: true
    };
  } catch (error) {
    console.error('Error processing chat conversation:', error);
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'Error processing chat conversation'
    );
  }
});

/**
 * Allow users to add credits to their own accounts
 */
exports.addUserCredits = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to add credits.'
    );
  }
  
  const userId = context.auth.uid;
  const creditsToAdd = data.credits;
  
  // Validate the credit amount
  if (!creditsToAdd || typeof creditsToAdd !== 'number' || creditsToAdd <= 0) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'You must specify a positive number of credits to add.'
    );
  }
  
  // Get a reference to the user document
  const userRef = admin.firestore().collection('users').doc(userId);
  
  try {
    // Use a transaction to safely update credits
    const result = await admin.firestore().runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists) {
        throw new functions.https.HttpsError(
          'not-found',
          'User not found. Please try again later.'
        );
      }
      
      const userData = userDoc.data();
      const currentCredits = userData.credits || 0;
      const newCredits = currentCredits + creditsToAdd;
      
      // Update user document with new credit total
      transaction.update(userRef, { 
        credits: newCredits,
        lastCreditUpdate: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Log the credit transaction
      const creditLogRef = admin.firestore().collection('creditTransactions').doc();
      transaction.set(creditLogRef, {
        userId: userId,
        amount: creditsToAdd,
        type: 'purchase',
        previousBalance: currentCredits,
        newBalance: newCredits,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
      
      return {
        previousCredits: currentCredits,
        newCredits: newCredits,
        added: creditsToAdd
      };
    });
    
    return {
      success: true,
      message: `Successfully added ${creditsToAdd} credits to your account.`,
      previousCredits: result.previousCredits,
      currentCredits: result.newCredits
    };
    
  } catch (error) {
    console.error('Error adding credits:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to add credits. Please try again later.'
    );
  }
});

/**
 * Initialize a game session
 */
exports.initializeGameSession = functions.https.onCall(async (data, context) => {
  const startTime = Date.now();
  
  // Extract the user UID from the auth context
  const userId = context.auth?.uid;
  
  // Check if user is authenticated
  if (!userId) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Authentication required'
    );
  }
  
  // Get user data for credit check
  const userRef = admin.firestore().collection('users').doc(userId);
  const userDoc = await userRef.get();
  
  if (!userDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'User not found');
  }
  
  const userData = userDoc.data();
  const userCredits = userData.credits || 0;
  const requiredCredits = GAME_SESSION_COST;
  
  // Check if user has enough credits
  if (userCredits < requiredCredits) {
    // Instead of throwing an error, return a friendly message with options
    console.log(`User ${userId} has insufficient credits: ${userCredits}/${requiredCredits}`);
    
    // Calculate days until next month for monthly credit refresh
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysUntilNextMonth = lastDay - now.getDate() + 1;
    
    return {
      success: false,
      errorType: 'insufficient_credits',
      message: `You need ${requiredCredits} credits to start a new game, but you only have ${userCredits} credits.`,
      currentCredits: userCredits,
      requiredCredits: requiredCredits,
      options: [
        {
          action: 'add_credits',
          label: 'Add More Credits',
          description: 'Purchase additional credits to continue playing.'
        },
        {
          action: 'wait_for_monthly',
          label: 'Wait for Monthly Credits',
          description: `You'll receive ${DEFAULT_CREDITS} free credits in ${daysUntilNextMonth} days.`
        }
      ]
    };
  }
  
  // Generate a unique session ID
  const sessionId = admin.firestore().collection('gameSessions').doc().id;
  
  // Create a simple response
  const topicId = data.topicId || 'general';
  const difficulty = data.difficulty || 'intermediate';
  
  // Generate a simple introductory message
  const introText = `Welcome to your learning session about ${topicId}! I'll be your AI guide for exploring this topic with a ${difficulty} approach. What specific aspects would you like to learn about?`;
  
  // Create conversation history
  const conversationHistory = [{
    role: 'assistant',
    content: introText
  }];
  
  // Store the game session in Firestore
  await admin.firestore().collection('gameSessions').doc(sessionId).set({
    userId: userId,
    topicId: topicId,
    difficulty: difficulty,
    sessionId: sessionId,
    model: data.model || 'gemini-pro',
    messages: conversationHistory,
    creditsUsed: requiredCredits,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  
  // Update user's credit balance
  await userRef.update({
    credits: userCredits - requiredCredits,
    totalCreditsUsed: (userData.totalCreditsUsed || 0) + requiredCredits
  });
  
  // Return success response
    return { 
    sessionId: sessionId,
    initialPrompt: introText,
    conversationHistory: conversationHistory,
    creditsUsed: requiredCredits,
    remainingCredits: userCredits - requiredCredits,
    success: true
  };
});

/**
 * Send a message in a game session
 */
exports.sendGameMessage = functions.https.onCall(async (data, context) => {
  try {
    const { sessionId, message, model = 'gemini-pro', options = {} } = data;
    
    // Validate input
    if (!sessionId || !message) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Session ID and message are required'
      );
    }
    
    // Validate authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
        'Authentication required'
      );
    }
    
    const userId = context.auth.uid;
    
    // Get the game session
    const sessionDoc = await admin.firestore().collection('gameSessions').doc(sessionId).get();
    
    if (!sessionDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Game session not found'
      );
    }
    
    const sessionData = sessionDoc.data();
    
    // Check if the user owns this session
    if (sessionData.userId !== userId) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'You do not have permission to access this game session'
      );
    }
    
    // Generate a simple response
    const aiResponse = `Thank you for your message about "${message}". As your AI guide, I'm happy to help you learn more about this topic. Is there anything specific you'd like to explore further?`;
    
    // Get the conversation history
    const messages = sessionData.messages || [];
    
    // Add the user message to history
    const updatedMessages = [
      ...messages,
      { role: 'user', content: message }
    ];
    
    // Add AI response to history
    updatedMessages.push({ role: 'assistant', content: aiResponse });
    
    // Update the game session in Firestore
    await admin.firestore().collection('gameSessions').doc(sessionId).update({
      messages: updatedMessages,
      lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { 
      aiResponse,
      success: true
    };
  } catch (error) {
    console.error('Error sending game message:', error);
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'Error sending game message'
    );
  }
});

/**
 * Get the available models for the authenticated user
 */
exports.getAvailableModels = functions.https.onCall(async (data, context) => {
  try {
    // This will throw if the user is not authenticated
    await validateAuth(context, false);
    
    return {
      models: [
        {
          name: 'gemini-pro',
          displayName: 'Gemini Pro',
          type: 'text',
          maxTokens: 32768
        },
        {
          name: 'gemini-pro-vision',
          displayName: 'Gemini Pro Vision',
          type: 'multimodal',
          maxTokens: 16384
        },
        {
          name: 'gemini-1.5-pro',
          displayName: 'Gemini 1.5 Pro',
          type: 'multimodal',
          maxTokens: 32768
        }
      ],
      success: true
    };
  } catch (error) {
    console.error('Error getting available models:', error);
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'Error getting available models'
    );
  }
});

/**
 * Generate text completion with VertexAI
 */
exports.generateText = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const { prompt } = req.body;
      
      // Validate input
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      // FIXED: Get the Vertex AI client first
      const vertexAI = await getVertexClient();

      // Generate text using VertexAI
      const generatedText = await vertexAI.generateText(prompt);
      
      // Return the generated text
      return res.status(200).json({ result: generatedText });
    } catch (error) {
      functions.logger.error('Error in generateText function:', error);
      return res.status(500).json({ error: 'Failed to generate text', details: error.message });
    }
  });
});

/**
 * Process chat with conversation history
 */
exports.processChat = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const { messages } = req.body;
      
      // Validate input
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Valid messages array is required' });
      }

      // FIXED: Get the Vertex AI client first
      const vertexAI = await getVertexClient();

      // Process chat using VertexAI
      const response = await vertexAI.processChat(messages);
      
      // Return the chat response
      return res.status(200).json({ result: response });
    } catch (error) {
      functions.logger.error('Error in processChat function:', error);
      return res.status(500).json({ error: 'Failed to process chat', details: error.message });
    }
        });
      });
      
/**
 * Process image with VertexAI Vision
 */
exports.processImage = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const { imageUrl, prompt } = req.body;
      
      // Validate input
      if (!imageUrl) {
        return res.status(400).json({ error: 'Image URL is required' });
      }

      // FIXED: Get the Vertex AI client first
      const vertexAI = await getVertexClient();

      // Process image using VertexAI
      const result = await vertexAI.processImage(imageUrl, prompt);
      
      // Return the image processing result
      return res.status(200).json({ result });
    } catch (error) {
      functions.logger.error('Error in processImage function:', error);
      return res.status(500).json({ error: 'Failed to process image', details: error.message });
    }
  });
});

/**
 * Generate text embeddings for semantic search
 */
exports.generateEmbedding = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const { text } = req.body;
      
      // Validate input
      if (!text) {
        return res.status(400).json({ error: 'Text is required' });
      }

      // FIXED: Get the Vertex AI client first
      const vertexAI = await getVertexClient();

      // Generate embedding using VertexAI
      const embedding = await vertexAI.generateEmbedding(text);
      
      // Return the embedding
      return res.status(200).json({ result: embedding });
    } catch (error) {
      functions.logger.error('Error in generateEmbedding function:', error);
      return res.status(500).json({ error: 'Failed to generate embedding', details: error.message });
    }
  });
});

/**
 * Process game interaction
 */
exports.processGameMessage = functions.https.onCall(async (data, context) => {
  try {
    // Ensure user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

    const { gameState, userMessage } = data;
    
    // Validate input
    if (!gameState || !userMessage) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Game state and user message are required.'
      );
    }

    // FIXED: Get the Vertex AI client first
    const vertexAI = await getVertexClient();

    // Process game message using VertexAI
    const result = await vertexAI.processGameMessage(gameState, userMessage);
    
    // Return the game response
    return { result };
  } catch (error) {
    functions.logger.error('Error in processGameMessage function:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Store chat history in Firestore
 */
exports.saveChatHistory = functions.https.onCall(async (data, context) => {
  try {
    // Ensure user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'The function must be called while authenticated.'
      );
    }

    const { chatId, messages } = data;
    
    // Validate input
    if (!chatId || !messages || !Array.isArray(messages)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Chat ID and messages array are required.'
      );
    }

    const userId = context.auth.uid;
    
    // Save chat history to Firestore
    await admin.firestore().collection('users').doc(userId)
      .collection('chats').doc(chatId)
      .set({
        messages,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    
    return { success: true };
  } catch (error) {
    functions.logger.error('Error in saveChatHistory function:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Generate AI text response
 */
exports.generateTextResponse = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      // Only allow POST requests
      if (req.method !== 'POST') {
        return res.status(405).send({ error: 'Method not allowed' });
      }
      
      // Get user from auth token
      const user = await getUserFromAuth(req);
      
      // Get request data
      const { prompt, systemInstructions } = req.body;
      if (!prompt) {
        return res.status(400).send({ error: 'Prompt is required' });
      }
      
      // Verify credits for text operation
      const remainingCredits = await verifyCredits(user.uid, 'text');
      
      // FIXED: Get the Vertex AI client first
      const vertexAI = await getVertexClient();
      
      // Generate response
      const response = await vertexAI.generateResponse(prompt, systemInstructions || '');
      
      // Return the response
      return res.status(200).send({ 
        response, 
        credits: remainingCredits 
      });
    } catch (error) {
      console.error('Error in generateTextResponse:', error);
      return res.status(error.message.includes('Unauthorized') ? 401 : 500).send({ 
        error: error.message 
      });
    }
  });
});

/**
 * Process audio with AI
 */
exports.processAudio = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      // Only allow POST requests
      if (req.method !== 'POST') {
        return res.status(405).send({ error: 'Method not allowed' });
      }
      
      // Get user from auth token
      const user = await getUserFromAuth(req);
      
      // Get request data
      const { base64Audio, audioFormat, generateAiResponse } = req.body;
      if (!base64Audio) {
        return res.status(400).send({ error: 'Audio data is required' });
      }
      
      // Verify credits for audio operation
      const remainingCredits = await verifyCredits(user.uid, 'audio');
      
      // FIXED: Get the Vertex AI client first
      const vertexAI = await getVertexClient();
      
      // Process the audio
      const result = await vertexAI.processAudio(
        base64Audio, 
        audioFormat || 'mp3', 
        generateAiResponse || false
      );
      
      // Return the response
      return res.status(200).send({ 
        ...result, 
        credits: remainingCredits 
      });
    } catch (error) {
      console.error('Error in processAudio:', error);
      return res.status(error.message.includes('Unauthorized') ? 401 : 500).send({ 
        error: error.message 
      });
    }
        });
      });
      
/**
 * Get user's credit balance
 */
exports.getUserCredits = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      // Only allow GET requests
      if (req.method !== 'GET') {
        return res.status(405).send({ error: 'Method not allowed' });
      }
      
      // Get user from auth token
      const user = await getUserFromAuth(req);
      
      // Get the user's document from Firestore
      const userRef = admin.firestore().collection('users').doc(user.uid);
      const userDoc = await userRef.get();
      
      // If user document doesn't exist, create it with default credits
      if (!userDoc.exists) {
        await userRef.set({ credits: DEFAULT_CREDITS });
        return res.status(200).send({ credits: DEFAULT_CREDITS });
      }
      
      // Return current credits
      const userData = userDoc.data();
      return res.status(200).send({ credits: userData.credits || 0 });
    } catch (error) {
      console.error('Error in getUserCredits:', error);
      return res.status(error.message.includes('Unauthorized') ? 401 : 500).send({ 
        error: error.message 
      });
    }
  });
  });

/**
 * Add credits to user account (for admins or payment processing)
 */
exports.addCredits = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      // Only allow POST requests
      if (req.method !== 'POST') {
        return res.status(405).send({ error: 'Method not allowed' });
      }
      
      // Get admin user from auth token
      const admin_user = await getUserFromAuth(req);
      
      // Check if user is an admin (this would require an admin flag in the user document)
      const adminRef = admin.firestore().collection('users').doc(admin_user.uid);
      const adminDoc = await adminRef.get();
      
      if (!adminDoc.exists || !adminDoc.data().isAdmin) {
        return res.status(403).send({ error: 'Unauthorized: Admin privileges required' });
      }
      
      // Get request data
      const { userId, credits, reason } = req.body;
      if (!userId || !credits || credits <= 0) {
        return res.status(400).send({ error: 'User ID and positive credit amount are required' });
      }
      
      // Get the target user's document
      const userRef = admin.firestore().collection('users').doc(userId);
      const userDoc = await userRef.get();
      
      // Calculate new credits
      let newCredits = credits;
      if (userDoc.exists) {
        const userData = userDoc.data();
        newCredits = (userData.credits || 0) + credits;
      }
      
      // Update or create the user document
      await userRef.set({ credits: newCredits }, { merge: true });
      
      // Log the transaction
      await admin.firestore().collection('creditTransactions').add({
        userId,
        operationType: 'credit_add',
        creditsAdded: credits,
        newTotal: newCredits,
        adminId: admin_user.uid,
        reason: reason || 'Manual credit adjustment',
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
      
      return res.status(200).send({ 
        success: true, 
        userId, 
        creditsAdded: credits, 
        newTotal: newCredits 
      });
    } catch (error) {
      console.error('Error in addCredits:', error);
      return res.status(error.message.includes('Unauthorized') ? 401 : 500).send({ 
        error: error.message 
      });
    }
  });
});

// Credit purchase function for users
exports.purchaseCredits = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to purchase credits.'
    );
  }

  const uid = context.auth.uid;
  
  try {
    // Validate request data
    if (!data.amount || typeof data.amount !== 'number' || data.amount <= 0) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Please provide a valid credit amount.'
      );
    }

    // In a production app, you would integrate with a payment processor here
    // This is a simplified version for demo purposes
    
    // Get current user data
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'User not found.'
      );
    }
    
    const userData = userDoc.data();
    const currentCredits = userData.credits || 0;
    const newTotal = currentCredits + data.amount;
    
    // Update user's credits in Firestore
    await admin.firestore().collection('users').doc(uid).update({
      credits: newTotal,
      lastCreditPurchase: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Log the purchase for analytics purposes
    await admin.firestore().collection('creditPurchases').add({
      userId: uid,
      amount: data.amount,
      paymentMethod: data.paymentMethod || 'demo',
      package: data.package || 'custom',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Return the updated credit information
      return { 
        success: true,
      newTotal: newTotal,
      message: `Successfully added ${data.amount} credits to your account.`
    };
    
  } catch (error) {
    console.error('Error in purchaseCredits:', error);
    
    throw new functions.https.HttpsError(
      'internal',
      'Failed to process credit purchase. Please try again.'
    );
  }
});

// Add a debug endpoint to test CORS and return information about the request
exports.debug = functions.https.onRequest((req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', 'https://www.ai-fundamentals.me');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.set('Access-Control-Allow-Credentials', 'true');
  res.set('Access-Control-Max-Age', '3600');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  // Return information about the request for debugging
  const responseData = {
    status: 'ok',
    message: 'Debug endpoint is working properly',
    request: {
      method: req.method,
      path: req.path,
      query: req.query,
      headers: req.headers,
      origin: req.headers.origin || 'No origin header',
      referer: req.headers.referer || 'No referer header'
    },
    environment: {
      region: process.env.FUNCTION_REGION || 'unknown',
      projectId: process.env.GCLOUD_PROJECT || 'unknown',
      functionName: process.env.FUNCTION_NAME || 'unknown',
      timestamp: new Date().toISOString()
    }
  };
  
  return res.status(200).json(responseData);
});

/**
 * HTTP versions of key functions for direct access
 */

// HTTP version of initializeGameSession
exports.initGameHttp = functions.https.onRequest((req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', 'https://www.ai-fundamentals.me');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.set('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  return cors(req, res, async () => {
    try {
      // Extract parameters
      const { topicId, difficulty, model = MODEL_NAME, options = {} } = req.body;
      
      if (!topicId) {
        return res.status(400).json({
          error: 'Topic ID is required',
          success: false
        });
      }
      
      // Generate a unique session ID
      const sessionId = admin.firestore().collection('gameSessions').doc().id;
      
      // Create a prompt for the AI based on the topic and difficulty
      const prompt = `You are an AI guide for learning about ${topicId} at a ${difficulty || 'beginner'} level. 
      Create an introduction to this topic that engages the learner. 
      Ask what specific aspects of ${topicId} they would like to learn about.
      Keep your response informative, friendly, and under 150 words.`;
      
      // Generate content using Vertex AI
      let introText = '';
      try {
        // Get or initialize the Vertex client
        const client = await getVertexClient();
        
        // Use our vertexClient wrapper
        const result = await client.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });
        
        if (result?.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
          introText = result.response.candidates[0].content.parts[0].text;
        } else {
          throw new Error('Invalid response structure from vertexClient');
        }
      } catch (aiError) {
        console.error('Error generating AI introduction:', aiError);
        introText = `Welcome to your learning session about ${topicId}! I'll be your AI guide for exploring its concepts. What specific aspects would you like to learn about?`;
      }
      
      // Create conversation history
      const conversationHistory = [{
        role: 'assistant',
        content: introText
      }];
      
      // Return success response
      return res.status(200).json({
        sessionId: sessionId,
        initialPrompt: introText,
        conversationHistory: conversationHistory,
        success: true
      });
    } catch (error) {
      console.error('Error initializing game session:', error);
      return res.status(500).json({
        error: error.message || 'Error initializing game session',
        success: false
      });
    }
  });
});

// HTTP version of sendGameMessage
exports.sendMessageHttp = functions.https.onRequest((req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', 'https://www.ai-fundamentals.me');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.set('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  return cors(req, res, async () => {
    try {
      // Extract parameters
      const { sessionId, message, topicId, difficulty, model = MODEL_NAME, options = {} } = req.body;
      
      if (!message) {
        return res.status(400).json({
          error: 'Message is required',
          success: false
        });
      }
      
      // Create a system context for the AI
      const topic = topicId || 'the selected topic';
      const systemPrompt = `You are an AI guide helping someone learn about ${topic} at a ${difficulty || 'intermediate'} level.
      Give helpful, accurate responses that educate the learner.
      Keep your answers informative but concise (under 150 words unless specifics are requested).
      If you don't know something, say so rather than making up information.`;
      
      // Format the conversation for Vertex AI - combine system prompt and user message
      const combinedPrompt = `${systemPrompt}\n\nUser question: ${message}`;
      
      // Generate content using Vertex AI
      let aiResponse = '';
      try {
        // Get or initialize the Vertex client
        const client = await getVertexClient();
        
        // Use the vertexClient wrapper
        const result = await client.generateContent({
          contents: [{ role: 'user', parts: [{ text: combinedPrompt }] }]
        });
        
        if (result?.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
          aiResponse = result.response.candidates[0].content.parts[0].text;
        } else {
          throw new Error('Invalid response structure from vertexClient');
        }
      } catch (aiError) {
        console.error('Error generating AI response:', aiError);
        aiResponse = `Thank you for your message about "${message}". I'm having trouble generating a specific response at the moment. Could you try rephrasing your question or asking about a different aspect of this topic?`;
      }
      
      // Return success response
      return res.status(200).json({
        aiResponse: aiResponse,
        success: true
      });
    } catch (error) {
      console.error('Error sending game message:', error);
      return res.status(500).json({
        error: error.message || 'Error sending game message',
        success: false
      });
    }
  });
});

// Add a simple test endpoint for Vertex AI troubleshooting
exports.testVertexAI = functions.https.onRequest((req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  return cors(req, res, async () => {
    try {
      // Build a simple health response
      const healthResponse = {
        status: 'ok',
        config: {
          projectId: PROJECT_ID,
          location: LOCATION,
          model: MODEL_NAME
        },
        apiVersion: "@google-cloud/aiplatform version for PredictionServiceClient",
        timestamp: new Date().toISOString()
      };
      
      // Try to get and use the Vertex client
      try {
        const client = await getVertexClient();
        
        // Use a minimal prompt
        const simplePrompt = "Hello, can you respond with just the words 'Vertex AI test successful'?";
        
        // Try with minimal configuration
        const result = await client.generateContent({
          contents: [{ role: 'user', parts: [{ text: simplePrompt }] }]
        });
        
        // Extract the response text
        let responseText = '';
        if (result?.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
          responseText = result.response.candidates[0].content.parts[0].text;
        }
        
        healthResponse.aiTest = {
      success: true,
          response: responseText
        };
      } catch (aiError) {
        console.error('Error during Vertex AI test call:', aiError);
        
        healthResponse.aiTest = {
          success: false,
          error: aiError.message
        };
      }
      
      // Return the health response
      return res.status(200).json(healthResponse);
  } catch (error) {
      console.error('Error in testVertexAI function:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });
});

// Game Plan generation function using Grok API
exports.generateGamePlan = functions.https.onCall(async (data, context) => {
  console.log('generateGamePlan called with:', data);
  
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }
  
  const userId = context.auth.uid;
  const db = admin.firestore();
  
  try {
    // Get the user's document from Firestore
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    // If user document doesn't exist, create it with default credits
    if (!userDoc.exists) {
      console.log(`Creating new user document for ${userId} with default credits`);
      await userRef.set({
        credits: DEFAULT_CREDITS,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Re-fetch the user document
      const newUserDoc = await userRef.get();
      var userData = newUserDoc.data();
    } else {
      var userData = userDoc.data();
    }
    
    // Verify user has enough credits
    if (userData.credits < 1) {
      throw new functions.https.HttpsError('resource-exhausted', 'Not enough credits');
    }
    
    // Check if this is an answer to a previous AI question
    if (data.aiQuestion && data.aiAnswer) {
      console.log('Processing answer to AI question:', data.aiQuestion);
      console.log('User provided answer:', data.aiAnswer);
      
      // Special prompt for when AI asked a question and user provided an answer
      userPrompt = `You previously asked the following clarifying question about revising a game plan:
"${data.aiQuestion}"

The user has provided this answer:
"${data.aiAnswer}"

Based on this answer, please revise the original game plan:
${data.previousPlan}

Following the original revision request:
"${data.revisionRequest}"

Your response MUST be a single, valid JSON object with the same structure as the original plan, containing ONLY the following fields:
{
  "project_summary": "A concise (1-2 sentence) summary interpreting the user's goal.",
  "key_milestones": [...],
  "suggested_steps": [...],
  "recommended_technologies": [...],
  "learning_resources": [...],
  "potential_roadblocks": [...],
  "success_metrics": [...],
  "mermaid_diagram": "A Mermaid code block visualizing the high-level architecture or process flow.",
  "next_steps_prompt": "A brief suggestion encouraging the user on how to start or refine the plan."
}`;

      // System message focused on using the user's answer
      systemMessage = "You are an expert AI implementation consultant specializing in revising implementation plans based on user feedback. Incorporate the user's answer to your clarifying question to improve the plan. Focus on recommending existing tools and platforms that minimize development work. Always maintain the exact JSON structure specified.";
    }
    // Check if this is a revision request
    else if (data.previousPlan && data.revisionRequest) {
      console.log('Processing revision request:', data.revisionRequest);
      
      // Determine if the AI needs to ask a clarifying question
      const needsClarification = shouldAskClarifyingQuestion(data.revisionRequest);
      
      if (needsClarification) {
        // Generate a clarifying question instead of a revised plan
        const clarifyingPrompt = `You are helping a user refine this AI implementation game plan:
${data.previousPlan}

The user has requested this revision:
"${data.revisionRequest}"

Based on this request, you need more information before you can provide the best possible revised plan.
Formulate ONE specific, clear question that would help you better understand what the user needs.
Ask only the most important question that would help you refine the plan effectively.

Your response must be a valid JSON object with a single field "ai_question" containing your question.
Example: {"ai_question": "Could you specify which aspect of cloud deployment you'd like more details on?"}`;

        const clarifyingSystemMsg = "You are an expert AI implementation consultant who knows when to ask clarifying questions. Ask only one specific question that would help you refine the plan. Focus on gathering information about technologies, scope, audience, or technical requirements that would significantly impact your recommendations.";
        
        // Call Grok to generate a clarifying question
        const { text: questionText } = await generateText({
          model: xai('grok-2-1212'),
          system: clarifyingSystemMsg,
          prompt: clarifyingPrompt,
        });
        
        console.log("AI generated clarifying question:", questionText);
        
        try {
          const questionResponse = JSON.parse(questionText);
          if (questionResponse.ai_question) {
            // Don't deduct a credit for asking a question
            return { ai_question: questionResponse.ai_question };
          } else {
            // Fall through to normal revision if question format is invalid
            console.log("Question format invalid, falling back to normal revision");
          }
        } catch (err) {
          console.log("Error parsing question response, falling back to normal revision:", err);
          // Continue with normal revision process
        }
      }
      
      // Original revision prompt
      userPrompt = `Revise the following AI implementation game plan based on the user's feedback.
Original Plan: ${data.previousPlan}

User's Revision Request: "${data.revisionRequest}"

Generate a revised version of the plan that addresses the user's feedback while maintaining the comprehensive structure.

Project Details:
- Topic: ${data.topic || 'Not specified'}
- Challenge: ${data.challenge || 'Not specified'}
- Project Type: ${data.projectType || 'Not specified'}
- Description: "${data.projectDescription || 'A project in the selected category'}"

IMPORTANT GUIDANCE ON TECHNOLOGY RECOMMENDATIONS:
For technology recommendations, prioritize ready-made, all-in-one solutions that minimize implementation effort based on the project type:

- For Personal Projects: Recommend user-friendly, affordable tools with minimal setup that an individual can use without extensive technical knowledge. Focus on simple, turnkey solutions that work out of the box.

- For Small Business: Recommend robust tools with good integrations, automation capabilities, and reasonable pricing. Balance ease of use with necessary business features.

- For Enterprise Solutions: Recommend scalable, enterprise-grade platforms with comprehensive features, strong security, and integration capabilities.

In all cases, prioritize recommending existing tools and platforms that solve most of the problem directly, rather than suggesting technologies the user would need to build solutions with from scratch.

Your response MUST be a single, valid JSON object with the same structure as the original plan, containing ONLY the following fields:
{
  "project_summary": "A concise (1-2 sentence) summary interpreting the user's goal.",
  "key_milestones": [
    {"milestone": "High-level milestone 1", "description": "Brief description of what this entails."}, 
    {"milestone": "High-level milestone 2", "description": "Brief description..."} 
    // ... (Aim for 3-5 milestones total)
  ],
  "suggested_steps": [
    {"step": "Actionable step 1", "details": "More details about executing this step."}, 
    {"step": "Actionable step 2", "details": "More details..."} 
    // ... (Aim for 5-10 detailed steps total, logically ordered)
  ],
  "recommended_technologies": [
    {"name": "Tool/Platform Name 1", "reasoning": "Why this tool is suitable for the project and how it provides an all-in-one solution.", "type": "Core/Supporting/Optional"}, 
    {"name": "Tool/Platform Name 2", "reasoning": "Why it's suitable and what problem it solves directly...", "type": "Core/Supporting/Optional"} 
    // ... (Suggest 2-5 relevant tools/platforms total that minimize implementation effort)
  ],
  "learning_resources": [
    {"title": "Resource Title 1", "url": "Valid URL", "type": "Tutorial/Documentation/Course/Example", "relevance": "How this helps with the specific project/steps."}, 
    {"title": "Resource Title 2", "url": "Valid URL", "type": "Tutorial/Documentation/Course/Example", "relevance": "How it helps..."} 
    // ... (Suggest 2-5 relevant resources total)
  ],
  "potential_roadblocks": [
    {"roadblock": "Potential issue 1", "mitigation": "Suggestion on how to overcome or prepare for it."}, 
    {"roadblock": "Potential issue 2", "mitigation": "Suggestion..."} 
    // ... (Identify 1-3 likely roadblocks total)
  ],
  "success_metrics": [
    {"metric": "Measurable outcome 1", "measurement": "How to track this metric."}, 
    {"metric": "Measurable outcome 2", "measurement": "How to track..."} 
    // ... (Define 1-3 key success metrics total)
  ],
  "mermaid_diagram": "A Mermaid code block visualizing the high-level architecture or process flow described in the plan. Use graph TD for flow or sequenceDiagram where appropriate.",
  "next_steps_prompt": "A brief suggestion encouraging the user on how to start or refine the plan (e.g., 'Focus on Milestone 1 and explore the suggested resources.')."
}`;
    } else {
      // Original prompt for a new plan generation (existing code)
      userPrompt = `Analyze the following project request and generate a comprehensive, actionable implementation game plan.
Project Details:
- Topic: ${data.topic || 'Not specified'}
- Challenge: ${data.challenge || 'Not specified'}
- Project Type: ${data.projectType || 'Not specified'}
- Description: "${data.projectDescription || 'A project in the selected category'}"

Assume standard best practices and make reasonable assumptions where details are missing to provide a valuable starting point.

IMPORTANT GUIDANCE ON TECHNOLOGY RECOMMENDATIONS:
For technology recommendations, prioritize ready-made, all-in-one solutions that minimize implementation effort based on the project type:

- For Personal Projects: Recommend user-friendly, affordable tools with minimal setup that an individual can use without extensive technical knowledge. Focus on simple, turnkey solutions that work out of the box.

- For Small Business: Recommend robust tools with good integrations, automation capabilities, and reasonable pricing. Balance ease of use with necessary business features.

- For Enterprise Solutions: Recommend scalable, enterprise-grade platforms with comprehensive features, strong security, and integration capabilities.

In all cases, prioritize recommending existing tools and platforms that solve most of the problem directly, rather than suggesting technologies the user would need to build solutions with from scratch.

Your response MUST be a single, valid JSON object containing ONLY the following fields:
{
  "project_summary": "A concise (1-2 sentence) summary interpreting the user's goal.",
  "key_milestones": [
    {"milestone": "High-level milestone 1", "description": "Brief description of what this entails."}, 
    {"milestone": "High-level milestone 2", "description": "Brief description..."} 
    // ... (Aim for 3-5 milestones total)
  ],
  "suggested_steps": [
    {"step": "Actionable step 1", "details": "More details about executing this step."}, 
    {"step": "Actionable step 2", "details": "More details..."} 
    // ... (Aim for 5-10 detailed steps total, logically ordered)
  ],
  "recommended_technologies": [
    {"name": "Tool/Platform Name 1", "reasoning": "Why this tool is suitable for the project and how it provides an all-in-one solution.", "type": "Core/Supporting/Optional"}, 
    {"name": "Tool/Platform Name 2", "reasoning": "Why it's suitable and what problem it solves directly...", "type": "Core/Supporting/Optional"} 
    // ... (Suggest 2-5 relevant tools/platforms total that minimize implementation effort)
  ],
  "learning_resources": [
    {"title": "Resource Title 1", "url": "Valid URL", "type": "Tutorial/Documentation/Course/Example", "relevance": "How this helps with the specific project/steps."}, 
    {"title": "Resource Title 2", "url": "Valid URL", "type": "Tutorial/Documentation/Course/Example", "relevance": "How it helps..."} 
    // ... (Suggest 2-5 relevant resources total)
  ],
  "potential_roadblocks": [
    {"roadblock": "Potential issue 1", "mitigation": "Suggestion on how to overcome or prepare for it."}, 
    {"roadblock": "Potential issue 2", "mitigation": "Suggestion..."} 
    // ... (Identify 1-3 likely roadblocks total)
  ],
  "success_metrics": [
    {"metric": "Measurable outcome 1", "measurement": "How to track this metric."}, 
    {"metric": "Measurable outcome 2", "measurement": "How to track..."} 
    // ... (Define 1-3 key success metrics total)
  ],
  "mermaid_diagram": "A Mermaid code block visualizing the high-level architecture or process flow described in the plan. Use graph TD for flow or sequenceDiagram where appropriate.",
  "next_steps_prompt": "A brief suggestion encouraging the user on how to start or refine the plan (e.g., 'Focus on Milestone 1 and explore the suggested resources.')."
}`;
    }
  
    // Refined system message to emphasize ready-made solutions
    if (!systemMessage) { // only set if not already set for AI questions
      systemMessage = "You are an expert AI implementation consultant. Your goal is to craft actionable implementation game plans for technology projects that help users understand how to implement solutions quickly and effectively. Focus on recommending existing tools and platforms that minimize development work. Prioritize ready-made, all-in-one solutions over technologies that require extensive custom building. Always maintain the exact JSON structure specified.";
    }
    
    console.log(`Generating game plan for topic: ${data.topic}, challenge: ${data.challenge}, type: ${data.projectType}`);
    if (data.revisionRequest) {
      console.log('This is a revision request with feedback:', data.revisionRequest);
    }
    
    // Call Grok using Vercel AI SDK
    const { text } = await generateText({
      model: xai('grok-2-1212'), // Using the correct model
      system: systemMessage,
      prompt: userPrompt,
      // SDK should automatically pick up XAI_API_KEY environment variable
    });
    
    console.log("Raw response from AI SDK:", text);
    
    // Attempt to parse the JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(text);
      
      // Basic validation of parsed structure
      if (!parsedResponse || typeof parsedResponse !== 'object') {
           throw new Error('Parsed response is not a valid object.');
      }
      
    } catch (parseError) {
      console.error('Error parsing AI response JSON:', parseError, "Raw text was:", text);
      throw new functions.https.HttpsError(
        'internal',
        'The AI response was not in the expected JSON format. Please try again.' + (parseError.message ? ` (${parseError.message})` : '')
      );
    }
    
    // Deduct one credit from the user - only if we're not asking a clarifying question
    if (!parsedResponse.ai_question) {
      await db.collection('users').doc(userId).update({
        credits: admin.firestore.FieldValue.increment(-1)
      });
    }
    
    // Also save this game plan to the user's history if it's a new plan (not a revision)
    if (!data.previousPlan && !data.revisionRequest && !data.aiQuestion) {
      try {
        // Generate a title from the project summary or topic/challenge
        let planTitle = 'Game Plan';
        if (parsedResponse.project_summary) {
          const words = parsedResponse.project_summary.split(' ').slice(0, 6).join(' ');
          planTitle = `${words}${words.endsWith('.') ? '' : '...'}`;
        } else if (data.topic && data.challenge) {
          planTitle = `${data.topic}: ${data.challenge}`;
        } else if (data.topic) {
          planTitle = data.topic;
        }
        
        // Save to Firestore
        await db.collection('users').doc(userId).collection('gamePlans').add({
          title: planTitle,
          topic: data.topic || '',
          challenge: data.challenge || '',
          projectType: data.projectType || '',
          description: data.projectDescription || '',
          plan: parsedResponse,
          revisionHistory: [],
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('Automatically saved new game plan to user history');
      } catch (saveError) {
        console.error('Error auto-saving game plan:', saveError);
        // Don't fail the function if auto-save fails
      }
    }
    
    // Return the full parsed object from the AI
    return parsedResponse;
  } catch (error) {
    console.error('Error in generateGamePlan function:', error);
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'An unknown error occurred while generating the game plan.'
    );
  }
});

// Helper function to determine if we should ask a clarifying question
function shouldAskClarifyingQuestion(revisionRequest) {
  // Simple heuristic: if the revision request contains a question or seems vague
  const questionMarks = (revisionRequest.match(/\?/g) || []).length;
  const vaguePhrases = [
    'more details', 'tell me more', 'elaborate', 'explain', 'clarify', 
    'what about', 'how would', 'can you provide', 'more information',
    'additional', 'not clear', 'confused', 'don\'t understand'
  ];
  
  // Check if the revision request has question marks or contains vague phrases
  const hasQuestionMarks = questionMarks > 0;
  const hasVaguePhrases = vaguePhrases.some(phrase => 
    revisionRequest.toLowerCase().includes(phrase.toLowerCase())
  );
  
  // If the revision is short and contains a question or vague phrase, ask for clarification
  const isShort = revisionRequest.length < 100;
  
  // Randomize a bit so we don't always ask questions for similar requests
  const randomFactor = Math.random() < 0.7; // 70% chance to ask a question if other conditions met
  
  return randomFactor && isShort && (hasQuestionMarks || hasVaguePhrases);
}
