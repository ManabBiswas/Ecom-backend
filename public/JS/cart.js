// Store product data from EJS template
let productData = {};

// Initialize product data when page loads
function initializeProductData() {
    // Extract product data from the DOM
    const productElements = document.querySelectorAll('[data-product-id]');

    productElements.forEach(element => {
        const productId = element.getAttribute('data-product-id');
        const originalPriceElement = document.querySelector(`#original-price-${productId}`);
        const discountElement = document.querySelector(`#discount-${productId}`);

        if (originalPriceElement && productId) {
            const originalPrice = parseFloat(originalPriceElement.textContent.replace('₹', '').replace(',', ''));
            const discount = discountElement ? parseInt(discountElement.textContent.match(/(\d+)%/)[1]) : 0;

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
    // console.log(`Updating quantity for product ${productId}: ${formattedQuantity}`);
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
    // Ensure productData exists
    if (typeof productData === 'undefined') {
        window.productData = {};
    }

    let totalMRP = 0;
    let totalDiscount = 0;
    const platformFee = 20;

    const quantityElements = document.querySelectorAll('.quantityD');

    quantityElements.forEach(qtyElement => {
        try {
            const productId = qtyElement.dataset.productId;
            const quantity = parseInt(qtyElement.textContent) || 0;

            if (quantity <= 0) return; // Skip if no quantity

            // Get or parse product data
            if (!productData[productId]) {
                const productContainer = qtyElement.closest('.space-y-4');
                if (!productContainer) return;

                let originalPrice = 0;
                let discount = 0;

                // More robust price parsing
                const priceElements = productContainer.querySelectorAll('span');

                priceElements.forEach(priceElement => {
                    const text = priceElement.textContent.trim();

                    // Check for price (contains ₹ symbol)
                    if (text.includes('₹') && !originalPrice) {
                        originalPrice = parseFloat(text.replace('₹', '').replace(/,/g, '')) || 0;
                    }

                    // Check for discount percentage
                    if (priceElement.classList.contains('bg-red-500')) {
                        const discountMatch = text.match(/(\d+)%/);
                        discount = discountMatch ? parseInt(discountMatch[1]) : 0;
                    }
                });

                if (originalPrice > 0) {
                    productData[productId] = {
                        originalPrice: originalPrice,
                        discount: discount,
                        finalPrice: originalPrice * (1 - discount / 100)
                    };
                }
            }

            // Calculate totals
            if (productData[productId]) {
                const product = productData[productId];
                const itemMRP = product.originalPrice * quantity;
                const itemDiscount = (product.originalPrice * product.discount / 100) * quantity;

                totalMRP += itemMRP;
                totalDiscount += itemDiscount;
            }
        } catch (error) {
            console.error('Error processing product:', error);
        }
    });

    const finalAmount = totalMRP - totalDiscount + platformFee;

    // console.log(`Total MRP: ₹${totalMRP.toFixed(2)}, Total Discount: ₹${totalDiscount.toFixed(2)}, Platform Fee: ₹${platformFee}, Final Amount: ₹${finalAmount.toFixed(2)}`);

    // Update display if function exists
    if (typeof updatePriceDisplay === 'function') {
        updatePriceDisplay(totalMRP, totalDiscount, platformFee, finalAmount);
    }
}

// Update price display elements
function updatePriceDisplay(totalMRP, totalDiscount, platformFee, finalAmount) {
    // Update Total MRP
    const mrpElements = document.querySelectorAll('#cartTotalMRP');
    mrpElements.forEach(el => {
        el.textContent = `₹${totalMRP.toFixed(2)}`;
    });

    // Update Discount
    const discountElements = document.querySelectorAll('#cartDiscount');
    discountElements.forEach(el => {
        el.textContent = `-₹${totalDiscount.toFixed(2)}`;
    });

    // Update Platform Fee
    const feeElements = document.querySelectorAll('#cartPlatformFee');
    feeElements.forEach(el => {
        el.textContent = `₹${platformFee.toFixed(2)}`;
    });

    // Update Final Total
    const totalElements = document.querySelectorAll('#cartTotal');
    totalElements.forEach(el => {
        el.textContent = `₹${finalAmount.toFixed(2)}`;
    });
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
document.addEventListener('DOMContentLoaded', function () {
    // console.log('Cart JavaScript loaded');

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