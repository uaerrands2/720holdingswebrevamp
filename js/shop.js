// js/shop.js
document.addEventListener('DOMContentLoaded', function() {
    // Initialize shop functionality
    initShop();
});

async function initShop() {
    // Load header and footer first
    await loadHeader();
    await loadFooter();

    // Load products from JSON file
    await loadProducts();
    
    // Initialize event listeners
    setupEventListeners();
    
    // Display initial products
    displayProducts(filteredProducts);
    
    // Update showing info
    updateShowingInfo();
}

let allProducts = [];
let filteredProducts = [];
let currentView = 'grid';
let currentSort = 'popularity';
let currentPage = 1;
const productsPerPage = 12;

async function loadProducts() {
    try {
        // products.json is located in /data/products.json
        const response = await fetch('data/products.json');
        const data = await response.json();
        allProducts = data.products;
        filteredProducts = [...allProducts];
    } catch (error) {
        console.error('Error loading products:', error);
        // Fallback to sample products if JSON fails to load
        allProducts = getSampleProducts();
        filteredProducts = [...allProducts];
    }
}

// Load header and footer dynamically (works for root and /pages/ folders)
function loadHeader() {
    return new Promise((resolve) => {
        const headerPlaceholder = document.getElementById('header-placeholder');
        if (!headerPlaceholder) return resolve();
        const headerPath = window.location.pathname.includes('/pages/') ? '../header.html' : 'header.html';
        fetch(headerPath)
            .then(resp => resp.text())
            .then(html => {
                headerPlaceholder.innerHTML = html;
                const headerScripts = headerPlaceholder.querySelectorAll('script');
                headerScripts.forEach(script => {
                    const newScript = document.createElement('script');
                    if (script.src) newScript.src = script.src;
                    else newScript.textContent = script.textContent;
                    document.head.appendChild(newScript);
                });
                // Update cart count now that header is present
                updateCartCount();
                resolve();
            })
            .catch(err => {
                console.error('Error loading header:', err);
                resolve();
            });
    });
}

function loadFooter() {
    return new Promise((resolve) => {
        const footerPlaceholder = document.getElementById('footer-placeholder');
        if (!footerPlaceholder) return resolve();
        const footerPath = window.location.pathname.includes('/pages/') ? '../footer.html' : 'footer.html';
        fetch(footerPath)
            .then(resp => resp.text())
            .then(html => {
                footerPlaceholder.innerHTML = html;
                const footerScripts = footerPlaceholder.querySelectorAll('script');
                footerScripts.forEach(script => {
                    const newScript = document.createElement('script');
                    if (script.src) newScript.src = script.src;
                    else newScript.textContent = script.textContent;
                    document.head.appendChild(newScript);
                });
                resolve();
            })
            .catch(err => {
                console.error('Error loading footer:', err);
                resolve();
            });
    });
}

function getSampleProducts() {
    // Return sample products if JSON fails to load
    return [
        {
            id: 1,
            name: "Executive Powder-Coated Curtain Rod",
            subsidiary: "executive",
            category: "curtain-rods",
            price: 2500,
            oldPrice: 3000,
            description: "Durable steel curtain rod with elegant powder-coated finish, 20+ years lifespan.",
            features: ["Powder-coated", "Corrosion-resistant", "20-year guarantee"],
            colors: ["white", "black", "gold", "silver"],
            sizes: ["1.5m", "2m", "2.5m", "3m", "Custom"],
            rating: 4.5,
            reviewCount: 48,
            stock: 150,
            bulkDiscount: "Buy 3+ save 10%"
        },
        // Add more sample products as needed
    ];
}

