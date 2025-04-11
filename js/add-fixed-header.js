// Find the end of the file and add the script tag
document.addEventListener('DOMContentLoaded', function() {
    const scriptElement = document.createElement('script');
    scriptElement.src = 'js/fixed-header.js';
    document.body.appendChild(scriptElement);
});
