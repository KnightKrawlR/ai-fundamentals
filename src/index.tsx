import React from 'react';
import { createRoot } from 'react-dom/client';
import Game from './components/Game';
import './styles/main.css';

// Mount the Game component on the my-learning page
const gameRoot = document.getElementById('game-root');
if (gameRoot) {
  const root = createRoot(gameRoot);
  root.render(
    <React.StrictMode>
      <Game />
    </React.StrictMode>
  );
} 