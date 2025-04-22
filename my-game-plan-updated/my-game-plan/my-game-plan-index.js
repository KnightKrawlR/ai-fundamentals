// my-game-plan-index.js - Entry point for the My Game-Plan React application
import React from 'react';
import ReactDOM from 'react-dom';
import MyGamePlan from './components/MyGamePlan';
import firebase from './firebase';
import ErrorBoundary from './components/ErrorBoundary';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
  const rootElement = document.getElementById('my-game-plan-root');
  
  // Check if user is logged in
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in, fetch user data
      firebase.firestore().collection('users').doc(user.uid).get()
        .then(doc => {
          if (doc.exists) {
            const userData = doc.data();
            const credits = userData.credits || 0;
            
            // Render the MyGamePlan component
            ReactDOM.render(
              <ErrorBoundary>
                <MyGamePlan 
                  credits={credits}
                  onAddCredits={(amount) => {
                    // Update credits in Firestore
                    return firebase.firestore()
                      .collection('users')
                      .doc(user.uid)
                      .update({
                        credits: firebase.firestore.FieldValue.increment(amount)
                      });
                  }}
                />
              </ErrorBoundary>,
              rootElement
            );
          }
        })
        .catch(error => {
          console.error('Error fetching user data:', error);
        });
    } else {
      // User is not signed in, redirect to login page
      window.location.href = '/login.html';
    }
  });
});
