// Main JavaScript for AI Fundamentals website

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize tool filtering
    initToolFiltering();
    
    // Initialize smooth scrolling for navigation links
    initSmoothScrolling();
    
    // Initialize mobile menu toggle if it exists
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    if (mobileMenuToggle) {
        initMobileMenu(mobileMenuToggle);
    }
});

// Function to initialize tool filtering
function initToolFiltering() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const toolCards = document.querySelectorAll('.tool-card');
    
    if (!filterButtons.length || !toolCards.length) return;
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get filter value
            const filterValue = this.getAttribute('data-filter');
            
            // Show/hide tool cards based on filter
            toolCards.forEach(card => {
                if (filterValue === 'all') {
                    card.style.display = 'block';
                } else {
                    if (card.getAttribute('data-categories').includes(filterValue)) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                }
            });
        });
    });
}

// Function to initialize smooth scrolling for navigation links
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            // Only apply to links that point to an ID on the same page
            if (this.getAttribute('href').startsWith('#')) {
                const targetId = this.getAttribute('href');
                
                // Skip if it's just "#" (often used for JavaScript actions)
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    e.preventDefault();
                    
                    // Scroll smoothly to the target
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

// Function to initialize mobile menu
function initMobileMenu(toggleButton) {
    const nav = document.querySelector('nav');
    
    toggleButton.addEventListener('click', function() {
        nav.classList.toggle('active');
        this.classList.toggle('active');
    });
}

// Function to handle form submission
function handleFormSubmit(formId, successCallback, errorCallback) {
    const form = document.getElementById(formId);
    
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate form
        const isValid = validateForm(form);
        
        if (isValid) {
            // If valid, call success callback
            if (typeof successCallback === 'function') {
                successCallback(form);
            }
        } else {
            // If invalid, call error callback
            if (typeof errorCallback === 'function') {
                errorCallback(form);
            }
        }
    });
}

// Function to validate form
function validateForm(form) {
    let isValid = true;
    
    // Get all required inputs
    const requiredInputs = form.querySelectorAll('[required]');
    
    requiredInputs.forEach(input => {
        // Remove any existing error messages
        const existingError = input.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Check if input is empty
        if (!input.value.trim()) {
            isValid = false;
            
            // Add error message
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.textContent = 'This field is required';
            errorMessage.style.color = 'red';
            errorMessage.style.fontSize = '0.8rem';
            errorMessage.style.marginTop = '5px';
            
            input.parentNode.appendChild(errorMessage);
        }
        
        // Check email format if it's an email input
        if (input.type === 'email' && input.value.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value.trim())) {
                isValid = false;
                
                // Add error message
                const errorMessage = document.createElement('div');
                errorMessage.className = 'error-message';
                errorMessage.textContent = 'Please enter a valid email address';
                errorMessage.style.color = 'red';
                errorMessage.style.fontSize = '0.8rem';
                errorMessage.style.marginTop = '5px';
                
                input.parentNode.appendChild(errorMessage);
            }
        }
    });
    
    return isValid;
}
