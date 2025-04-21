// vertexAI.js - Firebase Vertex AI Integration for My Games Feature

/**
 * Class to handle Vertex AI interactions for the My Games feature
 */
class VertexAIGameEngine {
  constructor() {
    this.currentGameSession = null;
    this.userProfile = null;
    this.currentTopic = null;
    this.difficultyLevel = 'easy'; // Default difficulty
    this.conversationHistory = [];
    
    // Get Firebase instance - prefer global one
    this.firebase = (typeof window !== 'undefined' && window.firebase) ? window.firebase : null;
    
    // Log Firebase initialization status
    if (this.firebase) {
      console.log("Firebase initialized in VertexAIGameEngine:", this.firebase.app().name);
      console.log("Firebase project:", this.firebase.app().options.projectId);
    } else {
      console.error("Firebase not available in VertexAIGameEngine");
    }
    
    // Default sample topics for fallback
    this.sampleTopics = [
      { 
        id: 'intro-to-ai', 
        name: 'Introduction to AI', 
        description: 'Learn the basics of artificial intelligence and its applications.' 
      },
      { 
        id: 'office-productivity', 
        name: 'Office Productivity', 
        description: 'Use AI to enhance your productivity in office environments.' 
      },
      { 
        id: 'personal-finance', 
        name: 'Personal Finance', 
        description: 'Apply AI to personal finance management and investment.' 
      }
    ];
    
    // Bind methods
    this.initializeGame = this.initializeGame.bind(this);
    this.sendUserInput = this.sendUserInput.bind(this);
    this.generateAIResponse = this.generateAIResponse.bind(this);
    this.saveGameProgress = this.saveGameProgress.bind(this);
    this.loadGameProgress = this.loadGameProgress.bind(this);
    this.changeDifficulty = this.changeDifficulty.bind(this);
    this.changeTopic = this.changeTopic.bind(this);
    this.processImageInput = this.processImageInput.bind(this);
    this.processAudioInput = this.processAudioInput.bind(this);
    this.calculateCreditCost = this.calculateCreditCost.bind(this);
  }

