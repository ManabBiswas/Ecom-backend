// Global variables
let allProducts = [];

// Initialize the shop when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeShop();
});

// Initialize shop functionality
function initializeShop() {
    // Store all products for filtering
    allProducts = Array.from(document.querySelectorAll('.product-card'));
    
    // Set up event listeners
    setupEventListeners();
    
    // Update initial product count
    updateProductCount();
}

// Set up all event listeners
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    // Category filter
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', handleFiltering);
    }
    
    // Sort functionality
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSorting);
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.focus();
        }
    }
}

// Search functionality
function handleSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const categoryFilter = document.getElementById('categoryFilter').value;
    
    filterProducts(searchTerm, categoryFilter);
}

// Category filtering
function handleFiltering() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const categoryFilter = document.getElementById('categoryFilter').value;
    
    filterProducts(searchTerm, categoryFilter);
}

// Filter products based on search and category
function filterProducts(searchTerm, category) {
    let visibleCount = 0;
    
    allProducts.forEach(product => {
        const productName = product.dataset.name || '';
        const productCategory = product.dataset.category || '';
        
        // Check search term match
        const matchesSearch = !searchTerm || productName.includes(searchTerm);
        
        // Check category match
        const matchesCategory = category === 'all' || productCategory === category;
        
        // Show/hide product
        if (matchesSearch && matchesCategory) {
            product.style.display = 'block';
            // Add fade-in animation
            product.style.animation = 'fadeIn 0.3s ease-in';
            visibleCount++;
        } else {
            product.style.display = 'none';
        }
    });
    
    // Update product count
    updateProductCount(visibleCount);
    
    // Show/hide no products message
    const noProductsMessage = document.getElementById('noFilteredProducts');
    if (noProductsMessage) {
        if (visibleCount === 0 && allProducts.length > 0) {
            noProductsMessage.classList.remove('hidden');
        } else {
            noProductsMessage.classList.add('hidden');
        }
    }
}

// Sorting functionality
function handleSorting() {
    const sortValue = document.getElementById('sortSelect').value;
    const productGrid = document.getElementById('productGrid');
    
    if (!productGrid) return;
    
    const products = Array.from(productGrid.children).filter(child => 
        child.classList.contains('product-card')
    );
    
    products.sort((a, b) => {
        switch (sortValue) {
            case 'name':
                return (a.dataset.name || '').localeCompare(b.dataset.name || '');
            
            case 'price-low':
                return parseFloat(a.dataset.price || 0) - parseFloat(b.dataset.price || 0);
            
            case 'price-high':
                return parseFloat(b.dataset.price || 0) - parseFloat(a.dataset.price || 0);
            
            default:
                return 0;
        }
    });
    
    // Reorder products in DOM
    products.forEach(product => {
        productGrid.appendChild(product);
    });
    
    // Add sorting animation
    products.forEach((product, index) => {
        product.style.animation = `slideIn 0.3s ease-out ${index * 0.05}s`;
    });
}

// Update product count display
function updateProductCount(count) {
    const productCountElement = document.getElementById('productCount');
    if (productCountElement) {
        const displayCount = count !== undefined ? count : allProducts.length;
        const baseText = productCountElement.textContent.split(' products')[0].split(' product')[0];
        const productText = displayCount !== 1 ? 'products' : 'product';
        productCountElement.textContent = `Showing ${displayCount} ${productText}`;
    }
}

// Add CSS animations dynamically
function addAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideIn {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
        }
    `;
    document.head.appendChild(style);
}

// Initialize animations
addAnimations();