// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Your web app's Firebase configuration
// Replace this with the config object you copied from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDjMIsQKMgdA6qNg7gnXDumhNOOWOD-Y00",
  authDomain: "ai-fundamentals-ad37d.firebaseapp.com",
  projectId: "ai-fundamentals-ad37d",
  storageBucket: "ai-fundamentals-ad37d.firebasestorage.app",
  messagingSenderId: "668115447112",
  appId: "1:668115447112:web:c0772e9f8c6a498737977d",
  measurementId: "G-2D5V39EQ3T"
};

// Initialize Firebase  
const app = initializeApp(firebaseConfig) ;
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
