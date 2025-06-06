// Enhanced my-games-index.js with better error handling and debugging
import React from 'react';
import ReactDOM from 'react-dom';
import MyGames from './components/MyGames';
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

console.log('my-games-index.js loaded');
showDebugOnPage('my-games-index.js loaded');

// Create a simple UI immediately to show the component is loading
const createLoadingUI = () => {
  const rootElement = document.getElementById('my-games-root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; height: 300px; flex-direction: column;">
        <div style="border: 4px solid #5D3FD3; border-top: 4px solid transparent; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite;"></div>
        <p style="margin-top: 20px; color: #5D3FD3;">Loading My Games...</p>
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

// Ensure Firebase is correctly initialized
const ensureFirebase = () => {
  // Check if Firebase is available from window.firebase (from CDN scripts)
  if (window.firebase && typeof window.firebase === 'object') {
    console.log('Firebase found from window.firebase');
    // Ensure window.firebase is properly initialized with our project
    if (!window.firebase.apps?.length) {
      window.firebase.initializeApp({
        apiKey: "AIzaSyDjMisQkMgdA6qNg7gnXDumhNOOWOD-Y00",
        authDomain: "ai-fundamentals-ad37d.firebaseapp.com",
        projectId: "ai-fundamentals-ad37d",
        storageBucket: "ai-fundamentals-ad37d.appspot.com",
        messagingSenderId: "668115447112",
        appId: "1:668115447112:web:c0772e9f8c6a498737977d",
        measurementId: "G-2D5V39EQ3T"
      });
    }
    return window.firebase;
  }
  
  // If window.firebase is not available, create a mock Firebase object
  console.warn('Firebase not found in window - creating mock object');
  const mockFirebase = {
    auth: () => ({
      onAuthStateChanged: (callback) => {
        callback(null);
        return () => {}; // return unsubscribe function
      },
      currentUser: null,
      signInWithEmailAndPassword: () => Promise.reject(new Error('Firebase not available'))
    }),
    firestore: () => ({
      collection: () => ({
        doc: () => ({
          get: () => Promise.resolve({ exists: false, data: () => ({}) })
        })
      })
    }),
    functions: () => ({
      httpsCallable: () => () => Promise.reject(new Error('Firebase not available'))
    })
  };
  
  return mockFirebase;
};

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded event fired for games component');
  showDebugOnPage('DOMContentLoaded event fired');
  
  try {
    const rootElement = checkElementExists('my-games-root');
    if (!rootElement) return;
    
    // Make sure Firebase is initialized
    console.log('Checking for Firebase...');
    showDebugOnPage('Checking for Firebase...');
    
    // Get Firebase instance (real or mock)
    const firebase = ensureFirebase();
    
    console.log('Initializing React for games component');
    showDebugOnPage('Initializing React for games component');
    
    // React 17 way of rendering components
    ReactDOM.render(
      <React.StrictMode>
        <ErrorBoundary>
          <MyGames firebaseProp={firebase} />
        </ErrorBoundary>
      </React.StrictMode>,
      rootElement
    );
    
    console.log('React component rendered successfully for games');
    showDebugOnPage('React component rendered successfully');
  } catch (error) {
    console.error('Error initializing React for games component:', error);
    showErrorOnPage('React Initialization Error', error.message);
  }
});
