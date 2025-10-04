let products = [];

// Fetch products from backend
async function fetchProducts() {
    try {
        const response = await fetch('/owners/admin/products');
        const data = await response.json();
        if (data.success) {
            products = data.products.map(product => ({
                ...product,
                status: parseInt(product.stock) < 10 ? 'low_stock' : 'active'
            }));
            renderProducts();
            updateStats();
            showNotification('Products loaded successfully', 'success');
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        showNotification('Error loading products', 'error');
    }
}

// Show notification
function showNotification(message, type = 'success') {
    const notificationDiv = document.createElement('div');
    notificationDiv.className = `fixed top-4 right-4 p-4 rounded-lg ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white shadow-lg z-50 animate-fade-in`;
    notificationDiv.textContent = message;
    document.body.appendChild(notificationDiv);
    setTimeout(() => {
        notificationDiv.remove();
    }, 3000);
}// Fetch orders from backend
// async function fetchOrders() {
//     try {
//         const response = await fetch('/products/orders');
//         const data = await response.json();
//         if (data.success) {
//             orders = data.orders;
//             renderOrderAnalytics();
//             updateStats();
//         }
//     } catch (error) {
//         console.error('Error fetching orders:', error);
//     }
// }

let editingProductId = null;

// Initialize the dashboard
function initDashboard() {
    feather.replace();
    renderProducts();
    renderOrderAnalytics();
    updateStats();
}

// Tab switching
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });

    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active', 'border-blue-500', 'text-blue-600');
        btn.classList.add('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
    });

    // Show selected tab
    document.getElementById(tabName + 'Content').classList.remove('hidden');

    // Add active class to selected tab button
    const activeButton = document.getElementById(tabName + 'Tab');
    activeButton.classList.add('active', 'border-blue-500', 'text-blue-600');
    activeButton.classList.remove('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
}

// Render products table
function renderProducts() {
    const tbody = document.getElementById('productsTable');
    tbody.innerHTML = '';

    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="h-16 w-16 flex-shrink-0">
                        <img class="h-16 w-16 rounded-lg object-cover" 
                             src="${product.image}" 
                             alt="${product.name}">
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">${product.name}</div>
                        <div class="text-sm text-gray-500">${product.description}</div>
                        <div class="text-xs text-gray-400">Category: ${product.category}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">₹${product.price}</div>
                ${product.discount > 0 ? 
                    `<div class="text-xs text-green-600">-${product.discount}% off</div>` : 
                    ''}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${product.stock}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }">
                    ${product.status === 'active' ? 'Active' : 'Low Stock'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex space-x-2">
                    <div class="w-6 h-6 rounded-full" style="background-color: ${product.bgColor}"></div>
                    <div class="w-6 h-6 rounded-full" style="background-color: ${product.textColor}"></div>
                    <div class="w-6 h-6 rounded-full" style="background-color: ${product.panelColor}"></div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="editProduct('${product._id}')" class="text-blue-600 hover:text-blue-900 mr-3">
                    <i data-feather="edit" class="h-4 w-4"></i>
                </button>
                <button onclick="deleteProduct('${product._id}')" class="text-red-600 hover:text-red-900">
                    <i data-feather="trash-2" class="h-4 w-4"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    feather.replace();
}

