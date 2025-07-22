// Function to update quantity
function updateQuantity(productId, action) {
    const quantityElement = document.getElementById(`qty-${productId}`);
    let currentQuantity = parseInt(quantityElement.textContent);

    if (action === 'increase') {
        currentQuantity += 1;
    } else if (action === 'decrease' && currentQuantity > 1) {
        currentQuantity -= 1;
    }

    // Update the display with zero padding
    quantityElement.textContent = currentQuantity.toString().padStart(2, '0');
    
    // Also update any elements with quantity class for this product
    const quantityClassElements = document.querySelectorAll(`.quantity[data-product-id="${productId}"]`);
    quantityClassElements.forEach(el => {
        el.textContent = currentQuantity.toString().padStart(2, '0');
    });

    // Update the price calculations
    updateTotalAmount();
}

// Function to calculate and update total amount
function updateTotalAmount() {
    const products = document.querySelectorAll('[id^="qty-"]');
    let totalMRP = 0;
    let totalDiscount = 0;

    products.forEach(product => {
        const productId = product.id.replace('qty-', '');
        const quantity = parseInt(product.textContent);
        
        // Get the price and discount from the product element
        const productElement = product.closest('.hover\\:bg-gray-50\\/80') || 
                              product.closest('[data-product-id="' + productId + '"]') ||
                              product.closest('.product-item');
        
        if (!productElement) {
            console.warn(`Product element not found for product ID: ${productId}`);
            return;
        }

        // Try to find the original price - look for line-through first, then fallback to bold price
        let originalPrice = 0;
        const lineThroughElement = productElement.querySelector('.line-through');
        const boldPriceElement = productElement.querySelector('.font-bold');
        
        if (lineThroughElement) {
            // If there's a line-through price, that's the original MRP
            originalPrice = parseFloat(lineThroughElement.textContent.replace('₹', '').replace(',', ''));
        } else if (boldPriceElement) {
            // If no line-through, use the bold price as original price
            originalPrice = parseFloat(boldPriceElement.textContent.replace('₹', '').replace(',', ''));
        }

        // Get discount percentage
        const discountElement = productElement.querySelector('.bg-red-500, .discount');
        let discount = 0;
        if (discountElement) {
            const discountText = discountElement.textContent;
            const discountMatch = discountText.match(/(\d+)%?/);
            discount = discountMatch ? parseInt(discountMatch[1]) : 0;
        }

        // Calculate totals
        const itemMRP = originalPrice * quantity;
        const itemDiscount = (originalPrice * (discount / 100)) * quantity;
        
        totalMRP += itemMRP;
        totalDiscount += itemDiscount;

        console.log(`Product ${productId}: Qty=${quantity}, Price=₹${originalPrice}, Discount=${discount}%, MRP=₹${itemMRP}, Discount Amount=₹${itemDiscount}`);
    });

    // Platform fee is fixed at ₹20
    const platformFee = 20;
    const finalAmount = totalMRP - totalDiscount + platformFee;

    console.log(`Total MRP: ₹${totalMRP}, Total Discount: ₹${totalDiscount}, Platform Fee: ₹${platformFee}, Final: ₹${finalAmount}`);

    // Update all the display elements
    updateDisplayElements(totalMRP, totalDiscount, platformFee, finalAmount);
}

// Function to update all display elements
function updateDisplayElements(totalMRP, totalDiscount, platformFee, finalAmount) {
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

    // Update Final Total Amount - try multiple selectors
    const totalSelectors = [
        '.text-xl.font-bold.text-green-700',
        '.total-amount',
        '[data-total="final"]',
        '.final-total'
    ];
    
    let totalUpdated = false;
    totalSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            elements.forEach(el => {
                el.textContent = `₹${finalAmount.toFixed(2)}`;
            });
            totalUpdated = true;
        }
    });

    if (!totalUpdated) {
        console.warn('Could not find total amount element to update');
    }
}

// Function to handle checkout
function proceedToCheckout() {
    // Collect cart data
    const cartData = [];
    const products = document.querySelectorAll('[id^="qty-"]');

    products.forEach(product => {
        const productId = product.id.replace('qty-', '');
        const quantity = parseInt(product.textContent);
        
        if (quantity > 0) {
            cartData.push({
                productId,
                quantity
            });
        }
    });

    if (cartData.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    // Send to checkout endpoint
    fetch('/checkout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: cartData })
    })
    .then(response => {
        if (response.ok) {
            window.location.href = '/checkout';
        } else {
            throw new Error('Checkout failed');
        }
    })
    .catch(error => {
        console.error('Error during checkout:', error);
        alert('Failed to proceed to checkout. Please try again.');
    });
}

// Initialize total amount calculation when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Add some debugging
    console.log('Cart JavaScript loaded');
    
    // Wait a bit for all elements to be rendered
    setTimeout(() => {
        updateTotalAmount();
    }, 100);
});