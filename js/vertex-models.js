/**
 * Vertex AI Models Configuration
 * This file contains the available models and configurations for Vertex AI.
 */

// Available Vertex AI model configurations
export const VERTEX_MODELS = {
  // Text generation models
  GEMINI_PRO: {
    name: 'gemini-pro',
    displayName: 'Gemini Pro',
    type: 'text',
    maxTokens: 8192,
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    creditCost: 1
  },
  GEMINI_PRO_VISION: {
    name: 'gemini-pro-vision',
    displayName: 'Gemini Pro Vision',
    type: 'multimodal',
    maxTokens: 4096,
    temperature: 0.4,
    topK: 32,
    topP: 1.0,
    creditCost: 2
  },
  
  // Chat-optimized models
  GEMINI_ULTRA: {
    name: 'gemini-ultra',
    displayName: 'Gemini Ultra',
    type: 'text',
    maxTokens: 8192,
    temperature: 0.2,
    topK: 40,
    topP: 0.8,
    creditCost: 5
  },
  
  // Game-specific models
  GAME_MODEL: {
    name: 'gemini-pro',
    displayName: 'Game AI',
    type: 'text',
    maxTokens: 4096,
    temperature: 0.9, // Higher for more creative responses
    topK: 40,
    topP: 1.0,
    creditCost: 3
  }
};

// Default model options
export const DEFAULT_MODEL_OPTIONS = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 1024
};

// Function to get model configuration
export function getModelConfig(modelName) {
  const model = Object.values(VERTEX_MODELS).find(m => m.name === modelName);
  return model || VERTEX_MODELS.GEMINI_PRO;
}

// Function to get default parameters for a specific model
export function getDefaultModelParams(modelName) {
  const model = getModelConfig(modelName);
  return {
    temperature: model.temperature,
    topK: model.topK,
    topP: model.topP,
    maxOutputTokens: model.maxTokens > 2048 ? 2048 : model.maxTokens / 2
  };
}

// Export credit costs for different operations
export const CREDIT_COSTS = {
  TEXT_GENERATION: 1,
  CHAT_MESSAGE: 1,
  IMAGE_GENERATION: 5,
  GAME_SESSION: 3,
  GAME_MESSAGE: 1
}; 