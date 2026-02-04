// Homepage-specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Load header and footer
    loadHeader();
    loadFooter();
    
    // Initialize carousel
    initializeCarousel();
    
    // Add to cart functionality
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            addToCart(productId);
        });
    });
    
    // Initialize cart if not exists
    if (!localStorage.getItem('seventwenty-cart')) {
        localStorage.setItem('seventwenty-cart', JSON.stringify([]));
    }
});

// Initialize carousel with auto-scroll
function initializeCarousel() {
    const track = document.getElementById('carousel-track');
    if (!track) return;
    
    const slides = track.querySelectorAll('.carousel-slide');
    let currentIndex = 0;
    const slideCount = slides.length;
    
    function updateCarousel() {
        const offset = -currentIndex * 100;
        track.style.transform = `translateX(${offset}%)`;
    }
    
    function nextSlide() {
        currentIndex = (currentIndex + 1) % slideCount;
        updateCarousel();
    }
    
    // Auto-scroll every 4 seconds
    setInterval(nextSlide, 4000);
    
    // Initial position
    updateCarousel();
}

// Function to load header
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

// Function to load footer
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

// Add to cart function
function addToCart(productId) {
    // Get current cart from localStorage
    let cart = JSON.parse(localStorage.getItem('seventwenty-cart')) || [];
    
    // Find if product already exists in cart
    const existingProductIndex = cart.findIndex(item => item.id === productId);
    
    if (existingProductIndex !== -1) {
        // Increment quantity if product exists
        cart[existingProductIndex].quantity += 1;
    } else {
        // Add new product to cart
        const product = getProductDetails(productId);
        if (product) {
            cart.push({
                id: productId,
                name: product.name,
                price: product.price,
                quantity: 1,
                image: product.image
            });
        }
    }
    
    // Save cart back to localStorage
    localStorage.setItem('seventwenty-cart', JSON.stringify(cart));
    
    // Update cart count in header
    updateCartCount();
    
    // Show success message
    showNotification('Product added to cart!', 'success');
}

// Get product details (in a real implementation, this would come from a database)
function getProductDetails(productId) {
    const products = {
        '1': {
            name: 'Executive Powder-Coated Curtain Rod',
            price: 2500,
            image: 'curtain-rod.jpg'
        },
        '2': {
            name: 'SunWatch Solar Flood Light',
            price: 8900,
            image: 'solar-light.jpg'
        },
        '3': {
            name: 'SetPaints Interior Premium',
            price: 4200,
            image: 'paint.jpg'
        },
        '4': {
            name: 'Set Hardware Window Accessories Kit',
            price: 3500,
            image: 'hardware.jpg'
        }
    };
    
    return products[productId] || null;
}

// Update cart count in header
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const cart = JSON.parse(localStorage.getItem('seventwenty-cart')) || [];
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

// Show notification
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

// Add CSS for slideOut animation if not already present
if (!document.querySelector('#notification-animations')) {
    const animationStyles = document.createElement('style');
    animationStyles.id = 'notification-animations';
    animationStyles.textContent = `
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(animationStyles);
}