import React from 'react';
import { createRoot } from 'react-dom/client';
import MyGames from './components/MyGames';

const container = document.getElementById('my-games-root');
if (container) {
  const root = createRoot(container);
  root.render(<MyGames />);
} 