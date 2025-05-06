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
const { v4: uuidv4 } = require('uuid'); // Import UUID library
// Replace SendGrid with Twilio
const twilio = require('twilio');
// Add Nodemailer for email
const nodemailer = require('nodemailer');

// Initialize Twilio client with credentials
let twilioClient = null;
try {
  if (functions.config().twilio && functions.config().twilio.sid && functions.config().twilio.token) {
    twilioClient = twilio(functions.config().twilio.sid, functions.config().twilio.token);
    console.log('Twilio client initialized');
  } else if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    console.log('Twilio client initialized from environment variables');
  } else {
    console.warn('Twilio credentials not found. SMS functionality will be limited.');
  }
} catch (error) {
  console.error('Error initializing Twilio client:', error);
}

// Initialize email transporter with Gmail
let emailTransporter = null;
try {
  if (functions.config().gmail && functions.config().gmail.email && functions.config().gmail.password) {
    emailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: functions.config().gmail.email,
        pass: functions.config().gmail.password
      }
    });
    console.log('Gmail transporter initialized');
  } else if (process.env.GMAIL_EMAIL && process.env.GMAIL_PASSWORD) {
    emailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_PASSWORD
      }
    });
    console.log('Gmail transporter initialized from environment variables');
  } else {
    console.warn('Gmail credentials not found. Email functionality will be limited.');
  }
} catch (error) {
  console.error('Error initializing email transporter:', error);
}

// Import Vercel AI SDK components
const { xai } = require("@ai-sdk/xai");
const { generateText } = require("ai");

// Initialize Firebase Admin SDK
admin.initializeApp();

// Reference to Firestore database
const db = admin.firestore();

// Firestore collection names
const SESSIONS_COLLECTION = 'gamePlanSessions';
const HISTORY_COLLECTION = 'history';
const USERS_COLLECTION = 'users';
const PLANS_COLLECTION = 'gamePlans'; // Keep existing collection for saved final plans
const CREDIT_TRANSACTIONS_COLLECTION = 'creditTransactions';
const CREDIT_PURCHASES_COLLECTION = 'creditPurchases';
const API_USAGE_COLLECTION = 'apiUsage';
const CHATS_COLLECTION = 'chats'; // For general chat history?

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

// --- Game Plan Generation Helpers ---

/**
 * Gets conversation history for a game plan session.
 */
async function getGamePlanConversationHistory(sessionId) {
  if (!sessionId) return [];
  try {
    const historySnapshot = await db.collection(SESSIONS_COLLECTION).doc(sessionId)
      .collection(HISTORY_COLLECTION)
      .orderBy('timestamp', 'asc')
      .limit(20) // Limit history length
      .get();
    return historySnapshot.docs.map(doc => doc.data().turnData || {}); // Extract turnData
  } catch (error) {
    console.error(`Error fetching history for session ${sessionId}:`, error);
    return [];
  }
}

/**
 * Stores a turn in the game plan conversation history.
 */
async function storeGamePlanConversationHistory(sessionId, userId, turnData) {
  if (!sessionId || !userId || !turnData) return;
  try {
    await db.collection(SESSIONS_COLLECTION).doc(sessionId)
      .collection(HISTORY_COLLECTION)
      .add({ timestamp: admin.firestore.FieldValue.serverTimestamp(), turnData });

    await db.collection(SESSIONS_COLLECTION).doc(sessionId).set({ 
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      userId: userId
    }, { merge: true });
    console.log(`Stored history turn type '${turnData.type}' for session ${sessionId}`);
  } catch (error) {
    console.error(`Error storing history for session ${sessionId}:`, error);
  }
}

/**
 * Checks if the initial game plan request needs clarification.
 */
function gamePlanNeedsClarification(topic, challenge, projectType, projectDescription) {
    const basicChallenges = ['Understanding AI Concepts', 'AI Fundamentals'];
    if (!basicChallenges.includes(challenge) && (!projectDescription || projectDescription.trim().length < 30)) {
        console.log("Clarification needed: Description too short/missing for non-basic challenge.");
        return true;
    }
    const vaguePhrases = ['help me', 'i need', 'not sure', 'don\'t know', 'general idea', 'how to start', 'how do i'];
    if (projectDescription && vaguePhrases.some(phrase => projectDescription.toLowerCase().includes(phrase))) {
        console.log("Clarification needed: Vague phrase detected.");
        return true;
    }
    console.log("Clarification not needed based on initial checks.");
    return false;
}

