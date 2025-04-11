import { authService } from './auth-service.js';

// Initialize auth state listener for navigation
authService.initAuthStateListener((user) => {
  updateNavigation(user);
});

// Update navigation based on auth state
function updateNavigation(user) {
  const loginButton = document.querySelector('.login-button');
  const accountLinks = document.querySelectorAll('.account-only');
  const guestLinks = document.querySelectorAll('.guest-only');
  const premiumContent = document.querySelectorAll('.premium-content');
  
  if (user) {
    // User is logged in
    if (loginButton) {
      loginButton.innerHTML = `<i class="fas fa-user"></i><span> My Account</span>`;
      loginButton.href = "account.html";
    }
    
    // Show account-only elements
    accountLinks.forEach(el => el.style.display = "block");
    
    // Hide guest-only elements
    guestLinks.forEach(el => el.style.display = "none");
    
    // Check user's plan for premium content
    const userId = user.uid;
    import('./db-service.js').then(module => {
      const { userService } = module;
      
      userService.getUserProfile(userId).then(userProfile => {
        if (userProfile) {
          const userPlan = userProfile.plan || 'Basic';
          
          // Show/hide premium content based on plan
          if (userPlan === "Premium" || userPlan === "Premium Plus") {
            premiumContent.forEach(el => el.style.display = "block");
            
            // Replace premium buttons with access buttons
            document.querySelectorAll(".premium-button").forEach(btn => {
              btn.textContent = "Access Content";
              btn.classList.remove("premium-button");
              btn.classList.add("access-button");
            });
          }
        }
      }).catch(error => {
        console.error("Error getting user data:", error);
      });
    });
  } else {
    // User is not logged in
    if (loginButton) {
      loginButton.innerHTML = `<i class="fas fa-sign-in-alt"></i><span> Sign In</span>`;
      loginButton.href = "login.html";
    }
    
    // Hide account-only elements 
    accountLinks.forEach(el => el.style.display = "none");
    
    // Show guest-only elements
    guestLinks.forEach(el => el.style.display = "block");
    
    // Hide premium content
    premiumContent.forEach(el => el.style.display = "none");
  }
}
