import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/functions';

// Firebase configuration - use direct values as this runs in the browser
const firebaseConfig = {
  apiKey: "AIzaSyAu8DLZc5Wq-Dcd8hCKEZQHFU8OMKrH-iw",
  authDomain: "ai-fundamentals-d7ab7.firebaseapp.com",
  projectId: "ai-fundamentals-d7ab7",
  storageBucket: "ai-fundamentals-d7ab7.appspot.com",
  messagingSenderId: "307417765018",
  appId: "1:307417765018:web:5c8735042329d66c96b804",
  measurementId: "G-TQYFL34EVP"
};

// Initialize Firebase
// Prevent multiple initializations
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app(); // If already initialized, use that one
}

export const auth = firebase.auth();
export const firestore = firebase.firestore();
export const functions = firebase.functions();

// This will only run in development environments where process is defined
if (typeof window !== 'undefined' && 
    typeof process !== 'undefined' && 
    process.env && 
    process.env.NODE_ENV === 'development') {
  // functions.useEmulator('localhost', 5001);
  // firestore.useEmulator('localhost', 8080);
  // auth.useEmulator('http://localhost:9099');
}

export default firebase; 