/**
 * Generates clarifying questions for the game plan request.
 */
function generateGamePlanClarifyingQuestions(topic, challenge, projectType, projectDescription) {
    const questions = [];
    if (!projectDescription || projectDescription.trim().length < 30) {
        questions.push('Could you describe your project goal and expected outcome in more detail?');
    }
    if (challenge === 'Content Calendar Automation' && !projectDescription?.toLowerCase().includes('platform')) {
        questions.push('Which specific social media platforms do you want to automate for?');
    }
    if (projectType === 'Enterprise Solution' && !projectDescription?.toLowerCase().includes('team')) {
        questions.push('Roughly how many people will be using or benefiting from this solution?');
    }
    if (projectType === 'Personal Project' && !projectDescription?.toLowerCase().includes('budget')) {
        questions.push('Are there any budget limitations for tools or services we should keep in mind?');
    }
    if (topic === 'Introduction to AI' && !projectDescription?.toLowerCase().includes('experience')) {
         questions.push('What\'s your current comfort level with AI tools and technical concepts (e.g., beginner, some experience, comfortable)?');
    }
    if (questions.length < 2) {
        questions.push('What is the single most important problem you are trying to solve with this plan?');
    }
    console.log("Generated clarification questions:", questions);
    return questions.slice(0, 3); // Max 3 questions
}

/**
 * Creates the system prompt for the AI model based on interaction type.
 */
function createGamePlanSystemPrompt(messageType) {
    if (messageType === 'follow_up') {
        return `You are an AI assistant helping a user refine an existing game plan. Use the provided conversation context and the user's latest question.\nProvide a concise, helpful answer addressing their question directly.\nIf suggesting changes to the plan, clearly state which section(s) should be modified.\nRespond ONLY with a valid JSON object containing an "answer" field: {"answer": "Your helpful response here..."}`;
    }
    return `You are an expert AI implementation consultant. Generate a comprehensive, actionable game plan based on the user's request and the conversation history provided.\nPrioritize ready-made, all-in-one solutions or low-code tools over custom development where appropriate for the project type.\nEnsure the Mermaid diagram visualizes the final system/tool topology, not implementation steps.\nRespond ONLY with a valid JSON object containing the full game plan structure specified in the user prompt. Do not add any text before or after the JSON object.`;
}

/**
 * Creates the user prompt for the AI model, including context and instructions.
 */
