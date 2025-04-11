// Fixed header JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('header');
    
    // Add scrolled class when page is scrolled
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
});
