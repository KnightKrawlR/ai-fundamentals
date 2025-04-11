// Firebase authentication fix for AI Fundamentals
// Changes from popup-based to redirect-based authentication

// Initialize Firebase Auth
function initializeFirebaseAuth() {
  // Check if Firebase is already initialized
  if (!firebase.apps.length) {
    // Firebase configuration should be loaded from firebase-config.js
    try {
      firebase.initializeApp(firebaseConfig);
    } catch (error) {
      console.error("Firebase initialization error:", error);
    }
  }
  
  return firebase.auth();
}

// Get auth instance
const auth = initializeFirebaseAuth();

// Google Auth Provider
const googleProvider = new firebase.auth.GoogleAuthProvider();

// Function to handle Google Sign In - changed from popup to redirect
function signInWithGoogle() {
  // Use redirect instead of popup to avoid the popup error
  auth.signInWithRedirect(googleProvider)
    .catch((error) => {
      console.error("Error during Google sign in redirect:", error);
      showAuthError("Authentication error. Please try again.");
    });
}

// Handle redirect result when page loads
function handleRedirectResult() {
  auth.getRedirectResult()
    .then((result) => {
      if (result.user) {
        // User successfully signed in
        console.log("Successfully signed in with Google");
        window.location.href = "account.html"; // Redirect to account page
      }
    })
    .catch((error) => {
      console.error("Error completing sign in after redirect:", error);
      showAuthError("Authentication error. Please try again.");
    });
}

// Show authentication error message
function showAuthError(message) {
  const errorElement = document.getElementById('auth-error');
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = "block";
  } else {
    // Create error element if it doesn't exist
    const loginForm = document.querySelector('.login-form') || document.querySelector('.auth-container');
    if (loginForm) {
      const errorDiv = document.createElement('div');
      errorDiv.id = 'auth-error';
      errorDiv.className = 'auth-error';
      errorDiv.textContent = message;
      errorDiv.style.color = 'red';
      errorDiv.style.marginBottom = '15px';
      errorDiv.style.textAlign = 'center';
      
      // Insert at the top of the form
      loginForm.insertBefore(errorDiv, loginForm.firstChild);
    }
  }
}

// Check auth state
auth.onAuthStateChanged((user) => {
  if (user) {
    // User is signed in
    console.log("User is signed in:", user.email);
    updateUIForSignedInUser(user);
  } else {
    // User is signed out
    console.log("User is signed out");
    updateUIForSignedOutUser();
  }
});

// Update UI for signed in user
function updateUIForSignedInUser(user) {
  // Update sign in button to show user is logged in
  const signInButton = document.querySelector('.sign-in-button') || document.querySelector('[href*="login.html"]');
  if (signInButton) {
    signInButton.textContent = 'My Account';
    signInButton.href = 'account.html';
  }
  
  // Update any "Sign In to Access" buttons
  const accessButtons = document.querySelectorAll('[href*="login.html"]');
  accessButtons.forEach(button => {
    if (button.textContent.includes('Sign In to Access')) {
      button.href = button.getAttribute('data-target') || 'account.html';
      button.textContent = 'Access Content';
    }
  });
}

// Update UI for signed out user
function updateUIForSignedOutUser() {
  // No specific changes needed for signed out state
  // The default UI is already for signed out users
}

// Call this when the page loads
document.addEventListener('DOMContentLoaded', function() {
  // Handle redirect result
  handleRedirectResult();
  
  // Add event listener to Google sign in button
  const googleButton = document.querySelector('.google-btn') || document.querySelector('button[aria-label="Sign in with Google"]');
  if (googleButton) {
    googleButton.addEventListener('click', signInWithGoogle);
  }
  
  // Demo login functionality
  const demoLoginButton = document.querySelector('.demo-login-btn') || document.getElementById('demo-login');
  if (demoLoginButton) {
    demoLoginButton.addEventListener('click', function() {
      // Simulate login with demo account
      localStorage.setItem('demoUser', JSON.stringify({
        displayName: 'Demo User',
        email: 'demo@example.com',
        photoURL: null,
        isDemo: true
      }));
      window.location.href = 'account.html';
    });
  }
});