function createGamePlanUserPrompt(messageType, initialRequestData, conversationHistory, userResponse) {
    let promptContext = "Conversation Context:\n";
    let lastPlanSummary = "No previous plan generated in this session.";

    conversationHistory.forEach(turn => {
        try {
            if (turn?.type === 'initial_request' && turn?.request) {
                promptContext += `--- Initial Request ---\nTopic: ${turn.request.topic || 'N/A'}, Challenge: ${turn.request.challenge || 'N/A'}, Type: ${turn.request.projectType || 'N/A'}\nDescription: ${turn.request.projectDescription || 'N/A'}\n---\n`;
            } else if (turn?.type === 'clarification_request' && turn?.questions) {
                promptContext += `AI Question(s): ${turn.questions.join('; ')}\n`;
            } else if (turn?.type === 'clarification_response' && turn?.response) {
                promptContext += `User Answer: ${turn.response}\n`;
            } else if (turn?.type === 'follow_up_request' && turn?.question) {
                promptContext += `User Follow-up: ${turn.question}\n`;
            } else if (turn?.type === 'plan_generated' && turn?.plan?.project_summary) {
                lastPlanSummary = turn.plan.project_summary;
                promptContext += `--- Previously Generated Plan Summary ---\n${lastPlanSummary}\n---\n`;
            } else if (turn?.type === 'follow_up_response' && turn?.answer) {
                 promptContext += `AI Answer to Follow-up: ${turn.answer}\n`;
            }
        } catch (contextError) {
            console.error("Error processing history turn for prompt:", contextError, "Turn:", turn);
        }
    });

    let currentTaskDesc = "";
    let jsonStructureNote = `Respond ONLY with a valid JSON object matching this structure (do not add text before or after). \n**IMPORTANT**: Ensure ALL fields are populated, including nested fields within arrays. Provide meaningful content.\n{\n  \"project_summary\": \"A concise summary...\",\n  \"key_milestones\": [{\"milestone\": \"Example Milestone Title\", \"description\": \"Detailed description of this milestone...\"} /* , ... more objects */ ],\n  \"suggested_steps\": [{\"step\": \"Example Actionable Step\", \"details\": \"Details on how to perform this step...\"} /* , ... more objects */ ],\n  \"recommended_technologies\": [{\"name\": \"Example Tool/Platform Name\", \"reasoning\": \"Why this specific tool is recommended for this plan...\", \"type\": \"Core or Supporting or Optional\"} /* , ... more objects */ ],\n  \"learning_resources\": [{\"title\": \"Example Resource Title\", \"url\": \"https://example.com/resource\", \"type\": \"Tutorial/Documentation/Course/etc.\", \"relevance\": \"How this resource helps achieve specific steps/milestones...\"} /* , ... more objects */ ],\n  \"potential_roadblocks\": [{\"roadblock\": \"Example Potential Issue\", \"mitigation\": \"Specific strategy to overcome or prepare for this issue...\"} /* , ... more objects */ ],\n  \"success_metrics\": [{\"metric\": \"Example Measurable Outcome\", \"measurement\": \"How to specifically track and measure this metric...\"} /* , ... more objects */ ],\n  \"mermaid_diagram\": \"graph TD\\nA[Start] --> B[End]\",\n  \"next_steps_prompt\": \"A brief prompt suggesting next actions...\"\n}`;

    if (messageType === 'initial_request') {
        currentTaskDesc = "Generate the full implementation game plan based on the Initial Request provided in the context.";
    } else if (messageType === 'clarification_response') {
        currentTaskDesc = `The user has responded to the clarification question(s). Use their answer ("${userResponse}") and the full context to generate the complete implementation game plan.`;
    } else if (messageType === 'follow_up') {
        currentTaskDesc = `Address the user\'s latest follow-up question ("${userResponse}") based on the conversation history and the previously generated plan (summary provided in context). Provide a concise answer.`;
        // Follow-up structure remains simple
        jsonStructureNote = `Respond ONLY with a valid JSON object containing an \"answer\" field: {\n  \"answer\": \"Your concise and helpful answer here...\"\n}`;
    }

    // Use single quotes inside the template literal for Mermaid examples
    const mermaidInstructions = `MERMAID DIAGRAM INSTRUCTIONS (Include only if generating the full plan):\nCreate a **topology diagram** visualizing the high-level **tool and process landscape**... (Use 'graph TD' or 'graph LR'). Represent functions if tools aren\'t selected (e.g., 'Email_Marketing[Function: Email Marketing<br>(e.g., Mailchimp)]'). Keep it simple (5-10 elements). DO NOT visualize implementation steps.`;

    const finalMermaidInstructions = (messageType === 'initial_request' || messageType === 'clarification_response') ? mermaidInstructions : "";

    return `${promptContext}\n--- Current Task ---\n${currentTaskDesc}\n\n${finalMermaidInstructions}\n\n--- Required Output Format ---\n${jsonStructureNote}`;
}

// --- End Game Plan Generation Helpers ---

