// auth-integration.js
// Handles Google OAuth authentication and user management

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut 
} from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDjMisQkMgdA6qNg7gnXDumhNOOWOD-Y00",
    authDomain: "ai-fundamentals-ad37d.firebaseapp.com",
    projectId: "ai-fundamentals-ad37d",
    storageBucket: "ai-fundamentals-ad37d.firebasestorage.app",
    messagingSenderId: "668115447112",
    appId: "1:668115447112:web:c0772e9f8c6a498737977d",
    measurementId: "G-2D5V39EQ3T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Configuration for Google OAuth
const googleAuthConfig = {
  clientId: 'YOUR_GOOGLE_CLIENT_ID', // Replace with your actual client ID in production
  scope: 'profile email',
  cookieName: 'ai_fundamentals_auth'
};

// User state
let currentUser = null;

// Initialize authentication when the page loads
document.addEventListener('DOMContentLoaded', function() {
  // Check if user is already logged in
  checkAuthStatus();
  
  // Set up login/logout buttons
  setupAuthButtons();
});

// Check if user is already authenticated
function checkAuthStatus() {
  // First check localStorage for user data
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    currentUser = JSON.parse(storedUser);
    updateUIForLoggedInUser(currentUser);
    return;
  }
  
  // If no stored user, check for auth cookie
  const authCookie = getCookie(googleAuthConfig.cookieName);
  if (authCookie) {
    try {
      const userData = JSON.parse(atob(authCookie));
      if (userData && userData.email) {
        currentUser = userData;
        localStorage.setItem('user', JSON.stringify(currentUser));
        updateUIForLoggedInUser(currentUser);
        return;
      }
    } catch (e) {
      console.error('Error parsing auth cookie:', e);
    }
  }
  
  // If no valid auth data found, user is not logged in
  updateUIForLoggedOutUser();
}

// Set up Google OAuth login
function setupGoogleAuth() {
  // This would normally use the Google Sign-In API
  // For this demo, we'll simulate the OAuth flow
  
  // In a real implementation, you would include the Google Sign-In script:
  // <script src="https://accounts.google.com/gsi/client"></script>
  
  // And then initialize it like this:
  /*
  google.accounts.id.initialize({
    client_id: googleAuthConfig.clientId,
    callback: handleGoogleSignIn
  });
  
  google.accounts.id.renderButton(
    document.getElementById('google-signin-button'),
    { theme: 'outline', size: 'large', width: '100%' }
  );
  */
}

// Handle Google Sign-In callback
function handleGoogleSignIn(response) {
  // In a real implementation, you would verify the ID token with your backend
  // For this demo, we'll simulate a successful authentication
  
  // Decode the JWT token (this is simplified for demo purposes)
  // In a real app, you would send this token to your server for validation
  const payload = parseJwt(response.credential);
  
  if (payload && payload.email) {
    // Create user object
    const user = {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
      loginTime: new Date().toISOString()
    };
    
    // Save user to localStorage
    localStorage.setItem('user', JSON.stringify(user));
    currentUser = user;
    
    // Set auth cookie for cross-page authentication
    setCookie(googleAuthConfig.cookieName, btoa(JSON.stringify(user)), 7);
    
    // Update UI
    updateUIForLoggedInUser(user);
    
    // Redirect if needed
    const redirectUrl = getQueryParam('redirect');
    if (redirectUrl) {
      window.location.href = redirectUrl + '.html';
    }
  }
}

// Simulate Google Sign-In for demo purposes
function simulateGoogleSignIn(email, name) {
  const user = {
    id: 'user_' + Math.random().toString(36).substr(2, 9),
    name: name || 'Demo User',
    email: email || 'user@example.com',
    picture: null,
    loginTime: new Date().toISOString()
  };
  
  // Save user to localStorage
  localStorage.setItem('user', JSON.stringify(user));
  currentUser = user;
  
  // Set auth cookie for cross-page authentication
  setCookie(googleAuthConfig.cookieName, btoa(JSON.stringify(user)), 7);
  
  // Update UI
  updateUIForLoggedInUser(user);
  
  // Redirect if needed
  const redirectUrl = getQueryParam('redirect');
  if (redirectUrl) {
    window.location.href = redirectUrl + '.html';
  } else {
    // Default redirect to account page
    window.location.href = 'account.html';
  }
}

