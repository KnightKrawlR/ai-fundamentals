/**
 * AI Fundamentals - Game Integration Example
 * This file demonstrates how to use the VertexAI client in a game
 */

import vertexAI from './vertexAI.js';

// DOM elements
const gameContainer = document.getElementById('game-container');
const topicSelector = document.getElementById('topic-selector');
const difficultySelector = document.getElementById('difficulty-selector');
const startGameBtn = document.getElementById('start-game');
const chatInput = document.getElementById('chat-input');
const sendMessageBtn = document.getElementById('send-message');
const messagesContainer = document.getElementById('messages-container');
const loadingIndicator = document.getElementById('loading-indicator');

// Game state
let currentGameSession = null;
let userId = null;

// Get current user ID (implement according to your auth system)
function getCurrentUserId() {
  // This is a placeholder - replace with your actual authentication method
  return firebase.auth().currentUser?.uid || 'anonymous-user';
}

// Initialize the game UI
function initGameUI() {
  // Hide chat interface until game starts
  document.querySelector('.chat-interface').style.display = 'none';
  
  // Show topic selection
  document.querySelector('.game-setup').style.display = 'block';
  
  // Setup event listeners
  startGameBtn.addEventListener('click', handleGameStart);
  sendMessageBtn.addEventListener('click', handleSendMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSendMessage();
  });
  
  // Get current user
  userId = getCurrentUserId();
}

// Handle game start
async function handleGameStart() {
  try {
    const topic = topicSelector.value;
    const difficulty = difficultySelector.value;
    
    if (!topic || !difficulty) {
      alert('Please select a topic and difficulty level');
      return;
    }
    
    // Show loading indicator
    toggleLoading(true);
    
    // Initialize game session with Vertex AI
    const gameSession = await vertexAI.initializeGameSession(topic, difficulty, userId);
    currentGameSession = gameSession;
    
    // Update UI to show chat interface
    document.querySelector('.game-setup').style.display = 'none';
    document.querySelector('.chat-interface').style.display = 'block';
    
    // Display initial AI message
    displayMessage(gameSession.initialResponse, 'ai');
    
  } catch (error) {
    console.error('Failed to start game:', error);
    alert('Failed to start game. Please try again.');
  } finally {
    toggleLoading(false);
  }
}

// Handle sending a message
async function handleSendMessage() {
  const messageText = chatInput.value.trim();
  
  if (!messageText || !currentGameSession) return;
  
  try {
    // Show user message immediately
    displayMessage(messageText, 'user');
    
    // Clear input
    chatInput.value = '';
    
    // Show loading indicator
    toggleLoading(true);
    
    // Send message to Vertex AI
    const response = await vertexAI.sendGameMessage(
      currentGameSession.sessionId,
      messageText,
      userId
    );
    
    // Display AI response
    displayMessage(response.aiResponse, 'ai');
    
  } catch (error) {
    console.error('Failed to send message:', error);
    displayMessage('Sorry, there was an error processing your message. Please try again.', 'error');
  } finally {
    toggleLoading(false);
  }
}

// Display a message in the chat
function displayMessage(text, sender) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', `message-${sender}`);
  
  const messageContent = document.createElement('p');
  messageContent.textContent = text;
  
  messageElement.appendChild(messageContent);
  messagesContainer.appendChild(messageElement);
  
  // Scroll to bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Toggle loading indicator
function toggleLoading(isLoading) {
  loadingIndicator.style.display = isLoading ? 'block' : 'none';
  sendMessageBtn.disabled = isLoading;
  startGameBtn.disabled = isLoading;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initGameUI); 