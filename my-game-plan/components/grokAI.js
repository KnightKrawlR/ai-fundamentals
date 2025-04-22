// grokAI.js - Enhanced integration with Grok AI via Vercel's xAI integration
import firebase from '../firebase';

// Base URL for HTTP functions
const FUNCTION_BASE_URL = 'https://us-central1-ai-fundamentals-ad37d.cloudfunctions.net';

class GrokAI {
  constructor() {
    this._defaultModel = 'grok-2-instruct';
    this._firebaseInitialized = false;
    this._clientFallbackMode = false;
    
    // Check if Firebase is initialized
    if (typeof firebase !== 'undefined' && firebase.app()) {
      this._firebaseInitialized = true;
      this._functions = firebase.functions();
    }
  }
  
  /**
   * Generates a game plan using Grok AI - first tries the HTTP endpoint, then falls back to callable,
   * and finally generates a fake response client-side if everything fails
   * @param {string} projectDescription - Description of the project
   * @param {string} category - Optional category for the project
   * @param {string} topic - Optional topic within the category
   * @returns {Promise<Object>} - The generated game plan
   */
  async generateGamePlan(projectDescription, category = '', topic = '') {
    if (!this._firebaseInitialized && !this._clientFallbackMode) {
      console.warn('Firebase not initialized, using client-side fallback mode');
      this._clientFallbackMode = true;
    }
    
    const requestData = {
      projectDescription,
      category,
      topic,
      model: this._defaultModel
    };
    
    // If server is failing, use client-side fallback after first attempt
    if (this._clientFallbackMode) {
      console.log('Using client-side fallback to generate response');
      return this._generateClientSideFallback(requestData);
    }
    
    try {
      // First try health check endpoint to see if functions are working
      try {
        console.log('Checking Firebase functions health');
        const healthCheck = await fetch(`${FUNCTION_BASE_URL}/healthCheck`, {
          method: 'GET'
        });
        
        if (!healthCheck.ok) {
          console.warn(`Health check failed with status: ${healthCheck.status}. Using client-side fallback.`);
          this._clientFallbackMode = true;
          return this._generateClientSideFallback(requestData);
        }
        
        console.log('Health check passed, continuing with function calls');
      } catch (healthError) {
        console.warn('Health check failed, using client-side fallback:', healthError);
        this._clientFallbackMode = true;
        return this._generateClientSideFallback(requestData);
      }
      
      // First try HTTP endpoint
      try {
        console.log('Trying HTTP endpoint for generateGamePlan');
        const response = await fetch(`${FUNCTION_BASE_URL}/generateGamePlanHttp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestData)
        });
        
        // Capture the status code for better error reporting
        const statusCode = response.status;
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${statusCode}`);
        }
        
        const data = await response.json();
        if (!data.success) {
          throw new Error(data.error || 'Unknown error in HTTP response');
        }
        
        return data;
      } catch (httpError) {
        // Log HTTP error and try callable function as fallback
        console.warn('HTTP endpoint failed, falling back to callable function:', httpError);
        
        try {
          // Call Firebase Function to generate game plan
          const generateGamePlan = this._functions.httpsCallable('generateGamePlan');
          const response = await generateGamePlan(requestData);
          
          return response.data;
        } catch (callableError) {
          console.error('Callable function also failed:', callableError);
          // Both HTTP and callable failed, switch to client-side fallback mode
          this._clientFallbackMode = true;
          return this._generateClientSideFallback(requestData);
        }
      }
    } catch (error) {
      console.error('All methods for generating game plan failed:', error);
      // Enable client-side fallback mode for future requests
      this._clientFallbackMode = true;
      return this._generateClientSideFallback(requestData);
    }
  }
  
  /**
   * Generate a client-side fallback response when server functions fail
   * @param {Object} requestData - The request data containing project description, category, and topic
   * @returns {Object} - A simulated response
   * @private
   */
  _generateClientSideFallback(requestData) {
    console.log('Generating client-side fallback response');
    
    const { projectDescription, category, topic } = requestData;
    
    // Create a somewhat customized response based on the input
    const description = projectDescription || `A ${category} project`;
    const projectType = category || 'web application';
    const projectTopic = topic || 'general purpose';
    
    // Generate steps based on project type
    let steps = [];
    if (projectType.toLowerCase().includes('web')) {
      steps = [
        "Set up your development environment with Node.js and a code editor.",
        "Create a new project using Create React App or a similar framework.",
        "Design the user interface and component structure.",
        "Implement core functionality and API integrations.",
        "Add styling and responsive design.",
        "Test the application across different browsers and devices.",
        "Deploy to a hosting platform like Vercel or Netlify."
      ];
    } else if (projectType.toLowerCase().includes('mobile')) {
      steps = [
        "Set up your development environment with React Native or Flutter.",
        "Create a new mobile app project with the selected framework.",
        "Design the app UI/UX following platform guidelines.",
        "Implement core functionality and API integrations.",
        "Add navigation and state management.",
        "Test on both iOS and Android devices.",
        "Prepare for app store submission."
      ];
    } else {
      steps = [
        "Define the project requirements and user stories.",
        "Create a project plan with milestones and deliverables.",
        "Set up the development environment with necessary tools.",
        "Implement the core functionality in small, testable increments.",
        "Add user interface and experience enhancements.",
        "Perform thorough testing and debugging.",
        "Deploy the finished project and collect user feedback."
      ];
    }
    
    // Add description-specific step if available
    if (description && description.length > 10) {
      steps.push(`Implement specific features for your ${description} based on user requirements.`);
    }
    
    // Generate technologies based on project type
    let technologies = [];
    if (projectType.toLowerCase().includes('web')) {
      technologies = [
        { name: "React", description: "A JavaScript library for building user interfaces" },
        { name: "Node.js", description: "JavaScript runtime for building server-side applications" },
        { name: "Express", description: "Web framework for Node.js to build APIs and web servers" },
        { name: "MongoDB", description: "NoSQL database for storing application data" }
      ];
    } else if (projectType.toLowerCase().includes('mobile')) {
      technologies = [
        { name: "React Native", description: "Framework for building native mobile apps with React" },
        { name: "Redux", description: "State management library for JavaScript applications" },
        { name: "Firebase", description: "Backend-as-a-Service platform for mobile and web apps" },
        { name: "Jest", description: "JavaScript testing framework for unit and integration tests" }
      ];
    } else {
      technologies = [
        { name: "JavaScript", description: "Programming language for web development" },
        { name: "Git", description: "Version control system for tracking code changes" },
        { name: "VS Code", description: "Popular code editor with extensive plugin support" },
        { name: "Docker", description: "Platform for developing and deploying applications in containers" }
      ];
    }
    
    // Generate resources based on project type and description
    const resources = [
      { 
        title: "Official Documentation", 
        url: "https://www.ai-fundamentals.me/learning.html", 
        type: "Documentation" 
      },
      {
        title: `${projectType} Development Tutorial`,
        url: "https://www.ai-fundamentals.me/learning.html",
        type: "Tutorial"
      },
      {
        title: "Free Code Camp Courses",
        url: "https://www.freecodecamp.org/learn/",
        type: "Course"
      },
      {
        title: "MDN Web Docs",
        url: "https://developer.mozilla.org/",
        type: "Reference"
      }
    ];
    
    return {
      success: true,
      plan: steps,
      technologies: technologies,
      resources: resources,
      _note: "This response was generated client-side due to server function unavailability"
    };
  }
  
  /**
   * Processes a chat conversation
   * @param {Array} messages - Array of message objects {role: 'user'|'assistant', content: string}
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} - The generated response and metadata
   */
  async processChat(messages, options = {}) {
    if (!this._firebaseInitialized) {
      return {
        error: 'Firebase not initialized',
        success: false
      };
    }
    
    try {
      const processChatConversation = this._functions.httpsCallable('processChatConversation');
      
      const response = await processChatConversation({
        messages,
        model: this._defaultModel,
        options
      });
      
      return response.data;
    } catch (error) {
      console.error('Error processing chat:', error);
      return {
        error: error.message || 'Error processing chat',
        success: false
      };
    }
  }
  
  /**
   * Generates text using Grok AI
   * @param {string} prompt - The text prompt to generate from
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} - The generated text and metadata
   */
  async generateText(prompt, options = {}) {
    if (!this._firebaseInitialized) {
      return {
        error: 'Firebase not initialized',
        success: false
      };
    }
    
    try {
      const generateText = this._functions.httpsCallable('generateText');
      
      const response = await generateText({
        prompt,
        model: this._defaultModel,
        options
      });
      
      return response.data;
    } catch (error) {
      console.error('Error generating text:', error);
      return {
        error: error.message || 'Error generating text',
        success: false
      };
    }
  }
}

export default GrokAI;