  /**
   * Helper method to call a function through the CORS proxy if direct calls fail
   * @param {string} functionName - The name of the function to call
   * @param {Object} data - The data to pass to the function
   * @returns {Promise<Object>} - The function response
   */
  async callWithCorsProxy(functionName, data) {
    console.log(`Calling ${functionName} with data:`, data);
    
    // TEMPORARY SOLUTION: Use simulated responses since CORS is blocking the real API
    // This allows us to test the UI without the backend
    if (functionName === 'initializeGameSession') {
      console.log('Using simulated initializeGameSession response');
      
      // Generate a realistic looking response
      const simulatedResponse = {
        sessionId: `sim-${Date.now()}`,
        conversationHistory: [
          {
            role: 'assistant',
            content: `Welcome to your learning session about ${data.topicId || 'this topic'}! I'll be your AI guide for exploring ${data.topicId || 'this subject'} concepts. What specific aspects would you like to learn about?`
          }
        ],
        timestamp: new Date().toISOString()
      };
      
      // Add a small delay to simulate network request
      await new Promise(resolve => setTimeout(resolve, 1000));
      return simulatedResponse;
    }
    
    if (functionName === 'sendGameMessage') {
      console.log('Using simulated sendGameMessage response');
      
      // Content for different topics
      const topics = {
        'social-media-marketing': [
          "Social media marketing requires understanding platform-specific audiences. Facebook tends to have older users, while TikTok attracts younger demographics. Instagram sits somewhere in the middle. For effective campaigns, tailor your content to match each platform's user expectations.",
          "Content calendars are essential for social media success. They help maintain consistency, which algorithms reward with better reach. Plan content 2-4 weeks in advance, mixing promotional posts with educational and entertaining content at a ratio of roughly 1:4.",
          "Social listening tools like Hootsuite, Buffer, and Sprout Social can help you monitor brand mentions and industry trends. This intelligence lets you respond quickly to opportunities and address potential issues before they escalate.",
          "For automation, tools like Buffer, Hootsuite, and Later can schedule posts across multiple platforms. However, avoid identical cross-posting - each platform has unique formatting requirements and audience expectations. Tailoring is key."
        ],
        'videography': [
          "When recording video, the 180-degree rule is crucial for maintaining spatial continuity. Keep your camera on one side of an imaginary line between subjects to avoid disorienting viewers during cuts.",
          "For editing efficiency, consider using proxy files - lower resolution versions of your footage that make editing smoother on less powerful computers. Programs like Premiere Pro can automatically generate and link these.",
          "Audio quality often matters more than video quality. Viewers will tolerate visual imperfections but will quickly abandon content with poor audio. Invest in a decent external microphone rather than relying on built-in camera mics.",
          "The rule of thirds remains fundamental in videography composition. Place key elements along the grid lines or at their intersections to create visually balanced and engaging frames."
        ],
        'ecommerce': [
          "Product photography dramatically impacts conversion rates. Consider using 360-degree photos that allow customers to view items from all angles, reducing uncertainty and return rates.",
          "A/B testing your product descriptions can reveal surprising insights. Try comparing feature-focused versus benefit-focused language to see which resonates better with your specific audience.",
          "Cart abandonment emails have among the highest conversion rates of any marketing automation. Set up a sequence that sends 1 hour, 24 hours, and 72 hours after abandonment for optimal recovery.",
          "For pricing psychology, consider charm pricing (ending in 9 or 7) for value perception, while round numbers often work better for luxury items as they signal quality over bargains."
        ],
        'intro-to-ai': [
          "Machine learning is just one subset of artificial intelligence. It focuses on algorithms that improve through experience, while AI more broadly refers to any technique enabling computers to mimic human intelligence.",
          "The difference between supervised and unsupervised learning is that supervised requires labeled data for training, while unsupervised finds patterns in unlabeled data without specific guidance.",
          "Natural Language Processing (NLP) has made tremendous advances with transformer models like BERT and GPT. These models use attention mechanisms to understand context in language much better than previous approaches.",
          "Ethical considerations in AI include bias in training data, algorithmic transparency, privacy concerns with data collection, and the socioeconomic impacts of automation."
        ],
        'office-productivity': [
          "Text expansion tools can save hours of typing. Applications like TextExpander or AutoHotkey let you create shortcuts that expand into frequently used phrases, paragraphs, or even templates.",
          "Email management using the 4D system (Delete, Delegate, Defer, Do) can help maintain inbox zero. Process each email once and immediately decide which category it belongs in rather than rereading multiple times.",
          "For document organization, implement a consistent file naming convention that includes date (YYYY-MM-DD format), project, document type, and version number for easy sorting and identification.",
          "Calendar blocking, where you schedule specific time for focused work tasks, can increase productivity by up to 50% compared to reactive work patterns where you constantly respond to incoming requests."
        ],
        'personal-finance': [
          "When building an emergency fund, aim for 3-6 months of essential expenses rather than income. This more targeted approach ensures you're covered while potentially requiring less savings.",
          "For retirement planning, the 4% rule suggests you can withdraw 4% of your portfolio in year one, then adjust for inflation each year after. To determine your target retirement savings, multiply your desired annual income by 25.",
          "Credit utilization, the percentage of available credit you're using, affects about 30% of your credit score. For optimal scores, keep utilization below 10% across all cards, even if you pay in full monthly.",
          "When evaluating investment returns, focus on the geometric mean (CAGR) rather than arithmetic mean. A 50% loss followed by a 50% gain results in a 25% loss overall, not a 0% return as arithmetic averaging would suggest."
        ]
      };
      
      // Get the appropriate responses for the topic or use a general fallback
      const topicId = this.currentTopic?.id || data.topicId || 'social-media-marketing';
      const responses = topics[topicId] || topics['social-media-marketing'];
      
      // Create a response that feels like it's answering the user's question
      const userMessage = data.message || '';
      let aiResponse = '';
      
      if (userMessage.toLowerCase().includes('automation') || userMessage.toLowerCase().includes('automate')) {
        // Handle automation-specific questions
        if (topicId === 'social-media-marketing') {
          aiResponse = "To automate social media posts, you can use scheduling tools like Buffer, Hootsuite, or Later. These platforms allow you to prepare content in batches and schedule posts for optimal times when your audience is most active. For more advanced automation, consider using IFTTT or Zapier to connect your social accounts with other applications. For example, you could automatically share new blog posts to Twitter or post Instagram photos to Facebook. Remember that while automation saves time, you should still monitor engagement and respond personally to comments and messages.";
        } else {
          // Generic automation answer for other topics
          aiResponse = `Automation can significantly improve efficiency in ${topicId}. There are several tools and techniques that can help you automate repetitive tasks, saving time and reducing errors. Would you like to know about specific automation tools for this field?`;
        }
      } else {
        // Pick a semi-random response that sounds relevant
        const randomIndex = Math.floor(Math.random() * responses.length);
        aiResponse = responses[randomIndex];
        
        // Add a personalized touch
        aiResponse += "\n\nDoes this help with what you were asking about? I'd be happy to go into more detail on any specific aspect you're interested in.";
      }
      
      // Add a small delay to simulate network request
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return {
        aiResponse: aiResponse,
        conversationId: data.sessionId || 'sim-session',
        timestamp: new Date().toISOString()
      };
    }
    
    // If we get here, we're trying to make a real API call, which we know will fail
    console.log('Simulating API failure for:', functionName);
    try {
      // For logging/development purposes, still try to make the real call to see the error
      const functionUrl = `https://us-central1-ai-fundamentals-ad37d.cloudfunctions.net/${functionName}`;
      console.log(`Attempting real call to: ${functionUrl} (expecting failure)`);
      
      const requestData = {
        ...data,
        timestamp: Date.now(),
        userInfo: this.userProfile ? {
          uid: this.userProfile.uid,
          email: this.userProfile.email
        } : null
      };
      
      try {
        const response = await fetch(functionUrl, {
          method: 'POST',
          mode: 'cors',
          cache: 'no-cache',
          credentials: 'omit',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData)
        });
        
        // This likely won't execute due to CORS
        if (response.ok) {
          const result = await response.json();
          console.log(`Unexpected success from API call to ${functionName}:`, result);
          return result;
        } else {
          throw new Error(`HTTP error: ${response.status}`);
        }
      } catch (apiError) {
        console.error(`Expected API error for ${functionName}:`, apiError);
        // Fall through to simulation below
      }
      
      // Return simulated error if we don't have a specific simulation
      throw new Error(`No simulation available for function: ${functionName}`);
    } catch (error) {
      console.error(`Error in simulated API call:`, error);
      throw error;
    }
  }

  /**
   * Initialize a new game session
   * @param {string} userId - The current user's ID
   * @param {string} topicId - The selected topic ID
   * @param {string} difficulty - The selected difficulty level
   * @returns {Promise<Object>} - The initialized game session
   */
  async initializeGame(topic, difficulty = 'intermediate') {
    try {
      console.log('Initializing game with topic:', topic, 'and difficulty:', difficulty);
      
      // Check if user has enough credits
      const initialCreditCost = this.calculateCreditCost('initialize');
      if (this.userProfile.credits < initialCreditCost) {
        throw new Error(`Insufficient credits (${this.userProfile.credits}/${initialCreditCost})`);
      }
      
      try {
        console.log('Attempting to initialize game session');
        
        // Try using callWithCorsProxy which now has simulated responses
        const proxyResponse = await this.callWithCorsProxy('initializeGameSession', {
          topicId: topic.id,
          difficulty: difficulty,
          model: 'gemini-pro',
          options: {
            temperature: 0.7,
            maxTokens: 1024
          }
        });
        
        if (proxyResponse && proxyResponse.sessionId) {
          this.currentGameSession = {
            sessionId: proxyResponse.sessionId,
            userId: this.userProfile.uid,
            topicId: topic.id,
            difficulty: difficulty,
            creditsUsed: initialCreditCost,
            isSimulated: true
          };
          
          this.currentTopic = topic;
          this.conversationHistory = proxyResponse.conversationHistory || [];
          
          // No need to update Firestore in simulated mode
          // Just update local credit count
          this.userProfile.credits -= initialCreditCost;
          
          console.log('Game initialized in simulated mode:', this.currentGameSession);
          
          return {
            sessionId: this.currentGameSession.sessionId,
            initialPrompt: this.conversationHistory[0].content,
            creditsUsed: initialCreditCost,
            remainingCredits: this.userProfile.credits,
            isSimulated: true
          };
        } else {
          throw new Error('Invalid simulated response');
        }
      } catch (error) {
        console.error('Error initializing game:', error);
        
        // All methods failed, use fallback with helpful error message
        const introText = `I'll be your guide to learning about ${topic.name}. Since we're having some connection issues right now, let me know what specific aspects of ${topic.name} you're interested in, and I'll do my best to help once connectivity is restored.`;
        
        this.currentGameSession = {
          sessionId: `local-${Date.now()}`,
          userId: this.userProfile.uid,
          topicId: topic.id,
          difficulty: difficulty,
          creditsUsed: initialCreditCost,
          fallbackMode: true
        };
        
        this.currentTopic = topic;
        this.conversationHistory = [{
          role: 'assistant',
          content: introText
        }];
        
        // Just update local credit count
        this.userProfile.credits -= initialCreditCost;
        
        return {
          sessionId: this.currentGameSession.sessionId,
          initialPrompt: introText,
          creditsUsed: initialCreditCost,
          remainingCredits: this.userProfile.credits,
          isConnectivityIssue: true
        };
      }
    } catch (error) {
      console.error('Error initializing game:', error);
      throw error;
    }
  }

  /**
   * Generate the initial prompt based on topic and difficulty
   * @returns {string} - The initial prompt for Vertex AI
   */
  generateInitialPrompt() {
    const difficultyDescriptions = {
      easy: 'Use simple language and avoid technical jargon. Explain concepts thoroughly with everyday examples. Provide step-by-step guidance and frequent encouragement.',
      intermediate: 'Use industry-standard terminology with explanations when needed. Provide practical examples and use cases. Balance guidance with challenges that encourage problem-solving.',
      hard: 'Use technical language and industry-specific terminology. Present complex scenarios that require synthesis of multiple concepts. Provide minimal guidance, encouraging critical thinking and creative solutions.'
    };
    
    return `You are an AI gaming assistant for AI Fundamentals, helping users learn AI skills related to ${this.currentTopic.name}.
Difficulty: ${this.difficultyLevel.toUpperCase()}

${difficultyDescriptions[this.difficultyLevel]}
Focus on how these skills can be applied to earn money or improve career prospects.

Start by introducing yourself and asking the user what specific aspect of ${this.currentTopic.name} they're interested in learning about.`;
  }

  /**
   * Send user input to the game engine
   * @param {string} userInput - The user's text input
   * @param {string} inputType - The type of input (text, image, audio)
   * @param {Object} additionalData - Additional data for non-text inputs
   * @returns {Promise<Object>} - The AI response and updated game state
   */
  async sendUserInput(userInput, inputType = 'text', additionalData = null) {
    console.log('sendUserInput called with', { userInput, inputType });
    try {
      if (!this.currentGameSession) {
        throw new Error('No active game session');
      }
      
      // Calculate credit cost
      const creditCost = this.calculateCreditCost(inputType);
      
      // Check if user has enough credits
      if (this.userProfile.credits < creditCost) {
        // Instead of throwing an error, return a structured response
        return {
          success: false,
          errorType: 'insufficient_credits',
          message: `You need ${creditCost} credits to continue, but you only have ${this.userProfile.credits}.`,
          currentCredits: this.userProfile.credits,
          options: [
            {
              action: 'add_credits',
              label: 'Purchase Credits',
              description: 'Buy credits to continue your learning journey.'
            },
            {
              action: 'wait_for_monthly',
              label: 'Wait for Monthly Credits',
              description: 'Reminder: Free accounts receive 20 credits on the 1st of each month.'
            }
          ]
        };
      }
      
      // Process different input types
      let processedInput = userInput;
      
      // Update conversation history
      this.conversationHistory.push({
        role: 'user',
        content: processedInput
      });
      
      try {
        // Use simulated response from callWithCorsProxy
        const response = await this.callWithCorsProxy('sendGameMessage', {
          sessionId: this.currentGameSession.sessionId,
          message: processedInput,
          model: 'gemini-pro',
          options: {
            temperature: 0.7,
            maxTokens: 1024
          }
        });
        
        console.log('Game message response:', response);
        
        // Update conversation history with AI response
        this.conversationHistory.push({
          role: 'assistant',
          content: response.aiResponse
        });
        
        // For simulated mode, we don't update Firestore
        
        // Update local state
        this.currentGameSession.creditsUsed += creditCost;
        this.userProfile.credits -= creditCost;
        
        return {
          aiResponse: response.aiResponse,
          creditsUsed: creditCost,
          remainingCredits: this.userProfile.credits,
          conversationHistory: this.conversationHistory,
          isSimulated: true
        };
      } catch (error) {
        console.error('Error with sendGameMessage:', error);
        
        // Fallback response if even the simulation fails
        const fallbackResponse = `I apologize, but I'm having trouble processing your request about "${processedInput}". This appears to be a technical issue on our end. Could you try again with a different question?`;
        
        // Add fallback to conversation history
        this.conversationHistory.push({
          role: 'assistant',
          content: fallbackResponse
        });
        
        return {
          aiResponse: fallbackResponse,
          creditsUsed: creditCost,
          remainingCredits: this.userProfile.credits,
          conversationHistory: this.conversationHistory,
          isError: true
        };
      }
    } catch (error) {
      console.error('Error sending user input:', error);
      
      // Return a more helpful error message
      return {
        success: false,
        errorType: 'api_error',
        message: 'Error connecting to AI service. Please try again in a moment.',
        error: error.message
      };
    }
  }

  /**
   * Generate AI response
   * @param {string} prompt - The prompt for the AI
   * @returns {Promise<string>} - The AI response
   */
  async generateAIResponse(prompt) {
    console.log('generateAIResponse called with prompt length:', prompt.length);
    try {
      // Call Firebase Function that interfaces with Vertex AI
      const generateResponse = this.firebase.functions().httpsCallable('generateVertexAIResponse');
      
      const result = await generateResponse({
        prompt: prompt,
        model: 'gemini-pro',
        options: {
          maxTokens: 1024,
          temperature: 0.7
        }
      });
      
      console.log('VertexAI response received:', result.data);
      return result.data.text;
    } catch (error) {
      console.error('Error generating AI response:', error);
      return "I apologize, but I encountered an error processing your request. Please try again.";
    }
  }

  /**
   * Process image input
   * @param {string} userText - The user's text accompanying the image
   * @param {Object} imageData - The image data
   * @returns {Promise<string>} - The processed input
   */
  async processImageInput(userText, imageData) {
    try {
      // Call Firebase Function to process image
      const processImage = this.firebase.functions().httpsCallable('processImageForVertexAI');
      
      const result = await processImage({
        imageData,
        userText
      });
      
      return result.data.processedInput;
    } catch (error) {
      console.error('Error processing image input:', error);
      return userText + " [Error processing image]";
    }
  }

  /**
   * Process audio input
   * @param {string} userText - The user's text accompanying the audio
   * @param {Object} audioData - The audio data
   * @returns {Promise<string>} - The processed input
   */
  async processAudioInput(userText, audioData) {
    try {
      // Call Firebase Function to process audio
      const processAudio = this.firebase.functions().httpsCallable('processAudioForVertexAI');
      
      const result = await processAudio({
        audioData,
        userText
      });
      
      return result.data.processedInput;
    } catch (error) {
      console.error('Error processing audio input:', error);
      return userText + " [Error processing audio]";
    }
  }

  /**
   * Calculate credit cost based on input type
   * @param {string} inputType - The type of input (text, image, audio)
   * @returns {number} - The credit cost
   */
  calculateCreditCost(inputType) {
    switch (inputType) {
      case 'image':
        return 2; // Higher cost for image processing
      case 'audio':
        return 2; // Higher cost for audio processing
      case 'text':
      default:
        return 1; // Standard cost for text
    }
  }

  /**
   * Check if user has low credits and should be warned
   * @returns {boolean} - True if credits are low
   */
  hasLowCredits() {
    return this.userProfile && this.userProfile.credits <= 5;
  }

  /**
   * Save game progress
   * @returns {Promise<Object>} - The saved game session
   */
  async saveGameProgress() {
    console.log('saveGameProgress called');
    try {
      if (!this.currentGameSession) {
        throw new Error('No active game session');
      }
      
      const db = this.firebase.firestore();
      const gameSessionRef = db.collection('gameSessions').doc(this.currentGameSession.sessionId);
      
      await gameSessionRef.update({
        conversationHistory: this.conversationHistory,
        lastSavedAt: this.firebase.firestore.FieldValue.serverTimestamp()
      });
      
      return this.currentGameSession;
    } catch (error) {
      console.error('Error saving game progress:', error);
      throw error;
    }
  }

  /**
   * Load game progress
   * @param {string} gameSessionId - The game session ID to load
   * @returns {Promise<Object>} - The loaded game session
   */
  async loadGameProgress(gameSessionId) {
    console.log('loadGameProgress called with ID:', gameSessionId);
    try {
      const db = this.firebase.firestore();
      const gameSessionRef = db.collection('gameSessions').doc(gameSessionId);
      const gameSessionSnap = await gameSessionRef.get();
      
      if (!gameSessionSnap.exists) {
        throw new Error('Game session not found');
      }
      
      const gameSession = gameSessionSnap.data();
      this.currentGameSession = gameSession;
      this.conversationHistory = gameSession.conversationHistory || [];
      
      // Get user and topic data
      const userRef = db.collection('users').doc(gameSession.userId);
      const userSnap = await userRef.get();
      this.userProfile = userSnap.data();
      
      const topicRef = db.collection('topics').doc(gameSession.topicId);
      const topicSnap = await topicRef.get();
      this.currentTopic = topicSnap.data();
      
      this.difficultyLevel = gameSession.difficulty;
      
      return gameSession;
    } catch (error) {
      console.error('Error loading game progress:', error);
      throw error;
    }
  }

  /**
   * Change difficulty level
   * @param {string} newDifficulty - The new difficulty level
   * @returns {Promise<Object>} - The updated game session
   */
  async changeDifficulty(newDifficulty) {
    console.log('changeDifficulty called with:', newDifficulty);
    try {
      if (!this.currentGameSession) {
        throw new Error('No active game session');
      }
      
      this.difficultyLevel = newDifficulty;
      
      // Add system message about difficulty change
      const systemMessage = {
        role: 'system',
        content: `Difficulty changed to ${newDifficulty.toUpperCase()}. Adjust your responses accordingly.`
      };
      
      this.conversationHistory.push(systemMessage);
      
      // Update game session in Firestore
      const db = this.firebase.firestore();
      const gameSessionRef = db.collection('gameSessions').doc(this.currentGameSession.sessionId);
      
      await gameSessionRef.update({
        difficulty: newDifficulty,
        conversationHistory: this.conversationHistory
      });
      
      this.currentGameSession.difficulty = newDifficulty;
      
      return this.currentGameSession;
    } catch (error) {
      console.error('Error changing difficulty:', error);
      throw error;
    }
  }

  /**
   * Change topic
   * @param {string} newTopicId - The new topic ID
   * @returns {Promise<Object>} - The new game session
   */
  async changeTopic(newTopicId) {
    console.log('changeTopic called with ID:', newTopicId);
    return await this.initializeGame(
      this.currentGameSession?.userId || this.firebase.auth().currentUser.uid,
      newTopicId,
      this.difficultyLevel
    );
  }
}

export default VertexAIGameEngine;
