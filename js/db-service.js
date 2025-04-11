// access-control.js
// Handles access control for premium content based on authentication and subscription status

// Initialize access control when the page loads
document.addEventListener('DOMContentLoaded', function() {
  // Check authentication and subscription status
  checkAccessStatus();
  
  // Set up event listeners for premium content links
  setupPremiumContentLinks();
});

// Check user authentication and subscription status
function checkAccessStatus() {
  // Get current user and subscription status
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const hasSubscription = window.stripeIntegration && 
                         typeof window.stripeIntegration.hasActiveSubscription === 'function' && 
                         window.stripeIntegration.hasActiveSubscription();
  
  // Update UI based on access status
  updatePremiumContentUI(user, hasSubscription);
  updateNavigationUI(user, hasSubscription);
  
  return {
    isAuthenticated: !!user.email,
    hasSubscription: hasSubscription
  };
}

// Update premium content UI based on access status
function updatePremiumContentUI(user, hasSubscription) {
  // Get all premium content elements
  const premiumContent = document.querySelectorAll('.premium-content');
  const premiumButtons = document.querySelectorAll('.premium-button');
  const lockedOverlays = document.querySelectorAll('.locked-overlay');
  
  if (!user.email || !hasSubscription) {
    // User is not authenticated or doesn't have subscription
    
    // Show locked overlays
    lockedOverlays.forEach(overlay => {
      overlay.style.display = 'flex';
    });
    
    // Add locked class to premium content
    premiumContent.forEach(content => {
      content.classList.add('locked');
    });
    
    // Update premium buttons to point to payment page
    premiumButtons.forEach(button => {
      const originalHref = button.getAttribute('data-original-href') || button.getAttribute('href');
      if (!button.getAttribute('data-original-href')) {
        button.setAttribute('data-original-href', originalHref);
      }
      
      if (!user.email) {
        button.setAttribute('href', 'login.html?redirect=' + encodeURIComponent(originalHref.split('.')[0]));
        button.textContent = 'Sign In to Access';
      } else {
        button.setAttribute('href', 'payment.html');
        button.textContent = 'Upgrade to Access';
      }
    });
  } else {
    // User is authenticated and has subscription
    
    // Hide locked overlays
    lockedOverlays.forEach(overlay => {
      overlay.style.display = 'none';
    });
    
    // Remove locked class from premium content
    premiumContent.forEach(content => {
      content.classList.remove('locked');
    });
    
    // Restore original links for premium buttons
    premiumButtons.forEach(button => {
      const originalHref = button.getAttribute('data-original-href');
      if (originalHref) {
        button.setAttribute('href', originalHref);
        button.textContent = 'Access Premium';
      }
    });
  }
}

// Update navigation UI based on access status
function updateNavigationUI(user, hasSubscription) {
  // Update account/login links
  const accountLinks = document.querySelectorAll('.account-link');
  const loginLinks = document.querySelectorAll('.login-link');
  
  if (user.email) {
    // User is authenticated
    accountLinks.forEach(link => {
      link.style.display = 'inline-block';
      if (link.querySelector('.user-name')) {
        link.querySelector('.user-name').textContent = user.name || user.email;
      }
    });
    
    loginLinks.forEach(link => {
      link.style.display = 'none';
    });
  } else {
    // User is not authenticated
    accountLinks.forEach(link => {
      link.style.display = 'none';
    });
    
    loginLinks.forEach(link => {
      link.style.display = 'inline-block';
    });
  }
  
  // Update premium indicators
  const premiumIndicators = document.querySelectorAll('.premium-indicator');
  
  if (hasSubscription) {
    premiumIndicators.forEach(indicator => {
      indicator.style.display = 'inline-block';
      if (indicator.querySelector('.subscription-type')) {
        const subscriptionType = user.subscription && user.subscription.plan === 'price_lifetime' ? 'Lifetime' : 'Premium';
        indicator.querySelector('.subscription-type').textContent = subscriptionType;
      }
    });
  } else {
    premiumIndicators.forEach(indicator => {
      indicator.style.display = 'none';
    });
  }
}

// Set up event listeners for premium content links
function setupPremiumContentLinks() {
  // Get access status
  const accessStatus = checkAccessStatus();
  
  // If user doesn't have access, intercept clicks on premium content
  if (!accessStatus.isAuthenticated || !accessStatus.hasSubscription) {
    const premiumLinks = document.querySelectorAll('.premium-content a');
    
    premiumLinks.forEach(link => {
      link.addEventListener('click', function(event) {
        // Prevent default navigation
        event.preventDefault();
        
        // Redirect based on authentication status
        if (!accessStatus.isAuthenticated) {
          window.location.href = 'login.html?redirect=games';
        } else {
          window.location.href = 'payment.html';
        }
      });
    });
  }
}

// Check if specific content is accessible
function isContentAccessible(contentType) {
  const accessStatus = checkAccessStatus();
  
  // Free content is always accessible
  if (contentType === 'free') {
    return true;
  }
  
  // Premium content requires authentication and subscription
  if (contentType === 'premium') {
    return accessStatus.isAuthenticated && accessStatus.hasSubscription;
  }
  
  // Default to requiring authentication
  return accessStatus.isAuthenticated;
}

// Export functions for use in other scripts
window.accessControl = {
  checkAccessStatus: checkAccessStatus,
  isContentAccessible: isContentAccessible,
  updatePremiumContentUI: function() {
    const accessStatus = checkAccessStatus();
    updatePremiumContentUI(
      JSON.parse(localStorage.getItem('user') || '{}'), 
      accessStatus.hasSubscription
    );
  }
};
