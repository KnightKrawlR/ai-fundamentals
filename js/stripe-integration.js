// stripe-integration.js
// Handles Stripe payment processing for premium subscriptions

// Initialize Stripe with publishable key (replace with your actual key in production)
const stripePublishableKey = 'pk_test_TYooMQauvdEDq54NiTphI7jx';

// Initialize Stripe elements
let stripe;
let elements;
let card;
let paymentIntentClientSecret;

// Subscription plans
const plans = {
  monthly: {
    id: 'price_monthly',
    name: 'Premium',
    price: 9.99,
    interval: 'month'
  },
  lifetime: {
    id: 'price_lifetime',
    name: 'Lifetime',
    price: 199,
    interval: 'one-time'
  }
};

// Initialize Stripe when the page loads
document.addEventListener('DOMContentLoaded', function() {
  // Initialize Stripe only if we're on a payment page
  const paymentForm = document.getElementById('payment-form');
  if (paymentForm) {
    initializeStripe();
  }
  
  // Add event listeners to upgrade buttons
  setupUpgradeButtons();
});

// Initialize Stripe and Elements
function initializeStripe() {
  stripe = Stripe(stripePublishableKey);
  elements = stripe.elements();
  
  // Create card element
  card = elements.create('card', {
    style: {
      base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4'
        }
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
      }
    }
  });
  
  // Mount the card element
  card.mount('#card-element');
  
  // Handle real-time validation errors
  card.on('change', function(event) {
    const displayError = document.getElementById('card-errors');
    if (event.error) {
      displayError.textContent = event.error.message;
    } else {
      displayError.textContent = '';
    }
  });
  
  // Handle form submission
  const form = document.getElementById('payment-form');
  form.addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Disable the submit button to prevent multiple submissions
    document.getElementById('submit-button').disabled = true;
    
    // Get the selected plan
    const planSelect = document.getElementById('plan-select');
    const selectedPlan = plans[planSelect.value];
    
    // Create payment method and confirm payment
    createPaymentMethod(selectedPlan);
  });
}

// Create a payment method and confirm payment
function createPaymentMethod(plan) {
  stripe.createPaymentMethod({
    type: 'card',
    card: card,
    billing_details: {
      email: document.getElementById('email').value,
    },
  }).then(function(result) {
    if (result.error) {
      // Show error to customer
      const errorElement = document.getElementById('card-errors');
      errorElement.textContent = result.error.message;
      document.getElementById('submit-button').disabled = false;
    } else {
      // Send payment method ID to server
      createSubscription(result.paymentMethod.id, plan);
    }
  });
}

// Create a subscription on the server
function createSubscription(paymentMethodId, plan) {
  // In a real implementation, this would make an AJAX call to your server
  // For demo purposes, we'll simulate a successful subscription
  
  // Show loading state
  document.getElementById('payment-processing').style.display = 'block';
  
  // Simulate server request delay
  setTimeout(function() {
    // Hide loading state
    document.getElementById('payment-processing').style.display = 'none';
    
    // Show success message
    document.getElementById('payment-success').style.display = 'block';
    
    // Update user status in localStorage (in a real app, this would be server-side)
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    user.subscription = {
      plan: plan.id,
      status: 'active',
      startDate: new Date().toISOString(),
      endDate: plan.interval === 'month' ? 
        new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString() : 
        null
    };
    localStorage.setItem('user', JSON.stringify(user));
    
    // Redirect to account page after 2 seconds
    setTimeout(function() {
      window.location.href = 'account.html';
    }, 2000);
  }, 2000);
}

// Set up event listeners for upgrade buttons
function setupUpgradeButtons() {
  const upgradeButtons = document.querySelectorAll('.btn:not(.current-plan)');
  
  upgradeButtons.forEach(button => {
    button.addEventListener('click', function(event) {
      event.preventDefault();
      
      // Check if user is logged in
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.email) {
        // Redirect to login page if not logged in
        window.location.href = 'login.html?redirect=payment';
        return;
      }
      
      // Determine which plan was selected
      let planType = 'monthly';
      if (button.textContent.includes('Lifetime')) {
        planType = 'lifetime';
      }
      
      // Store selected plan in localStorage
      localStorage.setItem('selectedPlan', planType);
      
      // Redirect to payment page
      window.location.href = 'payment.html';
    });
  });
}

// Check if user has an active subscription
function hasActiveSubscription() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.subscription && user.subscription.status === 'active') {
    return true;
  }
  return false;
}

// Export functions for use in other scripts
window.stripeIntegration = {
  hasActiveSubscription: hasActiveSubscription
};
