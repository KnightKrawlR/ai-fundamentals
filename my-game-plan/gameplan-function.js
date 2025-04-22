// Firebase function for generating game plans with Grok - Enhanced with guardrails
// Add this to your functions/index.js file

const functions = require('firebase-functions');
const axios = require('axios');

// Environment variables for xAI/Grok
const GROK_API_KEY = process.env.GROK_API_KEY;
const GROK_API_URL = 'https://api.xai.com/v1/chat/completions';

// Generate Game Plan using Grok
exports.generateGamePlan = functions.https.onCall(async (data, context) => {
  // Ensure user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to use this feature.'
    );
  }
  
  try {
    // Validate input
    if (!data.projectDescription && !data.category) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'You must provide either a project description or select a category.'
      );
    }
    
    // Create enhanced prompt for game plan generation with category and topic
    const prompt = `
      Create a detailed implementation plan for the following project:
      "${data.projectDescription || 'A project in the selected category'}"
      
      ${data.category ? `Category: ${data.category}` : ''}
      ${data.topic ? `Topic: ${data.topic}` : ''}
      
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
    
    // Enhanced system message with guardrails
    const systemMessage = `
      You are a helpful AI assistant that creates detailed project implementation plans. 
      Only respond to questions about project planning, technology selection, and implementation strategies.
      For off-topic questions or casual conversation, politely redirect the user to describe their project instead.
      Always format your response as a valid JSON object with the specified structure.
      Ensure all URLs in resources are valid and point to reputable sources.
      For each technology recommended, provide a clear and concise description of its purpose and benefits.
    `;
    
    // Call Grok API
    const response = await axios.post(
      GROK_API_URL,
      {
        model: data.model || 'grok-2-instruct',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROK_API_KEY}`
        }
      }
    );
    
    // Parse the response
    const responseText = response.data.choices[0].message.content;
    let parsedResponse;
    
    try {
      // Extract JSON from the response
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                        responseText.match(/{[\s\S]*}/);
      
      const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : responseText;
      parsedResponse = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Provide a fallback structured response
      return {
        success: true,
        plan: [
          "Please provide more specific details about your project.",
          "Consider selecting a category and topic to get more targeted recommendations.",
          "Describe what you're trying to build and what problem it solves.",
          "Mention any specific technologies you're interested in using.",
          "Include any constraints or requirements for your project."
        ],
        technologies: [
          {
            name: "Recommended Technologies",
            description: "Select a category and provide project details to get specific technology recommendations."
          }
        ],
        resources: [
          {
            title: "AI Fundamentals Learning Resources",
            url: "https://ai-fundamentals.me/learning.html",
            type: "Learning Path"
          }
        ]
      };
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
    console.error('Error calling Grok API:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