// Game Plan generation function using Grok API
exports.generateGamePlan = functions.https.onCall(async (data, context) => {
  console.log('generateGamePlan v3 received data:', JSON.stringify(data));

  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
  }
  const userId = context.auth.uid;

  const {
    topic, challenge, projectType, projectDescription, // From initial form
    sessionId: existingSessionId,                      // From subsequent calls
    messageType = 'initial_request',                   // Type of call ('initial_request', 'clarification_response', 'follow_up')
    userResponse                                       // User's reply
  } = data;

  // --- Session Management ---
  const sessionId = existingSessionId || uuidv4(); // Use existing or create new
  console.log(`Processing ${messageType} for session: ${sessionId}`);

  let initialRequestData = {}; // To store initial request data for context

  try {
    // --- Credit Check ---
    const userRef = db.collection(USERS_COLLECTION).doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) throw new functions.https.HttpsError('not-found', 'User data not found.');

    const userData = userDoc.data();
    const isChargeable = (messageType === 'initial_request' || messageType === 'clarification_response');
    if (isChargeable && (userData.credits || 0) < GAME_SESSION_COST) {
      throw new functions.https.HttpsError('resource-exhausted', `Not enough credits. Need ${GAME_SESSION_COST}, have ${userData.credits || 0}.`);
    }

    // --- Load History & Handle Initial Request/Clarification ---
    const conversationHistory = await getGamePlanConversationHistory(sessionId); // Use specific helper

    if (messageType === 'initial_request') {
      console.log(`Handling initial request for session ${sessionId}...`);
      initialRequestData = { topic, challenge, projectType, projectDescription }; // Store for prompt context
      await storeGamePlanConversationHistory(sessionId, userId, { type: 'initial_request', request: initialRequestData });

      if (gamePlanNeedsClarification(topic, challenge, projectType, projectDescription)) {
        const questions = generateGamePlanClarifyingQuestions(topic, challenge, projectType, projectDescription);
        await storeGamePlanConversationHistory(sessionId, userId, { type: 'clarification_request', questions: questions });
        console.log(`Clarification needed for session ${sessionId}. Returning questions.`);
        return { type: 'clarification_needed', questions: questions, sessionId: sessionId };
      }
       console.log(`No clarification needed for session ${sessionId}. Proceeding to generate plan.`);
    } else {
      // For follow-ups/clarifications, find the initial request in history
      const initialTurn = conversationHistory.find(turn => turn.type === 'initial_request');
      if (initialTurn?.request) {
        initialRequestData = initialTurn.request;
      } else {
        console.warn(`Could not find initial request in history for session ${sessionId}. Using current data if available.`);
        initialRequestData = { topic, challenge, projectType, projectDescription }; // Fallback
      }
    }

    // --- Store User Response (if applicable) ---
    if (messageType === 'clarification_response') {
      await storeGamePlanConversationHistory(sessionId, userId, { type: 'clarification_response', response: userResponse });
    } else if (messageType === 'follow_up') {
      await storeGamePlanConversationHistory(sessionId, userId, { type: 'follow_up_request', question: userResponse });
    }

    // --- Prepare Prompt for AI ---
    const systemPrompt = createGamePlanSystemPrompt(messageType);
    // Reload history *after* potentially storing the latest user response
    const currentHistory = await getGamePlanConversationHistory(sessionId);
    const userPrompt = createGamePlanUserPrompt(messageType, initialRequestData, currentHistory, userResponse);

    console.log(`--- Sending to AI (Session: ${sessionId}) ---`);
    // console.log("System Prompt:", systemPrompt); // Uncomment for debugging
    // console.log("User Prompt:", userPrompt); // Uncomment for debugging
    console.log(`--- End AI Prompt ---`);

    // --- Call AI Model (Grok via Vercel SDK) ---
    const { text, usage, finishReason, warnings } = await generateText({
      model: xai('grok-2-1212'), // Ensure correct model ID
      system: systemPrompt,
      prompt: userPrompt,
      maxTokens: 2048, // Set reasonable max tokens
      temperature: 0.3, // Slightly lower temperature for more structured plans
    });
    console.log("Raw response from AI SDK:", { usage, finishReason, warnings }); // Don't log full text by default

    // --- Process AI Response ---
    let processedText = text.trim();
    // Basic extraction if wrapped in markdown
    if (processedText.startsWith('```json')) {
      processedText = processedText.substring(7, processedText.length - 3).trim();
    } else if (processedText.startsWith('```')) {
      processedText = processedText.substring(3, processedText.length - 3).trim();
    }
    // Find JSON object within the text if necessary
    if (!processedText.startsWith('{') || !processedText.endsWith('}')) {
      const jsonMatch = processedText.match(/(\{[\s\S]*\})/);
      if (jsonMatch && jsonMatch[1]) {
        processedText = jsonMatch[1];
        console.log("Extracted JSON object from potentially messy text.");
      } else {
        console.error("Failed to extract valid JSON object from response:", processedText);
        if (messageType === 'follow_up') {
          console.warn("Returning raw text as follow-up answer due to JSON extraction failure.");
          await storeGamePlanConversationHistory(sessionId, userId, { type: 'follow_up_response', answer: processedText, error: 'json_extraction_failed' });
          // Return sessionId for client state management
          return { type: 'follow_up_answer', answer: processedText, sessionId: sessionId };
        }
        throw new Error('AI response was not in the expected JSON format.');
      }
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(processedText);
      console.log("Successfully parsed AI JSON response.");

      // --- Post-process and Validate --- //
      if (messageType === 'initial_request' || messageType === 'clarification_response') {
        // Validate full plan structure (basic checks)
        const requiredPlanFields = ['project_summary', 'key_milestones', 'suggested_steps', 'recommended_technologies', 'learning_resources', 'potential_roadblocks', 'success_metrics', 'mermaid_diagram', 'next_steps_prompt'];
        for (const field of requiredPlanFields) {
          if (parsedResponse[field] === undefined || parsedResponse[field] === null) {
            console.warn(`Generated plan JSON is missing or has null field: ${field}`);
            // Provide default values for robustness
            if (field === 'mermaid_diagram') parsedResponse[field] = 'graph TD\nA[Diagram Generation Failed]';
            else if (Array.isArray(parsedResponse[field])) parsedResponse[field] = []; // Default to empty array if expected
            else parsedResponse[field] = 'N/A'; // Default for strings
          }
        }

        // Clean Mermaid diagram code
        if (parsedResponse.mermaid_diagram && typeof parsedResponse.mermaid_diagram === 'string') {
          let diagramText = parsedResponse.mermaid_diagram.trim().replace(/^```(?:mermaid)?\s*/, '').replace(/\s*```$/, '');
          // Ensure graph type is present
          if (!diagramText.match(/^(graph|flowchart)\s+(TD|LR|TB|BT|RL)/i)) {
            diagramText = 'graph TD\n' + diagramText; // Default to TD graph
          }
          parsedResponse.mermaid_diagram = diagramText;
        } else {
          parsedResponse.mermaid_diagram = 'graph TD\nA[Diagram Not Provided]'; // Placeholder if missing or invalid
        }
      } else if (messageType === 'follow_up') {
        // Validate follow-up answer structure
        if (typeof parsedResponse.answer !== 'string') {
          console.warn("Follow-up response JSON parsed but missing 'answer' string. Using raw text.");
          parsedResponse.answer = processedText; // Fallback to raw text
        }
      }

    } catch (parseError) {
      console.error('Error parsing or validating AI response JSON:', parseError, "Processed text was:", processedText);
      throw new functions.https.HttpsError('internal', `AI response format error: ${parseError.message}`);
    }

    // --- Deduct Credits & Store Results ---
    if (isChargeable) {
      const creditRef = db.collection(USERS_COLLECTION).doc(userId);
      await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(creditRef);
        if (!doc.exists) throw new Error("User not found for credit deduction.");
        const currentCredits = doc.data().credits || 0;
        if (currentCredits < GAME_SESSION_COST) throw new Error("Credit check passed initially but failed during transaction.");
        transaction.update(creditRef, { credits: admin.firestore.FieldValue.increment(-GAME_SESSION_COST) });
      });
      console.log(`Credit deducted for ${messageType}.`);
    }

    // Store the AI's response in history
    await storeGamePlanConversationHistory(sessionId, userId, {
      type: (messageType === 'follow_up') ? 'follow_up_response' : 'plan_generated',
      [ (messageType === 'follow_up') ? 'answer' : 'plan' ]: parsedResponse // Store plan or answer object
    });

    // --- Save Final Plan Snapshot --- //
    if (messageType === 'initial_request' || messageType === 'clarification_response') {
      try {
        let planTitle = initialRequestData.topic || 'Game Plan';
        if (parsedResponse.project_summary) {
          const summaryWords = parsedResponse.project_summary.split(' ');
          planTitle = summaryWords.slice(0, 7).join(' ') + (summaryWords.length > 7 ? '...' : '');
        }
        await db.collection(USERS_COLLECTION).doc(userId).collection(PLANS_COLLECTION).doc(sessionId).set({
          title: planTitle,
          topic: initialRequestData.topic || '',
          challenge: initialRequestData.challenge || '',
          projectType: initialRequestData.projectType || '',
          description: initialRequestData.projectDescription || '',
          plan: parsedResponse,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          sessionId: sessionId
        }, { merge: true });
        console.log(`Saved/Updated final plan snapshot with ID: ${sessionId}`);
      } catch (saveError) {
        console.error('Error saving final plan snapshot:', saveError);
      }
    }

    // --- Return Response to Client --- //
    const responseType = (messageType === 'follow_up') ? 'follow_up_answer' : 'plan_generated';
    const responsePayload = (messageType === 'follow_up') ? { answer: parsedResponse.answer } : { plan: parsedResponse };

    console.log(`Returning ${responseType} for session ${sessionId}`);
    return { type: responseType, ...responsePayload, sessionId: sessionId }; // Always return sessionId

  } catch (error) {
    console.error(`Error in generateGamePlan function (Session: ${sessionId}):`, error);
    const message = (error instanceof functions.https.HttpsError) ? error.message : 'An unexpected error occurred generating the game plan.';
    const code = (error instanceof functions.https.HttpsError) ? error.code : 'internal';
    if (error instanceof functions.https.HttpsError) {
      throw error;
    } else {
      throw new functions.https.HttpsError(code, message);
    }
  }
});

