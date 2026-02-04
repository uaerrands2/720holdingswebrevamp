// About Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Load header and footer
    loadHeader();
    loadFooter();
    
    // Add animation to value cards on scroll
    const valueCards = document.querySelectorAll('.value-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });
    
    valueCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });
});

// Function to load header (same as homepage.js)
function loadHeader() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        // Detect if page is in a subdirectory and adjust path accordingly
        const headerPath = window.location.pathname.includes('/pages/') ? '../header.html' : 'header.html';
        fetch(headerPath)
            .then(response => response.text())
            .then(data => {
                headerPlaceholder.innerHTML = data;
                
                // Reinitialize header scripts after loading
                const headerScripts = headerPlaceholder.querySelectorAll('script');
                headerScripts.forEach(script => {
                    const newScript = document.createElement('script');
                    if (script.src) {
                        newScript.src = script.src;
                    } else {
                        newScript.textContent = script.textContent;
                    }
                    document.head.appendChild(newScript);
                });
            })
            .catch(error => {
                console.error('Error loading header:', error);
                headerPlaceholder.innerHTML = '<div class="loading">Loading navigation...</div>';
            });
    }
}

// Function to load footer (same as homepage.js)
function loadFooter() {
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        // Detect if page is in a subdirectory and adjust path accordingly
        const footerPath = window.location.pathname.includes('/pages/') ? '../footer.html' : 'footer.html';
        fetch(footerPath)
            .then(response => response.text())
            .then(data => {
                footerPlaceholder.innerHTML = data;
                
                // Reinitialize footer scripts after loading
                const footerScripts = footerPlaceholder.querySelectorAll('script');
                footerScripts.forEach(script => {
                    const newScript = document.createElement('script');
                    if (script.src) {
                        newScript.src = script.src;
                    } else {
                        newScript.textContent = script.textContent;
                    }
                    document.head.appendChild(newScript);
                });
            })
            .catch(error => {
                console.error('Error loading footer:', error);
                footerPlaceholder.innerHTML = '<div class="loading">Loading footer...</div>';
            });
    }
}