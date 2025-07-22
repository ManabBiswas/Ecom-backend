/**
 * Cart functionality for ShopHub e-commerce site
 * Handles quantity updates and checkout operations
 */

/**
 * Updates the quantity of a product in the cart
 * @param {string} productId - The ID of the product to update
 * @param {string} action - Either 'increase' or 'decrease'
 */
function updateQuantity(productId, action) {
  const qtyElement = document.getElementById('qty-' + productId);
  
  if (!qtyElement) {
    console.error('Quantity element not found for product:', productId);
    return;
  }
  
  let currentQty = parseInt(qtyElement.textContent);
  
  // Validate current quantity
  if (isNaN(currentQty) || currentQty < 1) {
    currentQty = 1;
  }
  
  // Update quantity based on action
  if (action === 'increase') {
    currentQty += 1;
  } else if (action === 'decrease' && currentQty > 1) {
    currentQty -= 1;
  }
  
  // Update the display
  qtyElement.textContent = currentQty.toString().padStart(2, '0');
  
  // Store quantity in data attribute for price calculations
  qtyElement.setAttribute('data-quantity', currentQty);
  
  // Update cart on server
  updateCartQuantityOnServer(productId, currentQty);
  
  // Update the price display
  updatePriceDisplay();
}

/**
 * Updates the cart quantity on the server
 * @param {string} productId - The product ID
 * @param {number} quantity - The new quantity
 */
async function updateCartQuantityOnServer(productId, quantity) {
  try {
    const response = await fetch('/api/cart/update-quantity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId: productId,
        quantity: quantity
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to update quantity on server');
    }
    
    const result = await response.json();
    console.log('Quantity updated successfully:', result);
    
    // Show success message
    showSuccessMessage('Cart updated successfully');
    
  } catch (error) {
    console.error('Error updating quantity:', error);
    // For now, we'll continue without server sync
    // In a real app, you might want to revert the UI change
    console.log('Continuing with local update only');
  }
}

/**
 * Updates the price display based on current quantities
 */
function updatePriceDisplay() {
  try {
    let totalMRP = 0;
    let totalDiscount = 0;
    let itemCount = 0;
    
    // Get all quantity elements
    const quantityElements = document.querySelectorAll('[id^="qty-"]');
    
    quantityElements.forEach(qtyElement => {
      const quantity = parseInt(qtyElement.textContent) || 1;
      const productId = qtyElement.id.replace('qty-', '');
      
      // Find the product price elements
      const productContainer = qtyElement.closest('[data-product-id]') || 
                              qtyElement.closest('.p-6');
      
      if (productContainer) {
        // Extract price information from the DOM
        const priceElement = productContainer.querySelector('[data-original-price]') ||
                           productContainer.querySelector('.text-xl.font-bold');
        const originalPriceElement = productContainer.querySelector('.line-through');
        
        if (priceElement) {
          // Get prices (you might need to adjust this based on your exact HTML structure)
          const currentPrice = parseFloat(priceElement.textContent.replace('₹', '').replace(',', ''));
          const originalPrice = originalPriceElement ? 
                               parseFloat(originalPriceElement.textContent.replace('₹', '').replace(',', '')) : 
                               currentPrice;
          
          totalMRP += originalPrice * quantity;
          totalDiscount += (originalPrice - currentPrice) * quantity;
          itemCount += quantity;
        }
      }
    });
    
    const platformFee = 20;
    const totalAmount = totalMRP - totalDiscount + platformFee;
    
    // Update the price breakdown elements
    updatePriceElement('.total-mrp', totalMRP);
    updatePriceElement('.total-discount', totalDiscount);
    updatePriceElement('.total-amount', totalAmount);
    updateItemCount(itemCount);
    
  } catch (error) {
    console.error('Error updating price display:', error);
  }
}

/**
 * Updates a price element in the DOM
 * @param {string} selector - CSS selector for the price element
 * @param {number} value - The new price value
 */
