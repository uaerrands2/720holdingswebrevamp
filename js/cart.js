// js/cart.js
document.addEventListener('DOMContentLoaded', function() {
    initCart();
});

function initCart() {
    loadCartItems();
    setupEventListeners();
    updateOrderSummary();
}

function loadCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    if (!cartItemsContainer) return;
    
    const cart = JSON.parse(localStorage.getItem('sevenTwentyCart')) || [];
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h3>Your cart is empty</h3>
                <p>Add some products to your cart and they will appear here.</p>
                <a href="shop.html" class="btn btn-gold">Start Shopping</a>
            </div>
        `;
        return;
    }
    
    let cartHTML = '';
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        const formattedPrice = new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0
        }).format(item.price);
        
        const formattedTotal = new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0
        }).format(itemTotal);
        
        cartHTML += `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-image">
                    <i class="fas fa-box-open"></i>
                </div>
                <div class="cart-item-info">
                    <h3 class="cart-item-title">
                        <a href="product.html?id=${item.id}">${item.name}</a>
                    </h3>
                    <div class="cart-item-meta">
                        <span class="cart-item-price">${formattedPrice}</span>
                        <span class="cart-item-subsidiary">${getSubsidiaryName(item.subsidiary)}</span>
                    </div>
                    <div class="cart-item-actions">
                        <div class="cart-quantity">
                            <button class="qty-minus"><i class="fas fa-minus"></i></button>
                            <input type="number" class="qty-input" value="${item.quantity}" min="1" max="99">
                            <button class="qty-plus"><i class="fas fa-plus"></i></button>
                        </div>
                        <button class="remove-item" title="Remove item">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="cart-item-total">
                    ${formattedTotal}
                </div>
            </div>
        `;
    });
    
    cartItemsContainer.innerHTML = cartHTML;
    
    // Add event listeners to cart items
    setupCartItemEvents();
}

function setupCartItemEvents() {
    // Quantity minus buttons
    document.querySelectorAll('.qty-minus').forEach(btn => {
        btn.addEventListener('click', function() {
            const cartItem = this.closest('.cart-item');
            const itemId = cartItem.dataset.id;
            const qtyInput = cartItem.querySelector('.qty-input');
            let currentQty = parseInt(qtyInput.value);
            
            if (currentQty > 1) {
                qtyInput.value = currentQty - 1;
                updateCartItem(itemId, currentQty - 1);
            }
        });
    });
    
    // Quantity plus buttons
    document.querySelectorAll('.qty-plus').forEach(btn => {
        btn.addEventListener('click', function() {
            const cartItem = this.closest('.cart-item');
            const itemId = cartItem.dataset.id;
            const qtyInput = cartItem.querySelector('.qty-input');
            let currentQty = parseInt(qtyInput.value);
            
            if (currentQty < 99) {
                qtyInput.value = currentQty + 1;
                updateCartItem(itemId, currentQty + 1);
            }
        });
    });
    
    // Quantity input changes
    document.querySelectorAll('.qty-input').forEach(input => {
        input.addEventListener('change', function() {
            const cartItem = this.closest('.cart-item');
            const itemId = cartItem.dataset.id;
            let newQty = parseInt(this.value);
            
            if (isNaN(newQty) || newQty < 1) {
                newQty = 1;
                this.value = 1;
            }
            if (newQty > 99) {
                newQty = 99;
                this.value = 99;
            }
            
            updateCartItem(itemId, newQty);
        });
    });
    
    // Remove item buttons
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const cartItem = this.closest('.cart-item');
            const itemId = cartItem.dataset.id;
            
            if (confirm('Are you sure you want to remove this item from your cart?')) {
                removeCartItem(itemId);
            }
        });
    });
}

function setupEventListeners() {
    // Continue shopping button
    const continueShoppingBtn = document.getElementById('continue-shopping');
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', function() {
            window.location.href = 'shop.html';
        });
    }
    
    // Calculate delivery button
    const calculateDeliveryBtn = document.getElementById('calculate-delivery');
    if (calculateDeliveryBtn) {
        calculateDeliveryBtn.addEventListener('click', calculateDelivery);
    }
    
    // Apply promo code button
    const applyPromoBtn = document.getElementById('apply-promo');
    if (applyPromoBtn) {
        applyPromoBtn.addEventListener('click', applyPromoCode);
    }
    
    // Promo suggestions
    document.querySelectorAll('.promo-suggestion').forEach(suggestion => {
        suggestion.addEventListener('click', function() {
            document.getElementById('promo-code-input').value = this.dataset.code;
            applyPromoCode();
        });
    });
    
    // Proceed to checkout button
    const proceedCheckoutBtn = document.getElementById('proceed-checkout');
    if (proceedCheckoutBtn) {
        proceedCheckoutBtn.addEventListener('click', function(e) {
            const cart = JSON.parse(localStorage.getItem('sevenTwentyCart')) || [];
            if (cart.length === 0) {
                e.preventDefault();
                alert('Your cart is empty. Please add items to your cart before proceeding to checkout.');
            }
        });
    }
}

function updateCartItem(itemId, newQuantity) {
    let cart = JSON.parse(localStorage.getItem('sevenTwentyCart')) || [];
    const itemIndex = cart.findIndex(item => item.id == itemId);
    
    if (itemIndex > -1) {
        cart[itemIndex].quantity = newQuantity;
        localStorage.setItem('sevenTwentyCart', JSON.stringify(cart));
        
        // Update cart display
        updateCartItemDisplay(itemId, newQuantity);
        updateOrderSummary();
        updateCartCount();
    }
}

function removeCartItem(itemId) {
    let cart = JSON.parse(localStorage.getItem('sevenTwentyCart')) || [];
    cart = cart.filter(item => item.id != itemId);
    localStorage.setItem('sevenTwentyCart', JSON.stringify(cart));
    
    // Reload cart items
    loadCartItems();
    updateOrderSummary();
    updateCartCount();
    
    showToast('Item removed from cart');
}

function updateCartItemDisplay(itemId, newQuantity) {
    const cartItem = document.querySelector(`.cart-item[data-id="${itemId}"]`);
    if (!cartItem) return;
    
    const price = parseFloat(cartItem.querySelector('.cart-item-price').textContent.replace(/[^0-9.-]+/g, ""));
    const totalElement = cartItem.querySelector('.cart-item-total');
    
    const itemTotal = price * newQuantity;
    totalElement.textContent = new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 0
    }).format(itemTotal);
}

function calculateDelivery() {
    const countySelect = document.getElementById('county-select');
    const addressInput = document.getElementById('address-input');
    const deliveryResult = document.getElementById('delivery-result');
    
    if (!countySelect.value || !addressInput.value.trim()) {
        alert('Please select a county and enter your delivery address.');
        return;
    }
    
    let deliveryFee = 0;
    let deliveryTime = '';
    
    switch(countySelect.value) {
        case 'nairobi':
            // Check if subtotal is over 10000
            const cart = JSON.parse(localStorage.getItem('sevenTwentyCart')) || [];
            const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            deliveryFee = subtotal >= 10000 ? 0 : 500;
            deliveryTime = '1-2 business days';
            break;
        case 'kiambu':
        case 'thika':
            deliveryFee = 800;
            deliveryTime = '2-3 business days';
            break;
        case 'mombasa':
        case 'kisumu':
        case 'nakuru':
        case 'eldoret':
            deliveryFee = 1500;
            deliveryTime = '3-5 business days';
            break;
        default:
            deliveryFee = 2000;
            deliveryTime = '5-7 business days';
    }
    
    deliveryResult.innerHTML = `
        <p><strong>Delivery Fee:</strong> KES ${deliveryFee.toLocaleString()}</p>
        <p><strong>Estimated Delivery:</strong> ${deliveryTime}</p>
        <p><strong>Delivery to:</strong> ${addressInput.value.substring(0, 50)}...</p>
    `;
    
    // Update delivery fee in order summary
    document.getElementById('delivery-fee').textContent = `KES ${deliveryFee.toLocaleString()}`;
    updateTotal();
}

function applyPromoCode() {
    const promoInput = document.getElementById('promo-code-input');
    const promoCode = promoInput.value.trim().toUpperCase();
    
    if (!promoCode) {
        alert('Please enter a promo code.');
        return;
    }
    
    // Simulate promo code validation
    const validPromoCodes = {
        'WELCOME10': 0.1, // 10% discount
        'SAVE20': 0.2,    // 20% discount
        'FREESHIP': 'free-shipping'
    };
    
    if (validPromoCodes[promoCode]) {
        const discount = validPromoCodes[promoCode];
        localStorage.setItem('appliedPromo', JSON.stringify({
            code: promoCode,
            discount: discount
        }));
        
        showToast('Promo code applied successfully!');
        updateOrderSummary();
    } else {
        alert('Invalid promo code. Please try again.');
    }
}

function updateOrderSummary() {
    const cart = JSON.parse(localStorage.getItem('sevenTwentyCart')) || [];
    const appliedPromo = JSON.parse(localStorage.getItem('appliedPromo'));
    
    // Calculate subtotal
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Get delivery fee
    const deliveryFeeElement = document.getElementById('delivery-fee');
    let deliveryFee = 0;
    if (deliveryFeeElement && deliveryFeeElement.textContent !== 'KES 0') {
        deliveryFee = parseFloat(deliveryFeeElement.textContent.replace(/[^0-9.-]+/g, ""));
    }
    
    // Apply promo code discount
    let discount = 0;
    if (appliedPromo) {
        if (typeof appliedPromo.discount === 'number') {
            discount = subtotal * appliedPromo.discount;
        } else if (appliedPromo.discount === 'free-shipping') {
            deliveryFee = 0;
            deliveryFeeElement.textContent = 'KES 0';
        }
    }
    
    // Update summary items
    const summaryItems = document.getElementById('summary-items');
    if (summaryItems) {
        summaryItems.innerHTML = '';
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            summaryItems.innerHTML += `
                <div class="summary-item">
                    <span>${item.name} × ${item.quantity}</span>
                    <span>KES ${itemTotal.toLocaleString()}</span>
                </div>
            `;
        });
    }
    
    // Update totals
    document.getElementById('subtotal').textContent = `KES ${subtotal.toLocaleString()}`;
    document.getElementById('delivery-fee').textContent = `KES ${deliveryFee.toLocaleString()}`;
    
    // Calculate total
    const total = subtotal + deliveryFee - discount;
    document.getElementById('total').textContent = `KES ${total.toLocaleString()}`;
}

function updateTotal() {
    const subtotalElement = document.getElementById('subtotal');
    const deliveryFeeElement = document.getElementById('delivery-fee');
    const totalElement = document.getElementById('total');
    
    const subtotal = parseFloat(subtotalElement.textContent.replace(/[^0-9.-]+/g, "")) || 0;
    const deliveryFee = parseFloat(deliveryFeeElement.textContent.replace(/[^0-9.-]+/g, "")) || 0;
    
    const total = subtotal + deliveryFee;
    totalElement.textContent = `KES ${total.toLocaleString()}`;
}

function getSubsidiaryName(subsidiaryCode) {
    const subsidiaries = {
        'executive': 'Executive Curtain Rods',
        'setpaints': 'SetPaints',
        'sethardware': 'Set Hardware',
        'sunwatch': 'SunWatch Solar'
    };
    
    return subsidiaries[subsidiaryCode] || 'SevenTwenty Holdings';
}

function showToast(message) {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create toast
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Hide toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Initialize cart count
updateCartCount();