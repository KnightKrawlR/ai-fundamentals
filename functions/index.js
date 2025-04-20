/**
 * Firebase Cloud Functions for Vertex AI
 * These functions provide an API to integrate with Google's Vertex AI services
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({
  origin: [
    'https://www.ai-fundamentals.me',
    'https://ai-fundamentals.me',
    'https://ai-fundamentals-ad37d.web.app',
    'http://localhost:3000',
    'http://localhost:8080'
  ],
  credentials: true
});
const { VertexAI } = require('@google-cloud/vertexai');

// Initialize Firebase Admin SDK
admin.initializeApp();

// Reference to Firestore database
const db = admin.firestore();

/**
 * Credit management constants
 */
const DEFAULT_CREDITS = 10;
const TEXT_CREDIT_COST = 1;
const CHAT_CREDIT_COST = 1;
const IMAGE_CREDIT_COST = 5;
const GAME_SESSION_COST = 2;
const GAME_MESSAGE_COST = 1;

// Initialize Vertex AI
const PROJECT_ID = process.env.GCLOUD_PROJECT || 'ai-fundamentals';
const LOCATION = 'us-central1';
const vertexAI = new VertexAI({ project: PROJECT_ID, location: LOCATION });

// Create a wrapper for callable functions that properly sets CORS headers
const createCallableFunction = (handler) => {
  return functions.https.onCall((data, context) => {
    // Set CORS headers in the function response
    context.rawRequest.headers['access-control-allow-origin'] = 
      context.rawRequest.headers.origin || '*';
    context.rawRequest.headers['access-control-allow-credentials'] = 'true';
    
    // Call the original handler
    return handler(data, context);
  });
};

// Create a wrapper for HTTP functions that adds CORS handling
const createHttpFunction = (handler) => {
  return functions.https.onRequest((req, res) => {
    // Enable CORS using the 'cors' middleware
    return cors(req, res, () => {
      return handler(req, res);
    });
  });
};

// Add a health check endpoint to test CORS
exports.healthCheck = createHttpFunction((req, res) => {
  res.status(200).json({ status: 'ok', message: 'Vertex AI functions are running' });
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
  
  // Log the transaction
  await admin.firestore().collection('creditTransactions').add({
    userId,
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
 * Initialize a game session
 */
exports.initializeGameSession = createCallableFunction(async (data, context) => {
  try {
    const { gameConfig, model = 'gemini-pro', options = {}, allowAnonymous = false } = data;
    const { gameType, characterName } = gameConfig || {};
    
    // Validate input
    if (!gameType) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Game type is required'
      );
    }
    
    // Validate authentication
    await validateAuth(context, allowAnonymous);
    
    // Create a unique session ID
    const sessionId = admin.firestore().collection('gameSessions').doc().id;
    const userId = context.auth?.uid || 'anonymous';
    
    // Build the system prompt for the game
    const systemPrompt = `You are an AI game master for a ${gameType} game. The player's character is named ${characterName || 'Player'}. 
Generate an engaging introduction to the game world and the first scenario. Be creative, descriptive, and interactive.
Your responses should be immersive and provide clear choices or actions for the player.`;
    
    // Initialize the game model
    const generativeModel = vertexAI.getGenerativeModel({
      model: model,
      generation_config: {
        max_output_tokens: options.maxTokens || 2048,
        temperature: options.temperature || 0.8,
        top_p: options.topP || 0.95,
        top_k: options.topK || 40
      },
    });
    
    // Generate the initial game content
    const result = await generativeModel.generateContent({
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }] }
      ],
    });
    
    const response = result.response;
    const introText = response.candidates[0].content.parts[0].text;
    
    // Get usage metadata
    const usageMetadata = {
      promptTokens: response.usageMetadata?.promptTokenCount || 0,
      candidatesTokens: response.usageMetadata?.candidatesTokenCount || 0,
      totalTokens: response.usageMetadata?.totalTokenCount || 0
    };
    
    // Store the game session in Firestore
    await admin.firestore().collection('gameSessions').doc(sessionId).set({
      userId,
      sessionId,
      gameType,
      characterName: characterName || 'Player',
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'assistant', content: introText }
      ],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Log API usage
    await logAPIUsage(
      userId,
      model,
      usageMetadata.totalTokens,
      'initializeGameSession'
    );
    
    return {
      sessionId,
      introText,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'assistant', content: introText }
      ],
      usageMetadata,
      success: true
    };
  } catch (error) {
    console.error('Error initializing game session:', error);
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'Error initializing game session'
    );
  }
});

/**
 * Send a message in a game session
 */
exports.sendGameMessage = createCallableFunction(async (data, context) => {
  try {
    const { sessionId, message, model = 'gemini-pro', options = {}, allowAnonymous = false } = data;
    
    // Validate input
    if (!sessionId || !message) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Session ID and message are required'
      );
    }
    
    // Validate authentication
    await validateAuth(context, allowAnonymous);
    const userId = context.auth?.uid || 'anonymous';
    
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
    if (sessionData.userId !== userId && sessionData.userId !== 'anonymous') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'You do not have permission to access this game session'
      );
    }
    
    // Get the conversation history
    const messages = sessionData.messages || [];
    
    // Add the user message to history
    const updatedMessages = [
      ...messages,
      { role: 'user', content: message }
    ];
    
    // Format messages for Vertex AI
    const formattedMessages = updatedMessages.map(msg => ({
      role: msg.role === 'user' ? 'user' : (msg.role === 'system' ? 'user' : 'model'),
      parts: [{ text: msg.content }]
    }));
    
    // Initialize the game model
    const generativeModel = vertexAI.getGenerativeModel({
      model: model,
      generation_config: {
        max_output_tokens: options.maxTokens || 2048,
        temperature: options.temperature || 0.8,
        top_p: options.topP || 0.95,
        top_k: options.topK || 40
      },
    });
    
    // Generate the response
    const result = await generativeModel.generateContent({
      contents: formattedMessages,
    });
    
    const response = result.response;
    const aiResponse = response.candidates[0].content.parts[0].text;
    
    // Get usage metadata
    const usageMetadata = {
      promptTokens: response.usageMetadata?.promptTokenCount || 0,
      candidatesTokens: response.usageMetadata?.candidatesTokenCount || 0,
      totalTokens: response.usageMetadata?.totalTokenCount || 0
    };
    
    // Update the game session in Firestore
    await admin.firestore().collection('gameSessions').doc(sessionId).update({
      messages: [
        ...updatedMessages,
        { role: 'assistant', content: aiResponse }
      ],
      lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Log API usage
    await logAPIUsage(
      userId,
      model,
      usageMetadata.totalTokens,
      'sendGameMessage'
    );
    
    return {
      aiResponse,
      gameState: {
        sessionId,
        messageCount: updatedMessages.length + 1
      },
      usageMetadata,
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
exports.getAvailableModels = createCallableFunction(async (context) => {
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
