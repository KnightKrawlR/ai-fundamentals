import { auth } from '../firebase';
import firebase from 'firebase/app';
import 'firebase/firestore';

const CREDITS_API_ENDPOINT = 'https://us-central1-ai-fundamentals-d7ab7.cloudfunctions.net/getUserCredits';
const ADD_CREDITS_API_ENDPOINT = 'https://us-central1-ai-fundamentals-d7ab7.cloudfunctions.net/addCredits';

export const getUserCredits = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    
    const idToken = await user.getIdToken();
    
    const response = await fetch(CREDITS_API_ENDPOINT, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching credits: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.credits;
  } catch (error) {
    console.error("Error getting user credits:", error);
    throw error;
  }
};

export const addCredits = async (amount) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    
    const idToken = await user.getIdToken();
    
    // This is a simulation of credit purchase
    // In a real implementation, this would involve payment processing
    const response = await fetch(ADD_CREDITS_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: user.uid,
        creditAmount: amount
      })
    });
    
    if (!response.ok) {
      throw new Error(`Error adding credits: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.newCreditBalance;
  } catch (error) {
    console.error("Error adding credits:", error);
    throw error;
  }
};

export const checkCreditsThreshold = (credits, threshold = 20) => {
  return credits <= threshold;
};

export const formatCredits = (credits) => {
  return `${credits} ${credits === 1 ? 'Credit' : 'Credits'}`;
};

export const getDaysUntilCreditRefresh = () => {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return lastDay - now.getDate() + 1;
};

export const addCreditsToAccount = async (userId, amount) => {
  try {
    const userRef = firebase.firestore().collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      throw new Error('User not found');
    }
    
    const currentCredits = userDoc.data().credits || 0;
    const newTotal = currentCredits + amount;
    
    await userRef.update({
      credits: newTotal,
      lastCreditPurchase: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    return {
      success: true,
      newTotal
    };
  } catch (error) {
    console.error('Error adding credits:', error);
    return {
      success: false,
      error: error.message
    };
  }
}; 