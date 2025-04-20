// Enhanced learning-index.js with better error handling and debugging
import React from 'react';
import { createRoot } from 'react-dom/client';
import Learning from './components/Learning';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/tailwind.css';

// Function to check if an element exists and log appropriate messages
function checkElementExists(id) {
  const element = document.getElementById(id);
  if (!element) {
    console.error(`Could not find element with id: ${id}`);
    // Add visible error message to the page
    const errorDiv = document.createElement('div');
    errorDiv.style.color = 'red';
    errorDiv.style.padding = '20px';
    errorDiv.style.margin = '20px';
    errorDiv.style.border = '1px solid red';
    errorDiv.innerHTML = `<h3>React Mount Error</h3><p>Could not find element with id: ${id}</p>`;
    document.body.appendChild(errorDiv);
    return null;
  }
  console.log(`Found element with id: ${id}`);
  return element;
}

// Function to create a visible error message on the page
function showErrorOnPage(title, message) {
  const errorDiv = document.createElement('div');
  errorDiv.style.color = 'red';
  errorDiv.style.padding = '20px';
  errorDiv.style.margin = '20px';
  errorDiv.style.border = '1px solid red';
  errorDiv.innerHTML = `<h3>${title}</h3><p>${message}</p>`;
  document.body.appendChild(errorDiv);
}

// Function to create a visible debug message on the page
function showDebugOnPage(message) {
  if (window.location.search.includes('debug=true')) {
    const debugDiv = document.createElement('div');
    debugDiv.style.color = 'blue';
    debugDiv.style.padding = '10px';
    debugDiv.style.margin = '10px';
    debugDiv.style.border = '1px solid blue';
    debugDiv.style.fontSize = '12px';
    debugDiv.innerHTML = `<strong>Debug:</strong> ${message}`;
    document.body.appendChild(debugDiv);
  }
}

console.log('learning-index.js loaded');
showDebugOnPage('learning-index.js loaded');

// Create a simple UI immediately to show the component is loading
const createLoadingUI = () => {
  const rootElement = document.getElementById('learning-root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; height: 300px; flex-direction: column;">
        <div style="border: 4px solid #5D3FD3; border-top: 4px solid transparent; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite;"></div>
        <p style="margin-top: 20px; color: #5D3FD3;">Loading My Learning...</p>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
  }
};

// Show loading UI immediately
createLoadingUI();

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded event fired for learning component');
  showDebugOnPage('DOMContentLoaded event fired');
  
  try {
    const rootElement = checkElementExists('learning-root');
    if (!rootElement) return;
    
    // Make sure Firebase is initialized
    console.log('Checking for Firebase...');
    showDebugOnPage('Checking for Firebase...');
    
    if (!window.firebase) {
      const errorMsg = 'Firebase is not initialized. Please check your Firebase configuration.';
      console.error(errorMsg);
      showErrorOnPage('Firebase Error', errorMsg);
      return;
    }
    
    console.log('Firebase found:', typeof window.firebase);
    showDebugOnPage(`Firebase found: ${typeof window.firebase}`);
    
    // Check for Firebase auth
    if (!window.firebase.auth) {
      const errorMsg = 'Firebase Auth is not initialized. Please check your Firebase configuration.';
      console.error(errorMsg);
      showErrorOnPage('Firebase Auth Error', errorMsg);
      return;
    }
    
    console.log('Firebase Auth found');
    showDebugOnPage('Firebase Auth found');
    
    // Check for Firebase Firestore
    if (!window.firebase.firestore) {
      const errorMsg = 'Firebase Firestore is not initialized. Please check your Firebase configuration.';
      console.error(errorMsg);
      showErrorOnPage('Firebase Firestore Error', errorMsg);
      return;
    }
    
    console.log('Firebase Firestore found');
    showDebugOnPage('Firebase Firestore found');
    
    console.log('Initializing React for learning component');
    showDebugOnPage('Initializing React for learning component');
    
    const root = createRoot(rootElement);
    
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <Learning firebase={window.firebase} />
        </ErrorBoundary>
      </React.StrictMode>
    );
    console.log('React component rendered successfully for learning');
    showDebugOnPage('React component rendered successfully');
  } catch (error) {
    console.error('Error initializing React for learning component:', error);
    showErrorOnPage('React Initialization Error', error.message);
  }
});
