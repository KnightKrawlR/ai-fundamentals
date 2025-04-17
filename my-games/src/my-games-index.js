// my-games-index.js - Entry point for My Games React component
import React from 'react';
import ReactDOM from 'react-dom';
import MyGames from './components/MyGames';
import './styles/tailwind.css';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('my-games-root');
  
  if (rootElement) {
    ReactDOM.render(
      <React.StrictMode>
        <MyGames />
      </React.StrictMode>,
      rootElement
    );
  } else {
    console.error('Could not find my-games-root element');
  }
});
