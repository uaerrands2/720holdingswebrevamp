// Header and Footer Loader with Active Navigation
document.addEventListener('DOMContentLoaded', function() {
    loadHeader();
    loadFooter();
});

function loadHeader() {
    // Determine the correct path based on current location
    const headerPath = window.location.pathname.includes('/pages/') ? '../header.html' : 'header.html';
    
    const headerContainers = [
        document.getElementById('header-container'),
        document.getElementById('header-placeholder')
    ];
    
    const container = headerContainers.find(el => el !== null);
    
    if (container) {
        fetch(headerPath)
            .then(response => {
                if (!response.ok) throw new Error('Header load failed');
                return response.text();
            })
            .then(data => {
                container.innerHTML = data;
                fixNavPaths();
                setActiveNavItem();
                initializeHeaderScripts();
            })
            .catch(error => {
                console.error('Error loading header:', error);
                container.innerHTML = '<div class="loading">Loading navigation...</div>';
            });
    }
}

function loadFooter() {
    // Determine the correct path based on current location
    const footerPath = window.location.pathname.includes('/pages/') ? '../footer.html' : 'footer.html';
    
    const footerContainers = [
        document.getElementById('footer-container'),
        document.getElementById('footer-placeholder')
    ];
    
    const container = footerContainers.find(el => el !== null);
    
    if (container) {
        fetch(footerPath)
            .then(response => {
                if (!response.ok) throw new Error('Footer load failed');
                return response.text();
            })
            .then(data => {
                container.innerHTML = data;
                fixNavPaths();
                setActiveNavItem();
            })
            .catch(error => {
                console.error('Error loading footer:', error);
                container.innerHTML = '<div class="loading">Loading footer...</div>';
            });
    }
}

function fixNavPaths() {
    // Fix nav paths when loaded from /pages/ subdirectory
    const currentPath = window.location.pathname;
    const isInPages = currentPath.includes('/pages/');
    
    if (isInPages) {
        // Get all links in header and footer that might need fixing
        const allLinks = document.querySelectorAll('a[href]');
        
        // List of root-level HTML files that need ../ prefix when in /pages/
        const rootFiles = [
            'index.html', 'shop.html', 'product.html', 'cart.html', 'checkout.html',
            'privacy.html', 'terms.html', 'returns.html', 'shipping.html', 'faq.html'
        ];
        
        // List of /pages/ directory files that don't need fixing
        const pagesFiles = [
            'about.html', 'contact.html', 'get-quote.html', 'how-to-order.html'
        ];
        
        allLinks.forEach(link => {
            const href = link.getAttribute('href');
            
            // Skip if no href
            if (!href || !href.trim()) {
                return;
            }
            
            // Skip external URLs (http, https, //)
            if (href.startsWith('http') || href.startsWith('//')) {
                return;
            }
            
            // Skip absolute paths (starting with /)
            if (href.startsWith('/')) {
                return;
            }
            
            // Skip anchor-only links (#something)
            if (href.startsWith('#')) {
                return;
            }
            
            // Skip already corrected paths (../)
            if (href.startsWith('.')) {
                return;
            }
            
            // Get filename without query string
            const [filename] = href.split('?');
            
            // Check if this is a pages directory file (no fixing needed)
            const isPagesFile = pagesFiles.some(f => filename === f || href.startsWith('pages/'));
            
            if (isPagesFile) {
                // Leave pages directory files as-is
                // They already have correct relative path
                return;
            }
            
            // Check if this is a root-level file (needs ../ prefix)
            const isRootFile = rootFiles.some(f => filename === f);
            
            if (isRootFile) {
                // Add ../ prefix for root-level files
                if (href.includes('?')) {
                    // Preserve query string
                    const [file, query] = href.split('?');
                    link.setAttribute('href', '../' + file + '?' + query);
                } else {
                    link.setAttribute('href', '../' + href);
                }
            }
            // Note: unrecognized files are left as-is (safe default)
        });
    }
}

function setActiveNavItem() {
    // Get current page
    const currentPath = window.location.pathname;
    const currentFile = currentPath.split('/').pop() || 'index.html';
    
    // Map file names to page identifiers
    const pageMap = {
        'index.html': 'home',
        '': 'home',
        'shop.html': 'shop',
        'product.html': 'product',
        'cart.html': 'cart',
        'checkout.html': 'checkout',
        'about.html': 'about',
        'how-to-order.html': 'how-to-order',
        'contact.html': 'contact',
        'get-quote.html': 'get-quote',
        'privacy.html': 'privacy',
        'terms.html': 'terms',
        'returns.html': 'returns',
        'shipping.html': 'shipping',
        'faq.html': 'faq'
    };
    
    const currentPage = pageMap[currentFile] || '';
    
    // Remove active class from all nav items
    document.querySelectorAll('.nav-list a, .nav-item, a[data-page]').forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to matching nav items
    if (currentPage === 'home') {
        // Home page - match index.html or root
        const homeLinks = document.querySelectorAll('a[href*="index.html"], a[data-page="home"]');
        homeLinks.forEach(link => link.classList.add('active'));
    } else if (currentPage) {
        // Other pages - match by data-page attribute
        const activeLinks = document.querySelectorAll(`a[data-page="${currentPage}"]`);
        activeLinks.forEach(link => link.classList.add('active'));
    }
    
    // Handle dropdown menu activation for Shop
    if (currentFile === 'shop.html' || currentFile === 'product.html') {
        const shopLinks = document.querySelectorAll('a[data-page="shop"]');
        shopLinks.forEach(link => {
            link.classList.add('active');
            const dropdown = link.closest('.dropdown');
            if (dropdown) {
                dropdown.classList.add('active');
            }
        });
    }

    // Mobile hamburger active state is handled in initializeHeaderScripts()
}

function initializeHeaderScripts() {
    // Mobile menu functionality
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mainNav = document.getElementById('main-nav');
    
    if (mobileMenuBtn && mainNav) {
        // Initialize ARIA state
        mobileMenuBtn.setAttribute('aria-expanded', mobileMenuBtn.classList.contains('active') ? 'true' : 'false');
        mainNav.setAttribute('aria-hidden', mainNav.classList.contains('active') ? 'false' : 'true');

        mobileMenuBtn.addEventListener('click', function() {
            const isOpen = mainNav.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
            mobileMenuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            mainNav.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
            // prevent background scroll when open
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        // Close menu when a link is clicked and update ARIA
        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                mainNav.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                mainNav.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
            });
        });
    }
    
    // Dropdown menu functionality
    const dropdownLinks = document.querySelectorAll('.dropdown > a');
    dropdownLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const dropdown = this.closest('.dropdown');
            dropdown.classList.toggle('active');
        });
    });
    
    // Cart icon functionality
    const cartIcon = document.getElementById('cart-icon');
    if (cartIcon) {
        updateCartCount();
        // Listen for cart updates
        window.addEventListener('cartUpdated', updateCartCount);
    }
}

function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const count = localStorage.getItem('cartCount') || '0';
        cartCount.textContent = count;
    }
}

// Re-initialize active nav item when DOM changes
const observer = new MutationObserver(function(mutations) {
    // Check if nav was just added
    if (document.querySelector('.nav-list')) {
        fixNavPaths();
        setActiveNavItem();
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});
