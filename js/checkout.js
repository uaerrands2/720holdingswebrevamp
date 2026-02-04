// js/checkout.js
document.addEventListener('DOMContentLoaded', function() {
    initCheckout();
});

function initCheckout() {
    loadOrderSummary();
    setupEventListeners();
    validateCart();
}

function validateCart() {
    const cart = JSON.parse(localStorage.getItem('sevenTwentyCart')) || [];
    if (cart.length === 0) {
        alert('Your cart is empty. Redirecting to shop page.');
        window.location.href = 'shop.html';
    }
}

function loadOrderSummary() {
    const cart = JSON.parse(localStorage.getItem('sevenTwentyCart')) || [];
    const summaryItems = document.getElementById('summary-items');
    
    if (!summaryItems) return;
    
    let itemsHTML = '';
    let subtotal = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        itemsHTML += `
            <div class="summary-item">
                <span class="item-name">${item.name} × ${item.quantity}</span>
                <span class="item-price">KES ${itemTotal.toLocaleString()}</span>
            </div>
        `;
    });
    
    summaryItems.innerHTML = itemsHTML;
    
    // Update totals
    document.getElementById('summary-subtotal').textContent = `KES ${subtotal.toLocaleString()}`;
    
    // Calculate delivery fee (default Nairobi)
    let deliveryFee = 500;
    if (subtotal >= 10000) {
        deliveryFee = 0;
    }
    
    document.getElementById('summary-delivery').textContent = `KES ${deliveryFee.toLocaleString()}`;
    
    // Update total
    const total = subtotal + deliveryFee;
    document.getElementById('summary-total').textContent = `KES ${total.toLocaleString()}`;
}

function setupEventListeners() {
    // Step navigation
    document.querySelectorAll('.next-step').forEach(btn => {
        btn.addEventListener('click', function() {
            const currentStep = this.closest('.checkout-step');
            const nextStepId = this.dataset.next;
            
            if (validateStep(currentStep.id)) {
                goToStep(nextStepId);
            }
        });
    });
    
    document.querySelectorAll('.prev-step').forEach(btn => {
        btn.addEventListener('click', function() {
            const prevStepId = this.dataset.prev;
            goToStep(prevStepId);
        });
    });
    
    // Edit buttons in review step
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const stepId = this.dataset.step;
            goToStep(stepId);
        });
    });
    
    // Payment method change
    document.querySelectorAll('input[name="payment"]').forEach(radio => {
        radio.addEventListener('change', function() {
            toggleCardForm(this.value === 'card');
        });
    });
    
    // Delivery method change
    document.querySelectorAll('input[name="delivery"]').forEach(radio => {
        radio.addEventListener('change', function() {
            updateDeliveryPrice(this.value);
        });
    });
    
    // Apply promo code
    const applyPromoBtn = document.getElementById('apply-checkout-promo');
    if (applyPromoBtn) {
        applyPromoBtn.addEventListener('click', applyCheckoutPromo);
    }
    
    // Cancel checkout
    const cancelBtn = document.getElementById('cancel-checkout');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to cancel checkout? Your cart will be saved.')) {
                window.location.href = 'cart.html';
            }
        });
    }
    
    // Place order
    const placeOrderBtn = document.getElementById('place-order');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', function(e) {
            e.preventDefault();
            placeOrder();
        });
    }
    
    // Initialize delivery price
    updateDeliveryPrice('standard');
}

