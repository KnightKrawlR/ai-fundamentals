// Firebase authentication fix for AI Fundamentals
// Changes from popup-based to redirect-based authentication

// Initialize Firebase Auth
const auth = firebase.auth();

// Google Auth Provider
const googleProvider = new firebase.auth.GoogleAuthProvider();

// Function to handle Google Sign In - changed from popup to redirect
function signInWithGoogle() {
  // Use redirect instead of popup to avoid the popup error
  auth.signInWithRedirect(googleProvider)
    .catch((error) => {
      console.error("Error during Google sign in redirect:", error);
      document.getElementById('auth-error').textContent = "Authentication error. Please try again.";
      document.getElementById('auth-error').style.display = "block";
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
      document.getElementById('auth-error').textContent = "Authentication error. Please try again.";
      document.getElementById('auth-error').style.display = "block";
    });
}

// Check auth state
auth.onAuthStateChanged((user) => {
  if (user) {
    // User is signed in
    console.log("User is signed in:", user.email);
  } else {
    // User is signed out
    console.log("User is signed out");
  }
});

// Call this when the page loads
document.addEventListener('DOMContentLoaded', function() {
  // Handle redirect result
  handleRedirectResult();
  
  // Add event listener to Google sign in button
  const googleButton = document.querySelector('.google-btn');
  if (googleButton) {
    googleButton.addEventListener('click', signInWithGoogle);
  }
});
