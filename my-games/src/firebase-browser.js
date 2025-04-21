/**
 * Firebase browser implementation
 * This file provides a fallback for environments where the Firebase module imports fail
 * It expects the Firebase SDK to be loaded via script tags in the HTML
 */

// Check if firebase is available globally (loaded via script tag)
let auth, firestore, functions, firebase;

if (typeof window !== 'undefined' && window.firebase) {
  // Use the globally available firebase object
  firebase = window.firebase;
  
  // Initialize Firebase if not already initialized
  if (!firebase.apps || !firebase.apps.length) {
    firebase.initializeApp({
      apiKey: "AIzaSyDjMisQkMgdA6qNg7gnXDumhNOOWOD-Y00",
      authDomain: "ai-fundamentals-ad37d.firebaseapp.com",
      projectId: "ai-fundamentals-ad37d",
      storageBucket: "ai-fundamentals-ad37d.appspot.com",
      messagingSenderId: "668115447112",
      appId: "1:668115447112:web:c0772e9f8c6a498737977d",
      measurementId: "G-2D5V39EQ3T"
    });
  }
  
  // Get services
  auth = firebase.auth();
  firestore = firebase.firestore();
  functions = firebase.functions();
} else {
  // Fallback for when firebase is not available
  // Create mock objects to prevent errors
  console.error('Firebase is not loaded via script tag. Some features will not work.');
  
  // Create placeholder objects
  auth = {
    onAuthStateChanged: (callback) => { 
      callback(null);
      return () => {}; 
    },
    currentUser: null,
    signInWithEmailAndPassword: () => Promise.reject(new Error('Firebase not loaded')),
    signOut: () => Promise.reject(new Error('Firebase not loaded'))
  };
  
  firestore = {
    collection: () => ({
      doc: () => ({
        get: () => Promise.resolve({ exists: false, data: () => ({}) }),
        set: () => Promise.reject(new Error('Firebase not loaded')),
        update: () => Promise.reject(new Error('Firebase not loaded'))
      }),
      where: () => ({
        get: () => Promise.resolve({ docs: [] })
      })
    })
  };
  
  functions = {
    httpsCallable: () => () => Promise.reject(new Error('Firebase not loaded'))
  };
  
  firebase = { auth: () => auth, firestore: () => firestore, functions: () => functions };
}

export { auth, firestore, functions };
export default firebase; 