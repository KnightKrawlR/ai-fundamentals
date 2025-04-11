// Main JavaScript for AI Fundamentals website
document.addEventListener('DOMContentLoaded', function() {
    // Navigation scroll
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Check if user is logged in
    if (typeof firebase !== 'undefined') {
        firebase.auth().onAuthStateChanged(function(user) {
            updateUIForUser(user);
        });
    }
    
    // Update UI based on authentication state
    function updateUIForUser(user) {
        const loginButton = document.querySelector('.login-button');
        const premiumButtons = document.querySelectorAll('.premium-button');
        const lockedModules = document.querySelectorAll('.learning-module.locked');
        
        if (user) {
            // User is signed in
            if (loginButton) {
                loginButton.innerHTML = '<i class="fas fa-user-circle"></i> My Account';
                loginButton.href = 'account.html';
            }
            
            // Check if user has premium access (this is a placeholder, you would check this in your database)
            const hasPremium = false; // Replace with actual check
            
            if (hasPremium) {
                // User has premium access
                premiumButtons.forEach(button => {
                    button.textContent = 'Access Premium';
                    button.href = 'premium-content.html';
                });
                
                // Unlock premium modules
                lockedModules.forEach(module => {
                    if (module.classList.contains('premium-module')) {
                        module.classList.remove('locked');
                        const lockIcon = module.querySelector('.lock-icon');
                        if (lockIcon) {
                            lockIcon.style.display = 'none';
                        }
                        const moduleButton = module.querySelector('.module-button .btn');
                        if (moduleButton) {
                            moduleButton.textContent = 'Start Learning';
                            moduleButton.classList.remove('premium-button');
                            moduleButton.classList.add('btn');
                        }
                    }
                });
            }
        } else {
            // User is not signed in
            if (loginButton) {
                loginButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
                loginButton.href = 'login.html';
            }
        }
    }
    
    // Tools filtering
    const filterButtons = document.querySelectorAll('.filter-btn');
    const toolCards = document.querySelectorAll('.tool-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get filter value
            const filter = this.getAttribute('data-filter');
            
            // Show/hide tool cards based on filter
            toolCards.forEach(card => {
                if (filter === 'all') {
                    card.style.display = 'flex';
                } else {
                    const cardCategories = card.getAttribute('data-categories').split(',');
                    if (cardCategories.includes(filter)) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                }
            });
        });
    });
    
    // Initialize demo login if needed
    const demoLoginButton = document.getElementById('demo-login-button');
    if (demoLoginButton) {
        demoLoginButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Redirect to account page with demo parameter
            window.location.href = 'account.html?demo=true';
        });
    }
});