function setupEventListeners() {
    // View toggle
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentView = this.dataset.view;
            toggleView(currentView);
        });
    });

    // Sort by
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            currentSort = this.value;
            sortProducts(currentSort);
            displayProducts(filteredProducts);
            updateShowingInfo();
        });
    }

    // Category filters
    document.querySelectorAll('input[name="category"]').forEach(checkbox => {
        checkbox.addEventListener('change', applyFilters);
    });

    // Material filters
    document.querySelectorAll('input[name="material"]').forEach(checkbox => {
        checkbox.addEventListener('change', applyFilters);
    });

    // Wattage filters
    document.querySelectorAll('input[name="wattage"]').forEach(checkbox => {
        checkbox.addEventListener('change', applyFilters);
    });

    // Color filters
    document.querySelectorAll('.color-option').forEach(btn => {
        btn.addEventListener('click', function() {
            this.classList.toggle('active');
            applyFilters();
        });
    });

    // Price filter
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    const rangeMin = document.querySelector('.range-min');
    const rangeMax = document.querySelector('.range-max');

    if (rangeMin && rangeMax) {
        rangeMin.addEventListener('input', updatePriceInputs);
        rangeMax.addEventListener('input', updatePriceInputs);
        minPriceInput.addEventListener('input', updatePriceSlider);
        maxPriceInput.addEventListener('input', updatePriceSlider);
    }

    // Clear filters
    const clearFiltersBtn = document.querySelector('.clear-filters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearFilters);
    }

    // Load more
    const loadMoreBtn = document.getElementById('load-more');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreProducts);
    }

    // Pagination
    document.querySelectorAll('.page-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.page-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentPage = parseInt(this.textContent);
            displayProducts(filteredProducts);
            updateShowingInfo();
        });
    });

    // Quick view modal
    setupQuickViewModal();
}

function toggleView(view) {
    const productsGrid = document.getElementById('products-grid');
    const productCards = document.querySelectorAll('.product-card');
    
    if (view === 'grid') {
        productsGrid.classList.remove('list-view');
        productsGrid.classList.add('grid-view');
        productCards.forEach(card => {
            card.classList.remove('list-view');
            card.classList.add('grid-view');
        });
    } else {
        productsGrid.classList.remove('grid-view');
        productsGrid.classList.add('list-view');
        productCards.forEach(card => {
            card.classList.remove('grid-view');
            card.classList.add('list-view');
        });
    }
}

function sortProducts(sortBy) {
    switch(sortBy) {
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            filteredProducts.sort((a, b) => b.rating - a.rating);
            break;
        case 'newest':
            // Assuming newer products have higher IDs
            filteredProducts.sort((a, b) => b.id - a.id);
            break;
        case 'popularity':
        default:
            // Sort by review count as proxy for popularity
            filteredProducts.sort((a, b) => b.reviewCount - a.reviewCount);
            break;
    }
}

function applyFilters() {
    // Get selected categories
    const selectedCategories = Array.from(document.querySelectorAll('input[name="category"]:checked'))
        .map(cb => cb.value);
    
    // Get selected materials
    const selectedMaterials = Array.from(document.querySelectorAll('input[name="material"]:checked'))
        .map(cb => cb.value);
    
    // Get selected wattages
    const selectedWattages = Array.from(document.querySelectorAll('input[name="wattage"]:checked'))
        .map(cb => cb.value);
    
    // Get selected colors
    const selectedColors = Array.from(document.querySelectorAll('.color-option.active'))
        .map(btn => btn.dataset.color);
    
    // Get price range
    const minPrice = parseInt(document.getElementById('min-price').value) || 0;
    const maxPrice = parseInt(document.getElementById('max-price').value) || 50000;

    // Filter products
    filteredProducts = allProducts.filter(product => {
        // Category filter
        if (selectedCategories.length > 0 && !selectedCategories.includes(product.subsidiary)) {
            return false;
        }
        
        // Price filter
        if (product.price < minPrice || product.price > maxPrice) {
            return false;
        }
        
        // Color filter (only for products with colors)
        if (selectedColors.length > 0 && product.colors) {
            const hasSelectedColor = product.colors.some(color => 
                selectedColors.includes(color)
            );
            if (!hasSelectedColor) return false;
        }
        
        // Material filter (simplified - check if material is in product name or features)
        if (selectedMaterials.length > 0) {
            const productMaterial = JSON.stringify(product).toLowerCase();
            const hasMaterial = selectedMaterials.some(material => 
                productMaterial.includes(material)
            );
            if (!hasMaterial) return false;
        }
        
        // Wattage filter (for solar products)
        if (selectedWattages.length > 0 && product.subsidiary === 'sunwatch') {
            const hasWattage = selectedWattages.some(wattage => 
                product.name.toLowerCase().includes(wattage + 'w')
            );
            if (!hasWattage) return false;
        }
        
        return true;
    });

    // Sort filtered products
    sortProducts(currentSort);
    
    // Reset to first page
    currentPage = 1;
    
    // Update display
    displayProducts(filteredProducts);
    updateShowingInfo();
}

