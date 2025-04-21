import { auth } from '../firebase';

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

export const checkCreditsThreshold = (credits) => {
  const LOW_CREDIT_THRESHOLD = 20;
  return credits !== null && credits <= LOW_CREDIT_THRESHOLD;
}; 