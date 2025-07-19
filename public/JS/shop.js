// Shop.js - Complete functionality for ShopHub shop page

// Global variables
let cart = [];
let allProducts = [];

// Initialize the shop when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeShop();
    loadCartFromStorage();
    updateCartUI();
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
    
    // Cart modal click outside to close
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        cartModal.addEventListener('click', function(e) {
            if (e.target === cartModal) {
                closeCartModal();
            }
        });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(e) {
    // Escape key to close cart modal
    if (e.key === 'Escape') {
        closeCartModal();
    }
    
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
        productCountElement.textContent = `Showing ${displayCount} product${displayCount !== 1 ? 's' : ''}`;
    }
}

// Add item to cart
function addToCart(productId, productName, price, image) {
    // Check if item already exists in cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
        showToast(`Updated quantity for ${productName}`, 'success');
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: parseFloat(price),
            image: image,
            quantity: 1
        });
        showToast(`${productName} added to cart`, 'success');
    }
    
    updateCartUI();
    saveCartToStorage();
    
    // Add click animation to the button
    const button = event.target;
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
        button.style.transform = '';
    }, 150);
}

// Remove item from cart
function removeFromCart(productId) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
        const removedItem = cart[itemIndex];
        cart.splice(itemIndex, 1);
        showToast(`${removedItem.name} removed from cart`, 'info');
        updateCartUI();
        saveCartToStorage();
    }
}

// Update item quantity in cart
function updateQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = newQuantity;
            updateCartUI();
            saveCartToStorage();
        }
    }
}

// Update cart UI elements
function updateCartUI() {
    updateCartCount();
    updateCartModal();
}

// Update cart count badge
function updateCartCount() {
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        if (totalItems > 0) {
            cartCountElement.textContent = totalItems;
            cartCountElement.classList.remove('hidden');
            
            // Add bounce animation
            cartCountElement.style.animation = 'bounce 0.3s ease-out';
        } else {
            cartCountElement.classList.add('hidden');
        }
    }
}

// Update cart modal content
function updateCartModal() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalElement = document.getElementById('cartTotal');
    
    if (!cartItemsContainer || !cartTotalElement) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.68 4.72a1 1 0 00.95 1.28h9.46a1 1 0 00.95-1.28L15 13M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6"/>
                </svg>
                <p class="text-lg">Your cart is empty</p>
            </div>
        `;
        cartTotalElement.textContent = '₹0.00';
    } else {
        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="flex items-center space-x-4 bg-white/50 rounded-lg p-4 backdrop-blur-sm">
                <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded-lg">
                <div class="flex-1">
                    <h4 class="font-semibold text-gray-900">${item.name}</h4>
                    <p class="text-gray-600">₹${item.price.toFixed(2)}</p>
                </div>
                <div class="flex items-center space-x-2">
                    <button onclick="updateQuantity('${item.id}', ${item.quantity - 1})" 
                            class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
                        </svg>
                    </button>
                    <span class="w-8 text-center font-semibold">${item.quantity}</span>
                    <button onclick="updateQuantity('${item.id}', ${item.quantity + 1})" 
                            class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v12m6-6H6"/>
                        </svg>
                    </button>
                </div>
                <button onclick="removeFromCart('${item.id}')" 
                        class="text-red-500 hover:text-red-700 p-2 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                </button>
            </div>
        `).join('');
        
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotalElement.textContent = `₹${total.toFixed(2)}`;
    }
}

// Open cart modal
function openCartModal() {
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        cartModal.classList.remove('hidden');
        cartModal.classList.add('flex');
        document.body.style.overflow = 'hidden';
        
        // Add fade-in animation
        cartModal.style.opacity = '0';
        setTimeout(() => {
            cartModal.style.opacity = '1';
        }, 10);
    }
}

// Close cart modal
function closeCartModal() {
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        cartModal.style.opacity = '0';
        setTimeout(() => {
            cartModal.classList.add('hidden');
            cartModal.classList.remove('flex');
            document.body.style.overflow = '';
        }, 300);
    }
}

// Checkout function
function checkout() {
    if (cart.length === 0) {
        showToast('Your cart is empty', 'error');
        return;
    }
    
    // Here you would typically integrate with a payment gateway
    // For now, we'll just show a success message
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Simulate processing
    showToast('Processing your order...', 'info');
    
    setTimeout(() => {
        showToast(`Order placed successfully! Total: ₹${total.toFixed(2)}`, 'success');
        cart = [];
        updateCartUI();
        saveCartToStorage();
        closeCartModal();
    }, 2000);
}

// Show toast notification
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast px-6 py-3 rounded-lg text-white font-medium shadow-lg transform translate-x-full transition-transform duration-300 ${getToastColor(type)}`;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
    }, 10);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.add('translate-x-full');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Get toast color based on type
function getToastColor(type) {
    switch (type) {
        case 'success':
            return 'bg-green-500';
        case 'error':
            return 'bg-red-500';
        case 'warning':
            return 'bg-yellow-500';
        default:
            return 'bg-blue-500';
    }
}

// Save cart to localStorage
function saveCartToStorage() {
    try {
        localStorage.setItem('shophub_cart', JSON.stringify(cart));
    } catch (error) {
        console.warn('Could not save cart to localStorage:', error);
    }
}

// Load cart from localStorage
function loadCartFromStorage() {
    try {
        const savedCart = localStorage.getItem('shophub_cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
        }
    } catch (error) {
        console.warn('Could not load cart from localStorage:', error);
        cart = [];
    }
}

// Clear cart
function clearCart() {
    if (cart.length === 0) {
        showToast('Cart is already empty', 'info');
        return;
    }
    
    if (confirm('Are you sure you want to clear your cart?')) {
        cart = [];
        updateCartUI();
        saveCartToStorage();
        showToast('Cart cleared', 'info');
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
        
        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-5px); }
            60% { transform: translateY(-3px); }
        }
        
        .toast {
            max-width: 300px;
        }
    `;
    document.head.appendChild(style);
}

// Initialize animations
addAnimations();

// Export functions for global access (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        addToCart,
        removeFromCart,
        updateQuantity,
        openCartModal,
        closeCartModal,
        checkout,
        clearCart
    };
}