function updatePriceElement(selector, value) {
  const element = document.querySelector(selector);
  if (element) {
    element.textContent = `₹${value.toFixed(2)}`;
  }
}

/**
 * Updates the item count display
 * @param {number} count - The new item count
 */
function updateItemCount(count) {
  const countElement = document.querySelector('.item-count');
  if (countElement) {
    countElement.textContent = `(${count} items)`;
  }
}

/**
 * Proceeds to checkout
 */
function proceedToCheckout() {
  // Basic validation before checkout
  if (!validateCartBeforeCheckout()) {
    return;
  }
  
  try {
    // Show loading state
    showCheckoutLoading();
    
    // Redirect to checkout page
    window.location.href = '/checkout';
    
  } catch (error) {
    console.error('Error proceeding to checkout:', error);
    hideCheckoutLoading();
    showErrorMessage('Unable to proceed to checkout. Please try again.');
  }
}

/**
 * Validates the cart before proceeding to checkout
 * @returns {boolean} - True if cart is valid for checkout
 */
function validateCartBeforeCheckout() {
  const cartItems = document.querySelectorAll('[id^="qty-"]');
  
  if (cartItems.length === 0) {
    showErrorMessage('Your cart is empty. Please add items before checkout.');
    return false;
  }
  
  // Check if any quantity is 0 or invalid
  for (const item of cartItems) {
    const quantity = parseInt(item.textContent);
    if (isNaN(quantity) || quantity < 1) {
      showErrorMessage('Please check product quantities before checkout.');
      return false;
    }
  }
  
  return true;
}

/**
 * Shows checkout loading state
 */
function showCheckoutLoading() {
  const checkoutBtn = document.querySelector('button[onclick="proceedToCheckout()"]');
  if (checkoutBtn) {
    checkoutBtn.disabled = true;
    checkoutBtn.innerHTML = `
      <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Processing...
    `;
  }
}

/**
 * Hides checkout loading state
 */
function hideCheckoutLoading() {
  const checkoutBtn = document.querySelector('button[onclick="proceedToCheckout()"]');
  if (checkoutBtn) {
    checkoutBtn.disabled = false;
    checkoutBtn.innerHTML = 'Proceed to Checkout';
  }
}

/**
 * Shows an error message to the user
 * @param {string} message - The error message to display
 */
function showErrorMessage(message) {
  // Create and show a toast notification or alert
  // This is a simple implementation - you might want to use a more sophisticated notification system
  
  const existingAlert = document.querySelector('.error-alert');
  if (existingAlert) {
    existingAlert.remove();
  }
  
  const alertDiv = document.createElement('div');
  alertDiv.className = 'error-alert fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
  alertDiv.innerHTML = `
    <div class="flex items-center justify-between">
      <span>${message}</span>
      <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  `;
  
  document.body.appendChild(alertDiv);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (alertDiv && alertDiv.parentNode) {
      alertDiv.remove();
    }
  }, 5000);
}

/**
 * Shows a success message to the user
 * @param {string} message - The success message to display
 */
function showSuccessMessage(message) {
  const existingAlert = document.querySelector('.success-alert');
  if (existingAlert) {
    existingAlert.remove();
  }
  
  const alertDiv = document.createElement('div');
  alertDiv.className = 'success-alert fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
  alertDiv.innerHTML = `
    <div class="flex items-center justify-between">
      <span>${message}</span>
      <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  `;
  
  document.body.appendChild(alertDiv);
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    if (alertDiv && alertDiv.parentNode) {
      alertDiv.remove();
    }
  }, 3000);
}

/**
 * Initialize cart functionality when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('Cart functionality initialized');
  
  // You can add any initialization code here
  // For example, setting up event listeners, loading saved cart state, etc.
});

// Export functions if using modules (optional)
// export { updateQuantity, proceedToCheckout, showErrorMessage, showSuccessMessage };