// learning-index.js - Entry point for Learning React component
import React from 'react';
import { createRoot } from 'react-dom/client';
import Learning from './components/Learning';
import './styles/tailwind.css';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('learning-root');
  
  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <Learning />
      </React.StrictMode>
    );
  } else {
    console.error('Could not find learning-root element');
  }
}); 