function updatePriceInputs() {
    const minVal = parseInt(rangeMin.value);
    const maxVal = parseInt(rangeMax.value);
    
    document.getElementById('min-price').value = minVal;
    document.getElementById('max-price').value = maxVal;
    
    // Update slider track
    const sliderTrack = document.querySelector('.slider-track');
    const minPercent = (minVal / 50000) * 100;
    const maxPercent = (maxVal / 50000) * 100;
    sliderTrack.style.left = minPercent + '%';
    sliderTrack.style.width = (maxPercent - minPercent) + '%';
    
    // Apply filters after a delay
    clearTimeout(window.priceFilterTimeout);
    window.priceFilterTimeout = setTimeout(applyFilters, 500);
}

function updatePriceSlider() {
    const minVal = parseInt(document.getElementById('min-price').value) || 0;
    const maxVal = parseInt(document.getElementById('max-price').value) || 50000;
    
    rangeMin.value = minVal;
    rangeMax.value = maxVal;
    
    // Update slider track
    const sliderTrack = document.querySelector('.slider-track');
    const minPercent = (minVal / 50000) * 100;
    const maxPercent = (maxVal / 50000) * 100;
    sliderTrack.style.left = minPercent + '%';
    sliderTrack.style.width = (maxPercent - minPercent) + '%';
    
    // Apply filters after a delay
    clearTimeout(window.priceFilterTimeout);
    window.priceFilterTimeout = setTimeout(applyFilters, 500);
}

function clearFilters() {
    // Clear category checkboxes
    document.querySelectorAll('input[name="category"]').forEach(cb => {
        cb.checked = true;
    });
    
    // Clear material checkboxes
    document.querySelectorAll('input[name="material"]').forEach(cb => {
        cb.checked = false;
    });
    
    // Clear wattage checkboxes
    document.querySelectorAll('input[name="wattage"]').forEach(cb => {
        cb.checked = false;
    });
    
    // Clear color selections
    document.querySelectorAll('.color-option').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Reset price range
    document.getElementById('min-price').value = 0;
    document.getElementById('max-price').value = 50000;
    rangeMin.value = 0;
    rangeMax.value = 50000;
    
    // Update slider track
    const sliderTrack = document.querySelector('.slider-track');
    sliderTrack.style.left = '0%';
    sliderTrack.style.width = '100%';
    
    // Reset sort to default
    document.getElementById('sort-select').value = 'popularity';
    currentSort = 'popularity';
    
    // Apply filters
    applyFilters();
}

