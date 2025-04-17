// Firebase Cloud Function for Vertex AI Integration
// This file should be deployed to Firebase Functions

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { GoogleAuth } = require('google-auth-library');
const { VertexAI } = require('@google-cloud/vertexai');

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Vertex AI with your Google Cloud project and location
const projectId = 'ai-fundamentals-ad37d'; // Replace with your actual project ID
const location = 'us-central1'; // Replace with your preferred location
const vertexAI = new VertexAI({ project: projectId, location: location });

// Initialize the model
const generativeModel = vertexAI.preview.getGenerativeModel({
  model: 'gemini-pro',
  generation_config: {
    max_output_tokens: 1024,
    temperature: 0.7,
    top_p: 0.95,
  },
});

// Initialize the multimodal model for image processing
const multimodalModel = vertexAI.preview.getGenerativeModel({
  model: 'gemini-pro-vision',
  generation_config: {
    max_output_tokens: 1024,
    temperature: 0.7,
    top_p: 0.95,
  },
});

/**
 * Firebase Function to generate responses using Vertex AI
 */
exports.generateVertexAIResponse = functions.https.onCall(async (data, context) => {
  // Check if the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  try {
    const { prompt, model = 'gemini-pro', maxTokens = 1024, temperature = 0.7 } = data;

    // Create generation config
    const generationConfig = {
      max_output_tokens: maxTokens,
      temperature: temperature,
      top_p: 0.95,
    };

    // Get the model
    const modelInstance = vertexAI.preview.getGenerativeModel({
      model: model,
      generation_config: generationConfig,
    });

    // Generate content
    const result = await modelInstance.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const response = result.response.candidates[0].content.parts[0].text;

    return { response };
  } catch (error) {
    console.error('Error generating response:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Firebase Function to process images for Vertex AI
 */
exports.processImageForVertexAI = functions.https.onCall(async (data, context) => {
  // Check if the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  try {
    const { imageData, userText } = data;

    // Decode base64 image
    const imageBuffer = Buffer.from(imageData, 'base64');
    
    // Generate content with the multimodal model
    const result = await multimodalModel.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: userText || 'Describe this image in detail and explain how it relates to AI concepts.' },
            { inline_data: { mime_type: 'image/jpeg', data: imageBuffer.toString('base64') } }
          ]
        }
      ],
    });

    const response = result.response.candidates[0].content.parts[0].text;

    return { 
      processedInput: `[Image uploaded] ${userText || ''}\n\nImage analysis: ${response}` 
    };
  } catch (error) {
    console.error('Error processing image:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Firebase Function to process audio for Vertex AI
 */
exports.processAudioForVertexAI = functions.https.onCall(async (data, context) => {
  // Check if the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  try {
    const { audioData, userText } = data;

    // For audio processing, we would typically:
    // 1. Save the audio to Cloud Storage
    // 2. Use Speech-to-Text API to transcribe
    // 3. Return the transcription
    
    // This is a simplified version that assumes audioData is already transcribed
    // In a real implementation, you would use the Speech-to-Text API
    
    const transcription = audioData.transcription || "Audio transcription would appear here";
    
    return { 
      processedInput: `[Audio message] ${userText || ''}\n\nTranscription: ${transcription}` 
    };
  } catch (error) {
    console.error('Error processing audio:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Firebase Function to update user credits after game interactions
 */
exports.updateUserCredits = functions.firestore
  .document('gameSessions/{sessionId}')
  .onUpdate(async (change, context) => {
    const newValue = change.after.data();
    const previousValue = change.before.data();
    
    // Check if credits used has changed
    if (newValue.creditsUsed === previousValue.creditsUsed) {
      return null; // No credit change, exit early
    }
    
    const creditDifference = newValue.creditsUsed - previousValue.creditsUsed;
    
    try {
      // Get a reference to the user document
      const db = admin.firestore();
      const userRef = db.collection('users').doc(newValue.userId);
      
      // Update user's credits in a transaction
      await db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        
        if (!userDoc.exists) {
          throw new Error('User document does not exist');
        }
        
        const userData = userDoc.data();
        const newCredits = userData.credits - creditDifference;
        
        // Ensure credits don't go below zero
        const finalCredits = Math.max(0, newCredits);
        
        transaction.update(userRef, { 
          credits: finalCredits,
          totalCreditsUsed: (userData.totalCreditsUsed || 0) + creditDifference
        });
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating user credits:', error);
      return { error: error.message };
    }
  });

/**
 * Firebase Function to check if user has sufficient credits before starting a game
 */
exports.checkUserCredits = functions.https.onCall(async (data, context) => {
  // Check if the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  try {
    const { requiredCredits = 1 } = data;
    const userId = context.auth.uid;
    
    // Get user document
    const db = admin.firestore();
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'User not found'
      );
    }
    
    const userData = userDoc.data();
    const hasEnoughCredits = userData.credits >= requiredCredits;
    
    return { 
      hasEnoughCredits,
      currentCredits: userData.credits,
      requiredCredits
    };
  } catch (error) {
    console.error('Error checking user credits:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Firebase Function to replenish user credits on a schedule
 * This runs once a day to add credits based on subscription tier
 */
exports.replenishUserCredits = functions.pubsub
  .schedule('0 0 * * *') // Run at midnight every day
  .timeZone('America/New_York')
  .onRun(async (context) => {
    try {
      const db = admin.firestore();
      const usersSnapshot = await db.collection('users').get();
      
      const batch = db.batch();
      const now = admin.firestore.Timestamp.now();
      const today = new Date(now.toDate().setHours(0, 0, 0, 0));
      
      usersSnapshot.forEach((userDoc) => {
        const userData = userDoc.data();
        const lastRefill = userData.lastCreditRefill ? userData.lastCreditRefill.toDate() : null;
        
        // Check if user has already received credits today
        if (lastRefill && lastRefill.getTime() === today.getTime()) {
          return; // Skip this user, already received credits today
        }
        
        // Determine credits to add based on subscription tier
        let creditsToAdd = 0;
        switch (userData.subscriptionTier) {
          case 'premium':
            creditsToAdd = 10; // 10 credits per day for premium users
            break;
          case 'enterprise':
            creditsToAdd = 50; // 50 credits per day for enterprise users
            break;
          case 'free':
          default:
            creditsToAdd = 2; // 2 credits per day for free users
            break;
        }
        
        // Update user document
        batch.update(userDoc.ref, {
          credits: admin.firestore.FieldValue.increment(creditsToAdd),
          lastCreditRefill: now
        });
      });
      
      // Commit the batch
      await batch.commit();
      
      return { success: true };
    } catch (error) {
      console.error('Error replenishing user credits:', error);
      return { error: error.message };
    }
  });

/**
 * Firebase Function to initialize user credits for new users
 */
exports.initializeUserCredits = functions.https.onCall(async (data, context) => {
  // Check if the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  try {
    const userId = context.auth.uid;
    const db = admin.firestore();
    const userRef = db.collection('users').doc(userId);
    
    // Check if user already has credits
    const userDoc = await userRef.get();
    
    if (userDoc.exists && userDoc.data().credits !== undefined) {
      return { 
        success: true,
        message: 'User already has credits initialized',
        credits: userDoc.data().credits
      };
    }
    
    // Initialize credits
    await userRef.update({
      credits: 10, // Starting credits
      totalCreditsUsed: 0,
      subscriptionTier: 'free',
      lastCreditRefill: admin.firestore.Timestamp.now()
    });
    
    return { 
      success: true,
      message: 'Credits initialized successfully',
      credits: 10
    };
  } catch (error) {
    console.error('Error initializing user credits:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