// Health check function
exports.healthCheck = functions.https.onCall(async (data, context) => {
  return { status: 'ok', timestamp: Date.now() };
});

// Email game plan function (now supports both email and SMS)
exports.emailGamePlan = functions.https.onCall(async (data, context) => {
  // User must be authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to share a game plan'
    );
  }

  try {
    const { email, phone, gameplan, sessionId } = data;
    
    // Validate either email or phone is provided
    if ((!email && !phone) || !gameplan) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Email/phone and game plan data are required'
      );
    }
    
    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Invalid email format'
        );
      }
    }
    
    // Validate phone format if provided
    if (phone) {
      // Basic phone validation - improves upon this for production
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(phone)) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Invalid phone format. Please use E.164 format (e.g., +12125551234)'
        );
      }
    }
    
    // Log API usage
    await logAPIUsage(context.auth.uid, 'shareGamePlan', { 
      sessionId, 
      emailSent: !!email,
      smsSent: !!phone,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Prepare result for return
    const result = { 
      success: true,
      sessionId
    };
    
    // If email is provided, handle email with Gmail
    if (email && emailTransporter) {
      try {
        // Generate HTML email content
        const htmlContent = generateEmailHTML(gameplan);
        
        // Create text version for fallback
        const textContent = generateEmailText(gameplan);
        
        // Setup email data
        const mailOptions = {
          from: functions.config().gmail?.email || process.env.GMAIL_EMAIL || 'noreply@ai-fundamentals.me',
          to: email,
          subject: 'Your AI Fundamentals Game Plan',
          text: textContent,
          html: htmlContent
        };
        
        // Send email with Nodemailer
        const info = await emailTransporter.sendMail(mailOptions);
        
        console.log(`Email sent to ${email}, messageId: ${info.messageId}`);
        
        // Log the email in Firestore
        await admin.firestore().collection('sentMessages').add({
          userId: context.auth.uid,
          recipientEmail: email,
          sessionId: sessionId,
          messageId: info.messageId,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          type: 'email',
          success: true
        });
        
        result.emailMessage = `Game plan sent to ${email}`;
        result.emailId = info.messageId;
      } catch (emailError) {
        console.error('Nodemailer error:', emailError);
        
        // Log the failed attempt
        await admin.firestore().collection('sentMessages').add({
          userId: context.auth.uid,
          recipientEmail: email,
          sessionId: sessionId,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          type: 'email',
          success: false,
          error: emailError.message
        });
        
        result.emailError = `Failed to send email: ${emailError.message}`;
      }
    } else if (email) {
      // Email requested but no transporter
      console.log(`Would send email to: ${email}`);
      result.emailMessage = `Game plan would be sent to ${email} (Email service not configured)`;
      result.simulated = true;
    }
    
    // If phone is provided and Twilio is configured, send SMS
    if (phone && twilioClient) {
      try {
        // Generate text message content - keep it short for SMS
        const smsContent = generateSMSContent(gameplan);
        
        // Send the SMS via Twilio
        const message = await twilioClient.messages.create({
          body: smsContent,
          from: functions.config().twilio.phoneNumber || process.env.TWILIO_PHONE_NUMBER,
          to: phone
        });
        
        console.log(`SMS sent to ${phone}, SID: ${message.sid}`);
        
        // Log the SMS in Firestore
        await admin.firestore().collection('sentMessages').add({
          userId: context.auth.uid,
          recipientPhone: phone,
          sessionId: sessionId,
          messageSid: message.sid,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          type: 'sms',
          success: true
        });
        
        result.smsMessage = `Game plan SMS sent to ${phone}`;
        result.smsSid = message.sid;
      } catch (smsError) {
        console.error('Twilio SMS error:', smsError);
        
        // Log the failed attempt
        await admin.firestore().collection('sentMessages').add({
          userId: context.auth.uid,
          recipientPhone: phone,
          sessionId: sessionId,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          type: 'sms',
          success: false,
          error: smsError.message
        });
        
        result.smsError = `Failed to send SMS: ${smsError.message}`;
      }
    } else if (phone) {
      // Twilio not configured but phone provided
      console.log(`Would send SMS to: ${phone}`);
      result.smsMessage = `Game plan would be sent to ${phone} (Twilio not configured)`;
      result.simulated = true;
    }
    
    return result;
  } catch (error) {
    console.error('Error sharing game plan:', error);
    throw new functions.https.HttpsError(
      'internal',
      `Failed to share game plan: ${error.message}`
    );
  }
});

