// Store product data from EJS template
let productData = {};

// Initialize product data when page loads
function initializeProductData() {
    // Extract product data from the DOM
    const productElements = document.querySelectorAll('[data-product-id]');
    
    productElements.forEach(element => {
        const productId = element.getAttribute('data-product-id');
        const priceElement = element.querySelector('.original-price');
        const discountElement = element.querySelector('.discount-percent');
        
        if (priceElement && productId) {
            const originalPrice = parseFloat(priceElement.textContent.replace('₹', '').replace(',', ''));
            const discount = discountElement ? parseInt(discountElement.textContent.replace('%', '')) : 0;
            
            productData[productId] = {
                originalPrice: originalPrice,
                discount: discount,
                finalPrice: originalPrice * (1 - discount / 100)
            };
        }
    });
}

// Update quantity for a specific product
function updateQuantity(productId, action) {
    const quantityElement = document.getElementById(`qty-${productId}`);
    if (!quantityElement) return;
    
    let currentQuantity = parseInt(quantityElement.textContent);
    
    // Update quantity based on action
    if (action === 'increase') {
        currentQuantity += 1;
    } else if (action === 'decrease' && currentQuantity > 1) {
        currentQuantity -= 1;
    }
    
    // Update the quantity display with zero padding
    const formattedQuantity = currentQuantity.toString().padStart(2, '0');
    console.log(`Updating quantity for product ${productId}: ${formattedQuantity}`);
    quantityElement.textContent = formattedQuantity;
    
    // Update all quantity displays for this product
    const allQuantityElements = document.querySelectorAll(`.quantity[data-product-id="${productId}"]`);
    allQuantityElements.forEach(el => {
        el.textContent = formattedQuantity;
    });
    
    // Recalculate total amounts
    calculateTotals();
}

// Calculate and update all totals
function calculateTotals() {
    let totalMRP = 0;
    let totalDiscount = 0;
    const platformFee = 20;
    
    // Loop through all quantity elements
    const quantityElements = document.querySelectorAll('[id^="qty-"]');
    
    quantityElements.forEach(qtyElement => {
        const productId = qtyElement.id.replace('qty-', '');
        const quantity = parseInt(qtyElement.textContent);
        
        // Find product data in DOM if not in productData object
        if (!productData[productId]) {
            const productContainer = qtyElement.closest('[data-product-id]') || 
                                   document.querySelector(`[data-product-id="${productId}"]`);
            
            if (productContainer) {
                // Try to find price elements
                const boldPriceElement = productContainer.querySelector('.font-bold');
                const lineThroughElement = productContainer.querySelector('.line-through');
                const discountElement = productContainer.querySelector('.bg-red-500');
                
                let originalPrice = 0;
                let discount = 0;
                
                if (lineThroughElement) {
                    // Original price is the crossed-out price
                    originalPrice = parseFloat(lineThroughElement.textContent.replace('₹', '').replace(',', ''));
                } else if (boldPriceElement) {
                    // If no crossed-out price, use the bold price as original
                    originalPrice = parseFloat(boldPriceElement.textContent.replace('₹', '').replace(',', ''));
                }
                
                if (discountElement) {
                    const discountMatch = discountElement.textContent.match(/(\d+)%/);
                    discount = discountMatch ? parseInt(discountMatch[1]) : 0;
                }
                
                productData[productId] = {
                    originalPrice: originalPrice,
                    discount: discount,
                    finalPrice: originalPrice * (1 - discount / 100)
                };
            }
        }
        
        // Calculate totals for this product
        if (productData[productId]) {
            const product = productData[productId];
            const itemMRP = product.originalPrice * quantity;
            const itemDiscount = (product.originalPrice * (product.discount / 100)) * quantity;
            
            totalMRP += itemMRP;
            totalDiscount += itemDiscount;
            
            console.log(`Product ${productId}: Qty=${quantity}, Price=₹${product.originalPrice}, Discount=${product.discount}%, MRP=₹${itemMRP}, Discount=₹${itemDiscount}`);
        }
    });
    
    const finalAmount = totalMRP - totalDiscount + platformFee;
    
    console.log(`Totals - MRP: ₹${totalMRP}, Discount: ₹${totalDiscount}, Platform Fee: ₹${platformFee}, Final: ₹${finalAmount}`);
    
    // Update the display
    updatePriceDisplay(totalMRP, totalDiscount, platformFee, finalAmount);
}

// Update price display elements
function updatePriceDisplay(totalMRP, totalDiscount, platformFee, finalAmount) {
    // Update Total MRP
    const mrpElements = document.querySelectorAll('.total-mrp, [data-total="mrp"]');
    mrpElements.forEach(el => {
        el.textContent = `₹${totalMRP.toFixed(2)}`;
    });
    
    // Update Discount
    const discountElements = document.querySelectorAll('.total-discount, [data-total="discount"]');
    discountElements.forEach(el => {
        el.textContent = `-₹${totalDiscount.toFixed(2)}`;
    });
    
    // Update Platform Fee
    const feeElements = document.querySelectorAll('.platform-fee, [data-total="fee"]');
    feeElements.forEach(el => {
        el.textContent = `₹${platformFee.toFixed(2)}`;
    });
    
    // Update Final Total - try multiple selectors
    const totalSelectors = [
        '#totalAmount',
        '.total-amount',
        '.text-xl.font-bold.text-green-700',
        '[data-total="final"]'
    ];
    
    let updated = false;
    totalSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            el.textContent = `₹${finalAmount.toFixed(2)}`;
            updated = true;
        });
    });
    
    if (!updated) {
        console.warn('Could not find total amount element to update');
    }
}

// Handle checkout process
function proceedToCheckout() {
    const cartItems = [];
    const quantityElements = document.querySelectorAll('[id^="qty-"]');
    
    quantityElements.forEach(qtyElement => {
        const productId = qtyElement.id.replace('qty-', '');
        const quantity = parseInt(qtyElement.textContent);
        
        if (quantity > 0) {
            cartItems.push({
                productId: productId,
                quantity: quantity
            });
        }
    });
    
    if (cartItems.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    // Send checkout request
    fetch('/checkout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: cartItems })
    })
    .then(response => {
        if (response.ok) {
            window.location.href = '/checkout';
        } else {
            throw new Error('Checkout failed');
        }
    })
    .catch(error => {
        console.error('Checkout error:', error);
        alert('Failed to proceed to checkout. Please try again.');
    });
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Cart JavaScript loaded');
    
    // Initialize product data
    initializeProductData();
    
    // Set initial quantities to 01 and calculate totals
    const quantityElements = document.querySelectorAll('[id^="qty-"]');
    quantityElements.forEach(el => {
        el.textContent = '01';
    });
    
    // Calculate initial totals
    setTimeout(() => {
        calculateTotals();
    }, 100);
});