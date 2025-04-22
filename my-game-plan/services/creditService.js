import firebase from '../firebase';

/**
 * Service for managing user credits
 */
const creditService = {
  /**
   * Get the current user's credits
   * @returns {Promise<number>} The user's current credit balance
   */
  getUserCredits: async () => {
    const user = firebase.auth().currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const doc = await firebase.firestore().collection('users').doc(user.uid).get();
    if (!doc.exists) {
      return 0;
    }
    
    return doc.data().credits || 0;
  },
  
  /**
   * Add credits to the user's account
   * @param {number} amount - The number of credits to add
   * @returns {Promise<void>}
   */
  addCredits: async (amount) => {
    const user = firebase.auth().currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const addCreditsFunction = firebase.functions().httpsCallable('addUserCredits');
    await addCreditsFunction({ credits: amount });
    
    // Return success
    return { success: true };
  },
  
  /**
   * Purchase credits using a simulated payment process
   * @param {number} amount - The number of credits to purchase
   * @returns {Promise<void>}
   */
  purchaseCredits: async (amount) => {
    const user = firebase.auth().currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Call the Firebase function to purchase credits
    const purchaseFunction = firebase.functions().httpsCallable('purchaseCredits');
    await purchaseFunction({ amount });
    
    // Return success
    return { success: true };
  }
};

export default creditService; 