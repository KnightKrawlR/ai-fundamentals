// Enhanced my-games-index.js with better error handling and debugging
import React from 'react';
import { createRoot } from 'react-dom/client';
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

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded event fired for games component');
  
  try {
    const rootElement = checkElementExists('my-games-root');
    if (!rootElement) return;
    
    console.log('Initializing React for games component');
    const root = createRoot(rootElement);
    
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <MyGames />
        </ErrorBoundary>
      </React.StrictMode>
    );
    console.log('React component rendered successfully for games');
  } catch (error) {
    console.error('Error initializing React for games component:', error);
    // Add visible error message to the page
    const errorDiv = document.createElement('div');
    errorDiv.style.color = 'red';
    errorDiv.style.padding = '20px';
    errorDiv.style.margin = '20px';
    errorDiv.style.border = '1px solid red';
    errorDiv.innerHTML = `<h3>React Initialization Error</h3><p>${error.message}</p>`;
    document.body.appendChild(errorDiv);
  }
});