function validateStep(stepId) {
    const step = document.getElementById(stepId);
    const inputs = step.querySelectorAll('input[required], select[required], textarea[required]');
    
    let isValid = true;
    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('error');
            
            // Add error message
            if (!input.nextElementSibling?.classList.contains('error-message')) {
                const errorMsg = document.createElement('span');
                errorMsg.className = 'error-message';
                errorMsg.textContent = 'This field is required';
                errorMsg.style.color = '#c62828';
                errorMsg.style.fontSize = '0.8rem';
                input.parentNode.appendChild(errorMsg);
            }
        } else {
            input.classList.remove('error');
            const errorMsg = input.parentNode.querySelector('.error-message');
            if (errorMsg) errorMsg.remove();
            
            // Validate specific fields
            if (input.type === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(input.value)) {
                    isValid = false;
                    input.classList.add('error');
                    const errorMsg = document.createElement('span');
                    errorMsg.className = 'error-message';
                    errorMsg.textContent = 'Please enter a valid email address';
                    errorMsg.style.color = '#c62828';
                    errorMsg.style.fontSize = '0.8rem';
                    input.parentNode.appendChild(errorMsg);
                }
            }
            
            if (input.type === 'tel') {
                const phoneRegex = /^07\d{8}$/;
                const cleanPhone = input.value.replace(/\s/g, '');
                if (!phoneRegex.test(cleanPhone)) {
                    isValid = false;
                    input.classList.add('error');
                    const errorMsg = document.createElement('span');
                    errorMsg.className = 'error-message';
                    errorMsg.textContent = 'Please enter a valid Kenyan phone number (07XXXXXXXX)';
                    errorMsg.style.color = '#c62828';
                    errorMsg.style.fontSize = '0.8rem';
                    input.parentNode.appendChild(errorMsg);
                }
            }
        }
    });
    
    return isValid;
}

