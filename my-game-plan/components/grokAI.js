// grokAI.js - Direct integration with Grok AI via X.AI API
import firebase from '../firebase';

// Grok API configuration - MATCHING EXACTLY the implementation from My Games
const GROK_API_KEY = "xai-U4MUdbjklO1fx8fkxiXxHoVvwRbqwtNPpeMXy1WCFhqMtdMzKwfHDFuvuPF1Y5az9jR6QB23FZuHY3ik";
const GROK_API_URL = "https://api.x.ai/v1";
const GROK_MODEL = "grok-2-latest";

// Base URL for HTTP functions (as fallback only)
const FUNCTION_BASE_URL = 'https://us-central1-ai-fundamentals-ad37d.cloudfunctions.net';

class GrokAI {
  constructor() {
    this._defaultModel = GROK_MODEL;
    this._firebaseInitialized = false;
    this._clientFallbackMode = false;
    
    // Check if Firebase is initialized
    if (typeof firebase !== 'undefined' && firebase.app()) {
      this._firebaseInitialized = true;
      this._functions = firebase.functions();
    }
  }
  
  /**
   * Makes a direct call to the Grok API
   * @param {Object} messages - The messages to send to the Grok API
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - The response from Grok API
   * @private
   */
  async _callGrokAPI(messages, options = {}) {
    try {
      console.log('Making direct Grok API call with messages:', messages);
      
      const response = await fetch(`${GROK_API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROK_API_KEY}`
        },
        body: JSON.stringify({
          model: this._defaultModel,
          messages: messages,
          temperature: options.temperature || 0.7,
          max_tokens: options.max_tokens || 2000,
          top_p: options.top_p || 0.9
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Grok API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Grok API response:', data);
      
      // Extract response text
      const responseText = data.choices[0].message.content;
      return responseText;
    } catch (error) {
      console.error('Error calling Grok API:', error);
      throw error;
    }
  }
  
  /**
   * Generates a game plan using Grok AI - direct API call with client-side fallback
   * @param {string} projectDescription - Description of the project
   * @param {string} category - Optional category for the project
   * @param {string} topic - Optional topic within the category
   * @returns {Promise<Object>} - The generated game plan
   */
  async generateGamePlan(projectDescription, category = '', topic = '') {
    // Always use direct API now
    try {
      console.log('Generating game plan with Grok API directly');
      
      // Create enhanced prompt for game plan generation with category and topic
      const promptContent = `
        Create a detailed implementation plan for the following project:
        "${projectDescription || 'A project in the selected category'}"
        
        ${category ? `Category: ${category}` : ''}
        ${topic ? `Topic: ${topic}` : ''}
        
        Provide the following:
        1. A step-by-step implementation plan (at least 5 steps)
        2. Recommended technologies with brief descriptions
        3. Learning resources (tutorials, documentation, courses)
        
        Format the response as a structured JSON object with these fields:
        {
          "plan": ["step 1", "step 2", ...],
          "technologies": [{"name": "Tech Name", "description": "Brief description"}, ...],
          "resources": [{"title": "Resource Title", "url": "URL", "type": "Tutorial/Documentation/Course"}, ...]
        }
      `;
      
      // System message with guardrails
      const systemMessage = `
        You are a helpful AI assistant that creates detailed project implementation plans. 
        Only respond to questions about project planning, technology selection, and implementation strategies.
        For off-topic questions or casual conversation, politely redirect the user to describe their project instead.
        Always format your response as a valid JSON object with the specified structure.
        Ensure all URLs in resources are valid and point to reputable sources.
        For each technology recommended, provide a clear and concise description of its purpose and benefits.
      `;
      
      const messages = [
        { role: "system", content: systemMessage },
        { role: "user", content: promptContent }
      ];
      
      // Make the direct API call
      const responseText = await this._callGrokAPI(messages);
      
      // Parse the JSON from the response
      let parsedResponse;
      try {
        // Extract JSON from the response
        const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                        responseText.match(/{[\s\S]*}/);
        
        const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : responseText;
        parsedResponse = JSON.parse(jsonString);
      } catch (parseError) {
        console.error('Error parsing Grok AI response:', parseError);
        return this._generateClientSideFallback({
          projectDescription, 
          category, 
          topic
        });
      }
      
      // Validate the response structure and provide fallbacks if needed
      if (!parsedResponse.plan || !Array.isArray(parsedResponse.plan) || parsedResponse.plan.length === 0) {
        parsedResponse.plan = ["Please provide more specific details about your project to get a customized implementation plan."];
      }
      
      if (!parsedResponse.technologies || !Array.isArray(parsedResponse.technologies) || parsedResponse.technologies.length === 0) {
        parsedResponse.technologies = [
          {
            name: "Recommended Technologies",
            description: "Please provide more specific project details to get technology recommendations."
          }
        ];
      }
      
      if (!parsedResponse.resources || !Array.isArray(parsedResponse.resources) || parsedResponse.resources.length === 0) {
        parsedResponse.resources = [
          {
            title: "AI Fundamentals Learning Resources",
            url: "https://ai-fundamentals.me/learning.html",
            type: "Learning Path"
          }
        ];
      }
      
      // Ensure all resources have valid URLs
      parsedResponse.resources = parsedResponse.resources.map(resource => {
        if (!resource.url || !resource.url.startsWith('http')) {
          resource.url = `https://ai-fundamentals.me/search.html?q=${encodeURIComponent(resource.title || 'learning resources')}`;
        }
        return resource;
      });
      
      return {
        success: true,
        plan: parsedResponse.plan,
        technologies: parsedResponse.technologies,
        resources: parsedResponse.resources
      };
    } catch (error) {
      console.error('Error with direct Grok API call:', error);
      
      // If direct API fails, use client-side fallback
      console.log('Using client-side fallback after API failure');
      return this._generateClientSideFallback({
        projectDescription,
        category,
        topic
      });
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
    } else if (projectType.toLowerCase().includes('data')) {
      steps = [
        "Set up your data analysis environment with Python and tools like Pandas/NumPy.",
        "Collect and clean the relevant data sets.",
        "Perform exploratory data analysis to understand patterns.",
        "Build visualizations to communicate insights.",
        "Develop predictive models if applicable.",
        "Test and validate your analysis.",
        "Create a report or dashboard to share findings."
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
    } else if (projectType.toLowerCase().includes('data')) {
      technologies = [
        { name: "Python", description: "Popular programming language for data analysis and machine learning" },
        { name: "Pandas", description: "Data manipulation and analysis library for Python" },
        { name: "Matplotlib/Seaborn", description: "Visualization libraries for creating informative plots" },
        { name: "Scikit-learn", description: "Machine learning library for classification, regression, and clustering" }
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
   * Processes a chat conversation with the Grok API
   * @param {Array} messages - Array of message objects {role: 'user'|'assistant', content: string}
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} - The generated response and metadata
   */
  async processChat(messages, options = {}) {
    try {
      // Format messages for Grok API
      const formattedMessages = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));
      
      // Add a system message if none exists
      if (!formattedMessages.some(m => m.role === 'system')) {
        formattedMessages.unshift({
          role: 'system',
          content: 'You are a helpful AI assistant.'
        });
      }
      
      // Call the Grok API directly
      const responseText = await this._callGrokAPI(formattedMessages, options);
      
      return {
        text: responseText,
        success: true
      };
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
    try {
      // Format as a simple user message
      const messages = [
        { role: 'system', content: 'You are a helpful AI assistant.' },
        { role: 'user', content: prompt }
      ];
      
      // Call the Grok API directly
      const responseText = await this._callGrokAPI(messages, options);
      
      return {
        text: responseText,
        success: true
      };
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