// Helper function to generate SMS content
function generateSMSContent(gameplan) {
  try {
    // Keep SMS content brief due to length limitations
    let sms = 'Your AI Implementation Game Plan\n\n';
    
    // Add project summary (shortened)
    const summary = gameplan.project_summary || gameplan.project_description || 'No summary provided';
    sms += `Summary: ${summary.substring(0, 100)}${summary.length > 100 ? '...' : ''}\n\n`;
    
    // Add key milestones (limited) 
    sms += 'Key Milestones:\n';
    if (gameplan.key_milestones && gameplan.key_milestones.length > 0) {
      gameplan.key_milestones.slice(0, 3).forEach((m, i) => {
        const milestone = m.milestone || m.title || '';
        sms += `${i+1}. ${milestone.substring(0, 50)}${milestone.length > 50 ? '...' : ''}\n`;
      });
      
      if (gameplan.key_milestones.length > 3) {
        sms += `+ ${gameplan.key_milestones.length - 3} more milestones\n`;
      }
    } else {
      sms += 'None provided\n';
    }
    
    // Add footer with link
    sms += '\nView your complete game plan at https://ai-fundamentals.me/my-game-plan.html';
    
    return sms;
  } catch (error) {
    console.error('Error generating SMS content:', error);
    return 'Your AI Implementation Game Plan is ready. View it at https://ai-fundamentals.me/my-game-plan.html';
  }
}

