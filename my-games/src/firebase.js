import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/functions';

// Firebase configuration - direct values for browser
const firebaseConfig = {
  apiKey: "AIzaSyDjMisQkMgdA6qNg7gnXDumhNOOWOD-Y00",
  authDomain: "ai-fundamentals-ad37d.firebaseapp.com",
  projectId: "ai-fundamentals-ad37d",
  storageBucket: "ai-fundamentals-ad37d.appspot.com",
  messagingSenderId: "668115447112",
  appId: "1:668115447112:web:c0772e9f8c6a498737977d",
  measurementId: "G-2D5V39EQ3T"
};

// Initialize Firebase
// Prevent multiple initializations
let firebaseApp;
if (!firebase.apps.length) {
  firebaseApp = firebase.initializeApp(firebaseConfig);
} else {
  firebaseApp = firebase.app(); // If already initialized, use that one
}

export const auth = firebase.auth();
export const firestore = firebase.firestore();
export const functions = firebase.functions();

// No development environment check - remove entirely to avoid process references

export default firebase; 