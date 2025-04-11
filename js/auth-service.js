// auth-service.js
import { auth } from './firebase-config.js';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// Google authentication provider 
const googleProvider = new GoogleAuthProvider();

export const authService = {
  // Sign in with Google
  signInWithGoogle: async function() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  },
  
  // Sign in with email/password 
  signInWithEmail: async function(email, password) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      console.error("Error signing in with email:", error);
      throw error;
    }
  },
  
  // Create account with email/password
  createAccount: async function(email, password) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      console.error("Error creating account:", error);
      throw error;
    }
  },
  
  // Sign out
  signOut: async function() {
    try {
      await signOut(auth);
      return true;
    } catch (error) {
      console.error("Error signing out:", error);
      return false;
    }
  },
  
  // Get current user
  getCurrentUser: function() {
    return auth.currentUser;
  },
  
  // Initialize auth state listener
  initAuthStateListener: function(callback) {
    return onAuthStateChanged(auth, callback);
  }
};