function displayProducts(products) {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;
    
    // Clear current products
    productsGrid.innerHTML = '';
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productsToShow = products.slice(startIndex, endIndex);
    
    if (productsToShow.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-products">
                <i class="fas fa-search"></i>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search criteria</p>
                <button class="btn btn-outline clear-filters">Clear All Filters</button>
            </div>
        `;
        
        // Re-attach clear filters event
        document.querySelector('.clear-filters').addEventListener('click', clearFilters);
        return;
    }
    
    // Display products
    productsToShow.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
    
    // Update pagination visibility
    updatePagination(products.length);
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = `product-card ${currentView}`;
    card.dataset.id = product.id;
    
    // Resolve image (use product image if available, otherwise free Picsum placeholder)
    const imgSrc = (product.images && product.images.length) ? product.images[0] : `https://picsum.photos/seed/product-${product.id}/400/300`;

    // Format price
    const formattedPrice = new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 0
    }).format(product.price);
    
    const formattedOldPrice = product.oldPrice ? 
        new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0
        }).format(product.oldPrice) : '';
    
    // Get subsidiary badge color
    const subsidiaryColors = {
        'executive': 'executive',
        'setpaints': 'setpaints',
        'sethardware': 'sethardware',
        'sunwatch': 'sunwatch'
    };
    
    const badgeClass = subsidiaryColors[product.subsidiary] || 'executive';
    
    // Create stars HTML
    const stars = createStars(product.rating);
    
    card.innerHTML = `
        <div class="product-image">
            <div class="product-badge ${badgeClass}">${getSubsidiaryName(product.subsidiary)}</div>
            <button class="product-wishlist"><i class="far fa-heart"></i></button>
            <img src="${imgSrc}" alt="${product.name}" class="product-thumb">
        </div>
        <div class="product-info">
            <h3 class="product-title">
                <a href="product.html?id=${product.id}">${product.name}</a>
            </h3>
            <p class="product-description">${product.shortDescription || product.description.substring(0, 100)}...</p>
            
            <div class="product-price">
                <span class="current-price">${formattedPrice}</span>
                ${product.oldPrice ? `<span class="old-price">${formattedOldPrice}</span>` : ''}
                ${product.bulkDiscount ? `<span class="bulk-price">${product.bulkDiscount}</span>` : ''}
            </div>
            
            <div class="product-rating">
                <div class="stars">
                    ${stars}
                </div>
                <span class="review-count">(${product.reviewCount})</span>
            </div>
            
            <div class="product-actions">
                <div class="quantity-selector">
                    <button class="qty-btn minus"><i class="fas fa-minus"></i></button>
                    <input type="number" class="qty-input" value="1" min="1" max="99">
                    <button class="qty-btn plus"><i class="fas fa-plus"></i></button>
                </div>
                <button class="add-to-cart" data-id="${product.id}">
                    <i class="fas fa-shopping-cart"></i> Add
                </button>
                <button class="quick-view" data-id="${product.id}">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
        </div>
    `;
    
    // Add event listeners
    const addToCartBtn = card.querySelector('.add-to-cart');
    addToCartBtn.addEventListener('click', function() {
        addToCart(product.id, parseInt(card.querySelector('.qty-input').value));
    });
    
    const quickViewBtn = card.querySelector('.quick-view');
    quickViewBtn.addEventListener('click', function() {
        showQuickView(product.id);
    });
    
    const wishlistBtn = card.querySelector('.product-wishlist');
    wishlistBtn.addEventListener('click', function() {
        toggleWishlist(product.id, this);
    });
    
    // Quantity selector
    const qtyInput = card.querySelector('.qty-input');
    const minusBtn = card.querySelector('.qty-btn.minus');
    const plusBtn = card.querySelector('.qty-btn.plus');
    
    minusBtn.addEventListener('click', function() {
        let currentVal = parseInt(qtyInput.value);
        if (currentVal > 1) {
            qtyInput.value = currentVal - 1;
        }
    });
    
    plusBtn.addEventListener('click', function() {
        let currentVal = parseInt(qtyInput.value);
        if (currentVal < 99) {
            qtyInput.value = currentVal + 1;
        }
    });
    
    qtyInput.addEventListener('change', function() {
        let val = parseInt(this.value);
        if (isNaN(val) || val < 1) this.value = 1;
        if (val > 99) this.value = 99;
    });
    
    return card;
}

function createStars(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i === fullStars + 1 && hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    
    return stars;
}

function getSubsidiaryName(subsidiaryCode) {
    const subsidiaries = {
        'executive': 'Executive',
        'setpaints': 'SetPaints',
        'sethardware': 'Set Hardware',
        'sunwatch': 'SunWatch'
    };
    
    return subsidiaries[subsidiaryCode] || 'SevenTwenty';
}

function updateShowingInfo() {
    const showingInfo = document.getElementById('showing-info');
    if (!showingInfo) return;
    
    const startIndex = (currentPage - 1) * productsPerPage + 1;
    const endIndex = Math.min(startIndex + productsPerPage - 1, filteredProducts.length);
    const total = filteredProducts.length;
    
    showingInfo.innerHTML = `Showing <span>${startIndex}-${endIndex}</span> of <span>${total}</span> products`;
}

function updatePagination(totalProducts) {
    const totalPages = Math.ceil(totalProducts / productsPerPage);
    const pagination = document.querySelector('.pagination');
    const loadMoreSection = document.querySelector('.load-more-section');
    
    if (totalPages <= 1) {
        pagination.style.display = 'none';
        if (totalProducts <= productsPerPage) {
            loadMoreSection.style.display = 'none';
        }
    } else {
        pagination.style.display = 'flex';
        // Update page buttons (simplified - in reality would generate dynamic buttons)
    }
}

function loadMoreProducts() {
    currentPage++;
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productsToShow = filteredProducts.slice(startIndex, endIndex);
    
    const productsGrid = document.getElementById('products-grid');
    
    productsToShow.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
    
    updateShowingInfo();
    
    // Hide load more button if no more products
    if (endIndex >= filteredProducts.length) {
        document.getElementById('load-more').style.display = 'none';
    }
}

function setupQuickViewModal() {
    const modal = document.getElementById('quick-view-modal');
    const closeBtn = modal.querySelector('.modal-close');
    
    // Close modal when clicking X
    closeBtn.addEventListener('click', function() {
        modal.classList.remove('active');
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
    
    // Close with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
        }
    });
}

