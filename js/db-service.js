import { db } from './firebase-config.js';
import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, addDoc, 
  query, where, orderBy, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// User profile functions
export const userService = {
  // Get user profile by ID
  getUserProfile: async function(userId)  {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return { id: userSnap.id, ...userSnap.data() };
      } else {
        console.log("No user profile found");
        return null;
      }
    } catch (error) {
      console.error("Error getting user profile:", error);
      return null;
    }
  },
  
  // Create or update user profile  
  saveUserProfile: async function(userId, profileData) {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        ...profileData,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      return true;
    } catch (error) {
      console.error("Error saving user profile:", error);
      return false;
    }
  },
  
  // Update subscription plan 
  updateSubscriptionPlan: async function(userId, planName) {
    try {
      // Update user's plan
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        plan: planName,
        planUpdatedAt: serverTimestamp()
      });
      
      // Create subscription record
      const subscriptionsRef = collection(db, 'subscriptions');
      await addDoc(subscriptionsRef, {
        userId: userId,
        plan: planName,
        startDate: serverTimestamp(),
        status: 'active'
      });
      
      return true;
    } catch (error) {
      console.error("Error updating subscription:", error);
      return false;
    }
  }
};

// Learning progress functions
export const progressService = {
  // Save user progress for a course
  saveProgress: async function(userId, courseId, moduleId, progress) {
    try {
      // Create a unique ID for this progress entry
      const progressId = `${userId}_${courseId}_${moduleId}`;
      const progressRef = doc(db, 'progress', progressId);
      
      await setDoc(progressRef, {
        userId: userId,
        courseId: courseId,
        moduleId: moduleId,
        progress: progress,
        lastUpdated: serverTimestamp()
      }, { merge: true });
      
      return true;
    } catch (error) {
      console.error("Error saving progress:", error);
      return false;
    }
  },
  
  // Get user progress for a course
  getProgress: async function(userId, courseId, moduleId) {
    try {
      const progressId = `${userId}_${courseId}_${moduleId}`;
      const progressRef = doc(db, 'progress', progressId);
      const progressSnap = await getDoc(progressRef);
      
      if (progressSnap.exists()) {
        return progressSnap.data();
      } else {
        return { progress: 0 }; // Default progress
      }
    } catch (error) {
      console.error("Error getting progress:", error);
      return { progress: 0 }; // Default progress on error
    }
  }
};
