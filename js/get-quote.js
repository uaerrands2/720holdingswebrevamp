// Get Quote Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Load header and footer
    loadHeader();
    loadFooter();
    
    // Initialize quote form
    initializeQuoteForm();
    
    // Initialize product category selection
    initializeCategorySelection();
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

function initializeQuoteForm() {
    const quoteForm = document.getElementById('quote-form');
    if (!quoteForm) return;
    
    quoteForm.addEventListener('submit', handleQuoteFormSubmit);
    
    // Form validation
    const requiredFields = quoteForm.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        field.addEventListener('blur', validateField);
    });
}

function initializeCategorySelection() {
    const categoryCheckboxes = document.querySelectorAll('.category-checkbox input[type="checkbox"]');
    categoryCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const label = this.closest('.category-checkbox').querySelector('label');
            if (this.checked) {
                label.style.borderColor = 'var(--primary-blue)';
                label.style.backgroundColor = 'rgba(10, 36, 99, 0.05)';
            } else {
                label.style.borderColor = '#e5e7eb';
                label.style.backgroundColor = 'transparent';
            }
        });
    });
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    const errorElement = field.parentElement.querySelector('.field-error') || createErrorElement(field);
    
    // Clear previous error
    errorElement.textContent = '';
    field.style.borderColor = '#d1d5db';
    
    // Skip validation if field is empty but not required
    if (!field.required && !value) return;
    
    // Validation rules
    let isValid = true;
    let errorMessage = '';
    
    switch(field.type) {
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            isValid = emailRegex.test(value);
            errorMessage = isValid ? '' : 'Please enter a valid email address';
            break;
            
        case 'tel':
            const phoneRegex = /^(\+254|0)[17]\d{8}$/;
            const cleanedPhone = value.replace(/\s/g, '');
            isValid = phoneRegex.test(cleanedPhone);
            errorMessage = isValid ? '' : 'Please enter a valid Kenyan phone number (e.g., 0723 518 210)';
            break;
            
        default:
            isValid = value.length > 0;
            errorMessage = isValid ? '' : 'This field is required';
    }
    
    if (!isValid) {
        field.style.borderColor = 'var(--danger)';
        errorElement.textContent = errorMessage;
    }
}

function createErrorElement(field) {
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.style.color = 'var(--danger)';
    errorElement.style.fontSize = '0.85rem';
    errorElement.style.marginTop = '5px';
    field.parentElement.appendChild(errorElement);
    return errorElement;
}

function handleQuoteFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    // Validate required fields
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.style.borderColor = 'var(--danger)';
            
            // Create error message if it doesn't exist
            const errorElement = field.parentElement.querySelector('.field-error') || createErrorElement(field);
            errorElement.textContent = 'This field is required';
        }
    });
    
    // Validate at least one product category is selected
    const productCheckboxes = form.querySelectorAll('input[name="products"]');
    const atLeastOneProduct = Array.from(productCheckboxes).some(checkbox => checkbox.checked);
    
    if (!atLeastOneProduct) {
        isValid = false;
        showNotification('Please select at least one product category', 'error');
    }
    
    if (!isValid) {
        showNotification('Please fill in all required fields correctly', 'error');
        return;
    }
    
    // Prepare data for submission
    const quoteData = {
        personalInfo: {
            name: formData.get('full-name'),
            company: formData.get('company'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address')
        },
        projectDetails: {
            type: formData.get('project-type'),
            timeline: formData.get('timeline')
        },
        products: [],
        quantity: formData.get('quantity'),
        budget: formData.get('budget'),
        services: [],
        additionalInfo: formData.get('additional-info'),
        howHeard: formData.get('how-heard'),
        timestamp: new Date().toISOString()
    };
    
    // Get selected products
    productCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            quoteData.products.push(checkbox.value);
        }
    });
    
    // Get selected services
    const serviceCheckboxes = form.querySelectorAll('input[name="services"]');
    serviceCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            quoteData.services.push(checkbox.value);
        }
    });
    
    // In a real implementation, this would send to a server
    console.log('Quote request submitted:', quoteData);
    
    // Show success message
    showNotification('Quote request submitted successfully! We will respond within 24 hours.', 'success');
    
    // Reset form
    form.reset();
    
    // Reset visual states
    const categoryLabels = document.querySelectorAll('.category-checkbox label');
    categoryLabels.forEach(label => {
        label.style.borderColor = '#e5e7eb';
        label.style.backgroundColor = 'transparent';
    });
    
    // Clear error messages
    const errorElements = form.querySelectorAll('.field-error');
    errorElements.forEach(element => element.textContent = '');
    
    // Simulate auto-reply (in real implementation, this would be server-side)
    simulateAutoReply(quoteData.personalInfo.email, quoteData.personalInfo.name);
}

function simulateAutoReply(email, name) {
    // In a real implementation, this would be a server-side email
    console.log(`Auto-reply would be sent to: ${email}`);
    console.log(`Subject: Thank you for your quote request, ${name}`);
    console.log(`Body: Dear ${name},\n\nThank you for requesting a quote from SevenTwenty Holdings. We have received your request and will respond with a detailed quote within 24 hours.\n\nBest regards,\nSevenTwenty Holdings Team`);
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