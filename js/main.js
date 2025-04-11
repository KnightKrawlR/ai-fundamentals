// Main JavaScript file for AI Fundamentals website

document.addEventListener('DOMContentLoaded', function() {
    // Flashcard flip functionality
    const flashcard = document.querySelector('.flashcard');
    if (flashcard) {
        flashcard.addEventListener('click', function() {
            this.classList.toggle('flipped');
        });
    }
    
    // Flashcard navigation
    const prevButton = document.querySelector('.prev-card');
    const nextButton = document.querySelector('.next-card');
    const cardCounter = document.querySelector('.card-counter');
    let currentCard = 1;
    const totalCards = 15;
    
    if (prevButton && nextButton) {
        prevButton.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent triggering the flip
            if (currentCard > 1) {
                currentCard--;
                updateCardCounter();
                // In a real implementation, this would load the previous card content
            }
        });
        
        nextButton.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent triggering the flip
            if (currentCard < totalCards) {
                currentCard++;
                updateCardCounter();
                // In a real implementation, this would load the next card content
            }
        });
        
        function updateCardCounter() {
            if (cardCounter) {
                cardCounter.textContent = `Card ${currentCard} of ${totalCards}`;
            }
        }
    }
    
    // Flashcard study modes
    const modeButtons = document.querySelectorAll('.mode-button');
    if (modeButtons.length > 0) {
        modeButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                modeButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                // In a real implementation, this would change the study mode
                const mode = this.getAttribute('data-mode');
                console.log(`Changing to ${mode} mode`);
            });
        });
    }
    
    // AI Tools filter functionality
    const filterButtons = document.querySelectorAll('.filter-btn');
    const toolCards = document.querySelectorAll('.tool-card');
    
    if (filterButtons.length > 0 && toolCards.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                // Get filter value
                const filterValue = this.getAttribute('data-filter');
                
                // Show/hide cards based on filter
                toolCards.forEach(card => {
                    if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }
    
    // Fix navigation links for smooth scrolling
    const navLinks = document.querySelectorAll('header nav ul li a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId.startsWith('#')) {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
    
    // Login button functionality
    const loginButton = document.querySelector('.login-button');
    if (loginButton) {
        loginButton.addEventListener('click', function() {
            window.location.href = 'login.html';
        });
    }
    
    // Firebase Authentication State Observer
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in
            console.log('User is signed in:', user.displayName || user.email);
            
            // Update UI for authenticated user
            updateUIForAuthenticatedUser(user);
        } else {
            // User is signed out
            console.log('User is signed out');
            
            // Update UI for non-authenticated user
            updateUIForNonAuthenticatedUser();
        }
    });
    
    // Update UI based on authentication state
    function updateUIForAuthenticatedUser(user) {
        // Update login button
        if (loginButton) {
            loginButton.innerHTML = `<i class="fas fa-user"></i><span> ${user.displayName || 'Account'}</span>`;
            loginButton.addEventListener('click', function() {
                window.location.href = 'account.html';
            });
        }
        
        // Update locked content
        const signInButtons = document.querySelectorAll('.sign-in-button');
        signInButtons.forEach(button => {
            button.textContent = 'Access Content';
            button.classList.add('unlocked');
        });
        
        // Update premium buttons if user has premium
        // This would require checking the user's subscription status in a real implementation
    }
    
    function updateUIForNonAuthenticatedUser() {
        // Reset login button
        if (loginButton) {
            loginButton.innerHTML = `<i class="fas fa-sign-in-alt"></i><span> Sign In</span>`;
            loginButton.addEventListener('click', function() {
                window.location.href = 'login.html';
            });
        }
        
        // Ensure locked content stays locked
        const signInButtons = document.querySelectorAll('.sign-in-button');
        signInButtons.forEach(button => {
            button.textContent = 'Sign In to Access';
            button.classList.remove('unlocked');
        });
    }
});
