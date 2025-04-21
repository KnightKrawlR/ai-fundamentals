import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/functions';

// Firebase configuration - direct values for browser
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