// Render order analytics
function renderOrderAnalytics() {
    const ordersByProduct = {};
    orders.forEach(order => {
        if (ordersByProduct[order.productName]) {
            ordersByProduct[order.productName] += order.quantity;
        } else {
            ordersByProduct[order.productName] = order.quantity;
        }
    });

    const container = document.getElementById('ordersByProduct');
    container.innerHTML = '';

    Object.entries(ordersByProduct).forEach(([productName, quantity]) => {
        const div = document.createElement('div');
        div.className = 'flex justify-between items-center p-3 bg-white rounded border';
        div.innerHTML = `
                    <span class="text-sm font-medium text-gray-900">${productName}</span>
                    <span class="text-sm text-gray-600">${quantity} orders</span>
                `;
        container.appendChild(div);
    });

    // Recent orders
    const recentContainer = document.getElementById('recentOrders');
    recentContainer.innerHTML = '';

    orders.slice(0, 5).forEach(order => {
        const div = document.createElement('div');
        div.className = 'flex justify-between items-center p-3 bg-white rounded border';
        div.innerHTML = `
                    <div>
                        <div class="text-sm font-medium text-gray-900">${order.productName}</div>
                        <div class="text-xs text-gray-500">${order.customer}</div>
                    </div>
                    <div class="text-right">
                        <div class="text-sm text-gray-900">Qty: ${order.quantity}</div>
                        <div class="text-xs text-gray-500">${order.date}</div>
                    </div>
                `;
        recentContainer.appendChild(div);
    });
}

// Update dashboard stats
function updateStats() {
    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('totalOrders').textContent = orders.length;
}

// Product modal functions
function showAddProductModal() {
    editingProductId = null;
    document.getElementById('modalTitle').textContent = 'Add New Product';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('productModal').classList.remove('hidden');
}

function editProduct(id) {
    const product = products.find(p => p._id === id);
    if (product) {
        editingProductId = id;
        document.getElementById('modalTitle').textContent = 'Edit Product';
        document.getElementById('productId').value = product._id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productStock').value = product.stock || 0;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productCategory').value = product.category;
        
        // Set color values
        document.getElementById('bgColor').value = product.bgColor;
        document.getElementById('textColor').value = product.textColor;
        document.getElementById('panelColor').value = product.panelColor;
        
        // Update color preview if you have one
        updateColorPreview();
        
        // Show current image preview if exists
        const imagePreview = document.getElementById('imagePreview');
        if (imagePreview && product.image) {
            imagePreview.src = product.image;
            imagePreview.classList.remove('hidden');
        }
        
        document.getElementById('productModal').classList.remove('hidden');
    }
}

function hideProductModal() {
    document.getElementById('productModal').classList.add('hidden');
}

async function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            const response = await fetch(`/products/${id}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (data.success) {
                await fetchProducts(); // Refresh the products list
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Error deleting product: ' + error.message);
        }
    }
}

// Handle form submission
document.getElementById('productForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', document.getElementById('productName').value);
    formData.append('price', document.getElementById('productPrice').value);
    formData.append('stock', document.getElementById('productStock').value);
    formData.append('description', document.getElementById('productDescription').value);
    formData.append('category', document.getElementById('productCategory').value);
    
    const imageInput = document.getElementById('productImage');
    if (imageInput.files[0]) {
        formData.append('image', imageInput.files[0]);
    }

    // Add color settings
    formData.append('bgColor', document.getElementById('bgColor').value);
    formData.append('textColor', document.getElementById('textColor').value);
    formData.append('panelColor', document.getElementById('panelColor').value);

    try {
        if (editingProductId) {
            // Edit existing product
            const response = await fetch(`/products/update/${editingProductId}`, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message);
            }
            showNotification('Product updated successfully', 'success');
        } else {
            // Add new product
            const response = await fetch('/products/create', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message);
            }
            showNotification('Product created successfully', 'success');
        }
        
        await fetchProducts(); // Refresh the products list
        hideProductModal();
    } catch (error) {
        console.error('Error saving product:', error);
        alert('Error saving product: ' + error.message);
    }
});

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    initDashboard();
    await fetchProducts();
});

// Add CSS for active tab
const style = document.createElement('style');
style.textContent = `
            .tab-button.active {
                border-color: #3B82F6;
                color: #2563EB;
            }
            .tab-button:not(.active) {
                border-color: transparent;
                color: #6B7280;
            }
            .tab-button:not(.active):hover {
                color: #374151;
                border-color: #D1D5DB;
            }
        `;
document.head.appendChild(style);
