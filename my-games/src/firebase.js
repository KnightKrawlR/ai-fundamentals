import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/functions';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyAu8DLZc5Wq-Dcd8hCKEZQHFU8OMKrH-iw",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "ai-fundamentals-d7ab7.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "ai-fundamentals-d7ab7",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "ai-fundamentals-d7ab7.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "307417765018",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:307417765018:web:5c8735042329d66c96b804",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-TQYFL34EVP"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const firestore = firebase.firestore();
export const functions = firebase.functions();

// Use local emulator if in development
if (process.env.NODE_ENV === 'development') {
  // Uncomment these lines to use Firebase emulators during development
  // functions.useEmulator('localhost', 5001);
  // firestore.useEmulator('localhost', 8080);
  // auth.useEmulator('http://localhost:9099');
}

export default firebase; 