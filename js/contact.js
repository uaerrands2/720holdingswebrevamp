// Contact Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Load header and footer
    loadHeader();
    loadFooter();
    
    // Initialize map tabs
    initializeMapTabs();
    
    // Handle contact form submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactFormSubmit);
    }
});

function loadHeader() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        // Detect if page is in a subdirectory and adjust path accordingly
        const headerPath = window.location.pathname.includes('/pages/') ? '../header.html' : 'header.html';
        fetch(headerPath)
            .then(response => response.text())
            .then(data => {
                headerPlaceholder.innerHTML = data;
                
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

function loadFooter() {
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        // Detect if page is in a subdirectory and adjust path accordingly
        const footerPath = window.location.pathname.includes('/pages/') ? '../footer.html' : 'footer.html';
        fetch(footerPath)
            .then(response => response.text())
            .then(data => {
                footerPlaceholder.innerHTML = data;
                
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

function initializeMapTabs() {
    const mapTabs = document.querySelectorAll('.map-tab');
    const mapPlaceholders = document.querySelectorAll('.map-placeholder');
    
    mapTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const location = this.getAttribute('data-location');
            
            // Update active tab
            mapTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Show selected map
            mapPlaceholders.forEach(map => {
                map.classList.remove('active');
                if (map.id === `${location}-map`) {
                    map.classList.add('active');
                }
            });
        });
    });
}

function handleContactFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    // Basic validation
    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const subject = formData.get('subject');
    const message = formData.get('message');
    
    if (!name || !email || !phone || !subject || !message) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    // Phone validation (basic Kenyan format)
    const phoneRegex = /^(\+254|0)[17]\d{8}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
        showNotification('Please enter a valid Kenyan phone number', 'error');
        return;
    }
    
    // In a real implementation, this would send to a server
    // For now, show success message and reset form
    showNotification('Message sent successfully! We will respond within 24 hours.', 'success');
    form.reset();
    
    // Log form data (for debugging)
    console.log('Contact form submitted:', {
        name,
        email,
        phone,
        subject,
        subsidiary: formData.get('subsidiary'),
        message
    });
}

function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    // Add styles if not already present
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background-color: var(--white);
                border-radius: var(--radius);
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
                padding: 15px 20px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 15px;
                z-index: 9999;
                min-width: 300px;
                max-width: 400px;
                border-left: 4px solid var(--success);
                animation: slideIn 0.3s ease-out;
                transform: translateX(0);
            }
            
            .notification.error {
                border-left-color: var(--danger);
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .notification-content i {
                font-size: 1.2rem;
                color: var(--success);
            }
            
            .notification.error .notification-content i {
                color: var(--danger);
            }
            
            .notification-close {
                background: none;
                border: none;
                color: var(--light-text);
                cursor: pointer;
                font-size: 1rem;
            }
            
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(styles);
    }
    
    // Add to document
    document.body.appendChild(notification);
    
    // Add close event
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease-out';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
}