function goToStep(stepNumber) {
    // Hide all steps
    document.querySelectorAll('.checkout-step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Show target step
    const targetStep = document.getElementById(`step-${stepNumber}`);
    if (targetStep) {
        targetStep.classList.add('active');
    }
    
    // Update progress bar
    document.querySelectorAll('.progress-steps .step').forEach((step, index) => {
        if (index < stepNumber) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
    
    // Update review section if we're on step 5
    if (stepNumber == 5) {
        updateReviewSection();
    }
}

function toggleCardForm(show) {
    const cardForm = document.getElementById('card-payment-form');
    if (cardForm) {
        cardForm.style.display = show ? 'block' : 'none';
        if (show) {
            cardForm.querySelectorAll('input').forEach(input => {
                input.required = true;
            });
        } else {
            cardForm.querySelectorAll('input').forEach(input => {
                input.required = false;
            });
        }
    }
}

function updateDeliveryPrice(method) {
    const cart = JSON.parse(localStorage.getItem('sevenTwentyCart')) || [];
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    let deliveryPrice = 0;
    switch(method) {
        case 'standard':
            deliveryPrice = (subtotal >= 10000) ? 0 : 500;
            break;
        case 'express':
            deliveryPrice = 1500;
            break;
        case 'pickup':
            deliveryPrice = 0;
            break;
    }
    
    document.getElementById('standard-price').textContent = `KES ${deliveryPrice.toLocaleString()}`;
    
    // Update summary
    document.getElementById('summary-delivery').textContent = `KES ${deliveryPrice.toLocaleString()}`;
    updateCheckoutTotal();
}

function applyCheckoutPromo() {
    const promoInput = document.getElementById('checkout-promo');
    const promoMessage = document.getElementById('promo-message');
    const promoCode = promoInput.value.trim().toUpperCase();
    
    if (!promoCode) {
        promoMessage.innerHTML = '<span style="color: #c62828;">Please enter a promo code</span>';
        return;
    }
    
    // Simulate promo code validation
    const validPromoCodes = {
        'WELCOME10': { type: 'percentage', value: 0.1 },
        'SAVE20': { type: 'percentage', value: 0.2 },
        'FREESHIP': { type: 'free-shipping' }
    };
    
    if (validPromoCodes[promoCode]) {
        const promo = validPromoCodes[promoCode];
        localStorage.setItem('checkoutPromo', JSON.stringify({ code: promoCode, ...promo }));
        
        promoMessage.innerHTML = `<span style="color: #2e7d32;">Promo code applied successfully!</span>`;
        updateCheckoutTotal();
    } else {
        promoMessage.innerHTML = '<span style="color: #c62828;">Invalid promo code. Please try again.</span>';
    }
}

function updateCheckoutTotal() {
    const cart = JSON.parse(localStorage.getItem('sevenTwentyCart')) || [];
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Get delivery fee
    const deliveryFeeElement = document.getElementById('summary-delivery');
    let deliveryFee = parseFloat(deliveryFeeElement.textContent.replace(/[^0-9.-]+/g, "")) || 0;
    
    // Apply promo
    const appliedPromo = JSON.parse(localStorage.getItem('checkoutPromo'));
    let discount = 0;
    
    if (appliedPromo) {
        if (appliedPromo.type === 'percentage') {
            discount = subtotal * appliedPromo.value;
        } else if (appliedPromo.type === 'free-shipping') {
            deliveryFee = 0;
            deliveryFeeElement.textContent = 'KES 0';
        }
    }
    
    const total = subtotal + deliveryFee - discount;
    document.getElementById('summary-total').textContent = `KES ${total.toLocaleString()}`;
}

function updateReviewSection() {
    // Contact information
    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    
    document.getElementById('review-contact').textContent = 
        `${firstName} ${lastName}\n${email}\n${phone}`;
    
    // Delivery address
    const county = document.getElementById('county').value;
    const town = document.getElementById('town').value;
    const address = document.getElementById('address').value;
    const landmark = document.getElementById('landmark').value;
    
    document.getElementById('review-address').textContent = 
        `${address}\n${landmark}\n${town}, ${county.charAt(0).toUpperCase() + county.slice(1)} County`;
    
    // Delivery method
    const deliveryMethod = document.querySelector('input[name="delivery"]:checked').value;
    let deliveryText = '';
    switch(deliveryMethod) {
        case 'standard':
            deliveryText = 'Standard Delivery (3-5 business days)';
            break;
        case 'express':
            deliveryText = 'Express Delivery (1-2 business days)';
            break;
        case 'pickup':
            deliveryText = 'Store Pickup (Nairobi Warehouse)';
            break;
    }
    
    const installationChecked = document.getElementById('schedule-installation').checked;
    if (installationChecked) {
        deliveryText += '\n+ Professional Installation Scheduled';
    }
    
    document.getElementById('review-delivery').textContent = deliveryText;
    
    // Payment method
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    let paymentText = '';
    switch(paymentMethod) {
        case 'mpesa':
            paymentText = 'M-Pesa (Paybill: 247247)';
            break;
        case 'card':
            paymentText = 'Credit/Debit Card';
            break;
        case 'bank':
            paymentText = 'Bank Transfer (Equity Bank)';
            break;
        case 'cod':
            paymentText = 'Cash on Delivery';
            break;
    }
    
    document.getElementById('review-payment').textContent = paymentText;
    
    // Order items
    const cart = JSON.parse(localStorage.getItem('sevenTwentyCart')) || [];
    const reviewItems = document.getElementById('review-items');
    
    let itemsHTML = '<div class="review-items-list">';
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        itemsHTML += `
            <div class="review-item">
                <span>${item.name} × ${item.quantity}</span>
                <span>KES ${itemTotal.toLocaleString()}</span>
            </div>
        `;
    });
    itemsHTML += '</div>';
    
    reviewItems.innerHTML = itemsHTML;
}

function placeOrder() {
    // Validate terms agreement
    const termsAgree = document.getElementById('terms-agree');
    if (!termsAgree.checked) {
        alert('Please agree to the Terms & Conditions and Privacy Policy to continue.');
        return;
    }
    
    // Get order data
    const orderData = {
        contact: {
            firstName: document.getElementById('first-name').value,
            lastName: document.getElementById('last-name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value
        },
        address: {
            county: document.getElementById('county').value,
            town: document.getElementById('town').value,
            address: document.getElementById('address').value,
            landmark: document.getElementById('landmark').value,
            building: document.getElementById('building').value,
            floor: document.getElementById('floor').value
        },
        delivery: {
            method: document.querySelector('input[name="delivery"]:checked').value,
            installation: document.getElementById('schedule-installation').checked
        },
        payment: document.querySelector('input[name="payment"]:checked').value,
        cart: JSON.parse(localStorage.getItem('sevenTwentyCart')) || [],
        promo: JSON.parse(localStorage.getItem('checkoutPromo')),
        orderNumber: generateOrderNumber(),
        orderDate: new Date().toISOString(),
        status: 'pending'
    };
    
    // Calculate totals
    const subtotal = orderData.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let deliveryFee = 0;
    
    switch(orderData.delivery.method) {
        case 'standard':
            deliveryFee = (subtotal >= 10000) ? 0 : 500;
            break;
        case 'express':
            deliveryFee = 1500;
            break;
        case 'pickup':
            deliveryFee = 0;
            break;
    }
    
    let discount = 0;
    if (orderData.promo) {
        if (orderData.promo.type === 'percentage') {
            discount = subtotal * orderData.promo.value;
        } else if (orderData.promo.type === 'free-shipping') {
            deliveryFee = 0;
        }
    }
    
    orderData.subtotal = subtotal;
    orderData.deliveryFee = deliveryFee;
    orderData.discount = discount;
    orderData.total = subtotal + deliveryFee - discount;
    
    // Save order to localStorage
    saveOrder(orderData);
    
    // Clear cart
    localStorage.removeItem('sevenTwentyCart');
    localStorage.removeItem('checkoutPromo');
    
    // Update cart count
    updateCartCount();
    
    // Show success modal
    showOrderSuccessModal(orderData);
}

function generateOrderNumber() {
    const prefix = '720';
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${year}-${random}`;
}

function saveOrder(orderData) {
    let orders = JSON.parse(localStorage.getItem('sevenTwentyOrders')) || [];
    orders.push(orderData);
    localStorage.setItem('sevenTwentyOrders', JSON.stringify(orders));
}

function showOrderSuccessModal(orderData) {
    const modal = document.getElementById('order-success-modal');
    
    // Update modal content
    document.getElementById('order-number').textContent = orderData.orderNumber;
    document.getElementById('delivery-date').textContent = getDeliveryEstimate(orderData.delivery.method);
    document.getElementById('payment-method').textContent = getPaymentMethodName(orderData.payment);
    document.getElementById('order-total').textContent = `KES ${orderData.total.toLocaleString()}`;
    
    // Show M-Pesa instructions if selected
    const mpesaInstructions = document.getElementById('mpesa-instructions');
    if (orderData.payment === 'mpesa') {
        mpesaInstructions.style.display = 'block';
        document.getElementById('mpesa-account').textContent = orderData.orderNumber;
        document.getElementById('mpesa-amount').textContent = `KES ${orderData.total.toLocaleString()}`;
    } else {
        mpesaInstructions.style.display = 'none';
    }
    
    // Show modal
    modal.classList.add('active');
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
    
    // Redirect when clicking view order details
    const viewDetailsBtn = modal.querySelector('.btn-gold');
    viewDetailsBtn.addEventListener('click', function() {
        localStorage.setItem('lastOrder', JSON.stringify(orderData));
    });
}

function getDeliveryEstimate(method) {
    switch(method) {
        case 'express': return '1-2 business days';
        case 'standard': return '3-5 business days';
        case 'pickup': return 'Ready in 24 hours';
        default: return '3-5 business days';
    }
}

function getPaymentMethodName(paymentMethod) {
    switch(paymentMethod) {
        case 'mpesa': return 'M-Pesa';
        case 'card': return 'Credit/Debit Card';
        case 'bank': return 'Bank Transfer';
        case 'cod': return 'Cash on Delivery';
        default: return paymentMethod;
    }
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('sevenTwentyCart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const cartCounts = document.querySelectorAll('.cart-count');
    cartCounts.forEach(el => {
        el.textContent = totalItems;
        el.style.display = totalItems > 0 ? 'flex' : 'none';
    });
}