// Helper function to generate HTML email content
function generateEmailHTML(gameplan) {
  try {
    const getItemsHTML = (items, itemType) => {
      if (!items || !Array.isArray(items) || items.length === 0) return '<p>None provided</p>';
      
      let html = '<ul style="padding-left: 20px;">';
      
      items.forEach((item, index) => {
        if (itemType === 'milestones' || itemType === 'steps') {
          const title = item.milestone || item.step || '';
          const details = item.description || '';
          html += `<li><strong>${title}</strong>${details ? `<br>${details}` : ''}</li>`;
        } else if (itemType === 'technologies') {
          html += `<li><strong>${item.name || ''}</strong>: ${item.reasoning || ''}</li>`;
        } else if (itemType === 'resources') {
          html += `<li><a href="${item.url || '#'}" style="color: #0366d6;">${item.title || 'Resource'}</a>: ${item.relevance || ''}</li>`;
        } else if (itemType === 'roadblocks' || itemType === 'metrics') {
          html += `<li>${item.roadblock || item.metric || ''}</li>`;
        } else {
          html += `<li>${JSON.stringify(item)}</li>`;
        }
      });
      
      html += '</ul>';
      return html;
    };
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your AI Fundamentals Game Plan</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #0366d6; border-bottom: 1px solid #eaecef; padding-bottom: 10px; }
          h2 { color: #0366d6; margin-top: 30px; padding-top: 10px; }
          .box { background-color: #f6f8fa; border: 1px solid #eaecef; border-radius: 6px; padding: 16px; margin-bottom: 20px; }
          .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #eaecef; font-size: 0.8em; color: #586069; }
        </style>
      </head>
      <body>
        <h1>Your AI Implementation Game Plan</h1>
        
        <div class="box">
          <h2>Project Summary</h2>
          <p>${gameplan.project_summary || 'No summary provided'}</p>
        </div>
        
        <h2>Key Milestones</h2>
        ${getItemsHTML(gameplan.key_milestones, 'milestones')}
        
        <h2>Implementation Steps</h2>
        ${getItemsHTML(gameplan.suggested_steps, 'steps')}
        
        <h2>Recommended Technologies</h2>
        ${getItemsHTML(gameplan.recommended_technologies, 'technologies')}
        
        <h2>Learning Resources</h2>
        ${getItemsHTML(gameplan.learning_resources, 'resources')}
        
        <h2>Potential Roadblocks</h2>
        ${getItemsHTML(gameplan.potential_roadblocks, 'roadblocks')}
        
        <h2>Success Metrics</h2>
        ${getItemsHTML(gameplan.success_metrics, 'metrics')}
        
        <h2>Mermaid Diagram Code</h2>
        <pre style="background-color: #f6f8fa; padding: 16px; border-radius: 6px; overflow-x: auto;">${gameplan.mermaid_diagram || 'No diagram provided'}</pre>
        
        <div class="footer">
          <p>Generated by AI Fundamentals. Visit <a href="https://ai-fundamentals.me" style="color: #0366d6;">ai-fundamentals.me</a> to create your own implementation plans.</p>
        </div>
      </body>
      </html>
    `;
  } catch (error) {
    console.error('Error generating HTML email:', error);
    return `<html><body><h1>Your Game Plan</h1><p>There was an error formatting your game plan. Please view it on the website.</p></body></html>`;
  }
}

// Helper function to generate plain text email content
function generateEmailText(gameplan) {
  try {
    let text = 'Your AI Implementation Game Plan\n\n';
    
    // Project Summary
    text += 'PROJECT SUMMARY:\n';
    text += (gameplan.project_summary || 'None provided') + '\n\n';
    
    // Add key milestones
    text += 'KEY MILESTONES:\n';
    if (gameplan.key_milestones && gameplan.key_milestones.length > 0) {
      gameplan.key_milestones.forEach((m, i) => {
        const milestone = m.milestone || '';
        text += `${i+1}. ${milestone}\n`;
      });
    } else {
      text += 'None provided\n';
    }
    text += '\n';
    
    // Add implementation steps
    text += 'IMPLEMENTATION STEPS:\n';
    if (gameplan.suggested_steps && gameplan.suggested_steps.length > 0) {
      gameplan.suggested_steps.forEach((s, i) => {
        const step = s.step || '';
        text += `${i+1}. ${step}\n`;
      });
    } else {
      text += 'None provided\n';
    }
    text += '\n';
    
    // Add recommended technologies
    text += 'RECOMMENDED TECHNOLOGIES:\n';
    if (gameplan.recommended_technologies && gameplan.recommended_technologies.length > 0) {
      gameplan.recommended_technologies.forEach((t, i) => {
        const tech = t.name || '';
        const reason = t.reasoning || '';
        text += `${i+1}. ${tech}${reason ? ` - ${reason}` : ''}\n`;
      });
    } else {
      text += 'None provided\n';
    }
    text += '\n';
    
    // Add footer
    text += 'Generated by AI Fundamentals. Visit https://ai-fundamentals.me to create your own implementation plans.';
    
    return text;
    } catch (error) {
    console.error('Error generating text email:', error);
    return 'Your AI Implementation Game Plan. Please view it on the website at https://ai-fundamentals.me/my-game-plan.html';
  }
}