// Handle sign out
function signOut() {
  // Clear user data
  localStorage.removeItem('user');
  currentUser = null;
  
  // Clear auth cookie
  deleteCookie(googleAuthConfig.cookieName);
  
  // Update UI
  updateUIForLoggedOutUser();
  
  // Redirect to home page
  window.location.href = 'index.html';
}

// Update UI elements for logged in user
function updateUIForLoggedInUser(user) {
  const signInBtn = document.getElementById('sign-in-btn');
  const userMenu = document.getElementById('user-menu');
  const userAvatar = document.getElementById('user-avatar');
  const userEmail = document.getElementById('user-email');

  // Hide Sign In, Show User Menu container
  if (signInBtn) signInBtn.style.display = 'none';
  if (userMenu) userMenu.style.display = 'inline-block'; // Let CSS handle this from now on

  // Populate User Info
  if (user) {
    if (userEmail) {
      userEmail.textContent = user.email;
    }
    if (userAvatar) {
      userAvatar.textContent = user.email ? user.email[0].toUpperCase() : '?'; 
    }
  }
  
  updatePremiumAccess();
}

// Update UI elements for logged out user
function updateUIForLoggedOutUser() {
  const signInBtn = document.getElementById('sign-in-btn');
  const userMenu = document.getElementById('user-menu');

  // Show Sign In, Hide User Menu container
  if (signInBtn) signInBtn.style.display = 'inline-flex'; // Use inline-flex for the button
  if (userMenu) userMenu.style.display = 'none';
  
  updatePremiumAccess();
}

// Update premium content access based on subscription status
function updatePremiumAccess() {
  const premiumContent = document.querySelectorAll('.premium-content');
  const premiumButtons = document.querySelectorAll('.premium-button');
  
  // Check if user has active subscription
  const hasAccess = hasActiveSubscription();
  
  premiumContent.forEach(element => {
    element.classList.toggle('locked', !hasAccess);
  });
  
  premiumButtons.forEach(button => {
    if (hasAccess) {
      button.textContent = 'Access Premium';
      button.href = 'account.html#games';
    } else {
      button.textContent = 'Upgrade to Premium';
      button.href = 'payment.html';
    }
  });
}

// Check if user has an active subscription
function hasActiveSubscription() {
  // If not logged in, definitely no subscription
  if (!currentUser) return false;
  
  // Check subscription status in user data
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.subscription && user.subscription.status === 'active') {
    return true;
  }
  
  return false;
}

// Set up login/logout buttons
function setupAuthButtons() {
  // Set up login buttons
  const loginButtons = document.querySelectorAll('.login-button');
  loginButtons.forEach(button => {
    button.addEventListener('click', function(event) {
      event.preventDefault();
      window.location.href = 'login.html' + (window.location.search || '');
    });
  });
  
  // Set up logout buttons
  const logoutButtons = document.querySelectorAll('.logout-button');
  logoutButtons.forEach(button => {
    button.addEventListener('click', function(event) {
      event.preventDefault();
      signOut();
    });
  });
}

// Helper function to parse JWT token
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error parsing JWT:', e);
    return null;
  }
}

// Helper function to get query parameters
function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Cookie helper functions
function setCookie(name, value, days) {
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = '; expires=' + date.toUTCString();
  }
  document.cookie = name + '=' + value + expires + '; path=/';
}

function getCookie(name) {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function deleteCookie(name) {
  document.cookie = name + '=; Max-Age=-99999999; path=/';
}

// Authentication functions
export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        throw error;
    }
};

export const signInWithEmail = async (email, password) => {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return result.user;
    } catch (error) {
        throw error;
    }
};

export const handleSignOut = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        throw error;
    }
};

// Auth state observer
export const initAuthStateObserver = (callback) => {
    return onAuthStateChanged(auth, (user) => {
        callback(user);
    });
};

// Get current user
export const getCurrentUser = () => {
    return auth.currentUser;
};

// Export functions for use in other scripts
window.authIntegration = {
  checkAuthStatus: checkAuthStatus,
  simulateGoogleSignIn: simulateGoogleSignIn,
  signOut: signOut,
  hasActiveSubscription: hasActiveSubscription,
  getCurrentUser: function() { return currentUser; }
};