function showQuickView(productId) {
    const product = allProducts.find(p => p.id == productId);
    if (!product) return;
    
    const modal = document.getElementById('quick-view-modal');
    const content = modal.querySelector('.quick-view-content');
    
    // Resolve quick view image
    const qImgSrc = (product.images && product.images.length) ? product.images[0] : `https://picsum.photos/seed/product-${product.id}/800/600`;

    // Format price
    const formattedPrice = new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 0
    }).format(product.price);
    
    const stars = createStars(product.rating);
    
    content.innerHTML = `
        <div class="quick-view-image">
            <img src="${qImgSrc}" alt="${product.name}" />
        </div>
        <div class="quick-view-info">
            <h2>${product.name}</h2>
            <div class="quick-view-rating">
                <div class="stars">${stars}</div>
                <span>${product.reviewCount} reviews</span>
            </div>
            <div class="quick-view-price">
                <span class="current-price">${formattedPrice}</span>
                ${product.oldPrice ? `
                    <span class="old-price">KES ${product.oldPrice.toLocaleString()}</span>
                ` : ''}
            </div>
            <p class="quick-view-description">${product.description}</p>
            
            <div class="quick-view-features">
                <h4>Key Features:</h4>
                <ul>
                    ${product.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
            </div>
            
            <div class="quick-view-actions">
                <div class="quantity-selector">
                    <button class="qty-btn minus"><i class="fas fa-minus"></i></button>
                    <input type="number" class="qty-input" value="1" min="1" max="99">
                    <button class="qty-btn plus"><i class="fas fa-plus"></i></button>
                </div>
                <button class="btn btn-gold add-to-cart-quick" data-id="${product.id}">
                    <i class="fas fa-shopping-cart"></i> Add to Cart
                </button>
                <a href="product.html?id=${product.id}" class="btn btn-outline">
                    View Full Details
                </a>
            </div>
        </div>
    `;
    
    // Add event listeners for quick view
    const addToCartBtn = content.querySelector('.add-to-cart-quick');
    addToCartBtn.addEventListener('click', function() {
        const qty = parseInt(content.querySelector('.qty-input').value);
        addToCart(product.id, qty);
        modal.classList.remove('active');
    });
    
    // Quantity selector
    const qtyInput = content.querySelector('.qty-input');
    const minusBtn = content.querySelector('.qty-btn.minus');
    const plusBtn = content.querySelector('.qty-btn.plus');
    
    minusBtn.addEventListener('click', function() {
        let currentVal = parseInt(qtyInput.value);
        if (currentVal > 1) {
            qtyInput.value = currentVal - 1;
        }
    });
    
    plusBtn.addEventListener('click', function() {
        let currentVal = parseInt(qtyInput.value);
        if (currentVal < 99) {
            qtyInput.value = currentVal + 1;
        }
    });
    
    modal.classList.add('active');
}

function addToCart(productId, quantity = 1) {
    // Get current cart from localStorage
    let cart = JSON.parse(localStorage.getItem('sevenTwentyCart')) || [];
    
    // Find product
    const product = allProducts.find(p => p.id == productId);
    if (!product) return;
    
    // Check if product already in cart
    const existingItem = cart.find(item => item.id == productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            subsidiary: product.subsidiary,
            quantity: quantity,
            image: product.images ? product.images[0] : null
        });
    }
    
    // Save to localStorage
    localStorage.setItem('sevenTwentyCart', JSON.stringify(cart));
    
    // Update cart count in header
    updateCartCount();
    
    // Show success message
    showToast('Product added to cart!');
}

function toggleWishlist(productId, button) {
    let wishlist = JSON.parse(localStorage.getItem('sevenTwentyWishlist')) || [];
    
    const index = wishlist.indexOf(productId);
    
    if (index > -1) {
        // Remove from wishlist
        wishlist.splice(index, 1);
        button.innerHTML = '<i class="far fa-heart"></i>';
        button.style.color = '#666';
        showToast('Removed from wishlist');
    } else {
        // Add to wishlist
        wishlist.push(productId);
        button.innerHTML = '<i class="fas fa-heart"></i>';
        button.style.color = '#c62828';
        showToast('Added to wishlist');
    }
    
    localStorage.setItem('sevenTwentyWishlist', JSON.stringify(wishlist));
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('sevenTwentyCart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Update cart count in header
    const cartCounts = document.querySelectorAll('.cart-count');
    cartCounts.forEach(el => {
        el.textContent = totalItems;
        el.style.display = totalItems > 0 ? 'flex' : 'none';
    });
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

// Initialize cart count on page load
updateCartCount();