import React, { useEffect, useState } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

interface Game {
  id: string;
  name: string;
  description: string;
  icon: string;
  creditsRequired: number;
}

const MyGames: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [userCredits, setUserCredits] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGamesAndCredits = async () => {
      try {
        const user = firebase.auth().currentUser;
        if (!user) {
          setError('Please sign in to view your games');
          setLoading(false);
          return;
        }

        // Fetch user credits
        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        const credits = userDoc.data()?.credits || 0;
        setUserCredits(credits);

        // Fetch available games
        const gamesSnapshot = await firebase.firestore().collection('games').get();
        const gamesData = gamesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Game[];
        setGames(gamesData);
        setLoading(false);
      } catch (err) {
        setError('Error loading games. Please try again later.');
        setLoading(false);
      }
    };

    fetchGamesAndCredits();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Loading your games...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <i className="fas fa-exclamation-circle"></i>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="my-games">
      <div className="games-header">
        <h2>My Games</h2>
        <div className="credits-display">
          <i className="fas fa-coins"></i>
          <span>{userCredits} Credits Available</span>
        </div>
      </div>
      
      <div className="games-grid">
        {games.map(game => (
          <div key={game.id} className="game-card">
            <div className="game-icon">
              <i className={`fas ${game.icon}`}></i>
            </div>
            <div className="game-info">
              <h3>{game.name}</h3>
              <p>{game.description}</p>
              <div className="game-footer">
                <span className="credits-required">
                  <i className="fas fa-coins"></i>
                  {game.creditsRequired} Credits
                </span>
                <button 
                  className="play-button"
                  disabled={userCredits < game.creditsRequired}
                  onClick={() => {/* Add play game logic */}}
                >
                  {userCredits >= game.creditsRequired ? 'Play Now' : 'Need More Credits'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyGames; 