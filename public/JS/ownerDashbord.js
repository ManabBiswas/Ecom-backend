// Sample data - In real implementation, this would come from your backend
let products = [
    { id: 1, name: "Wireless Headphones", price: 99.99, stock: 25, description: "High-quality wireless headphones", status: "active" },
    { id: 2, name: "Smartphone Case", price: 19.99, stock: 50, description: "Protective phone case", status: "active" },
    { id: 3, name: "Bluetooth Speaker", price: 79.99, stock: 15, description: "Portable bluetooth speaker", status: "active" },
    { id: 4, name: "USB Cable", price: 12.99, stock: 100, description: "High-speed USB cable", status: "active" },
    { id: 5, name: "Laptop Stand", price: 45.99, stock: 8, description: "Adjustable laptop stand", status: "low_stock" }
];

let orders = [
    { id: 1, productId: 1, productName: "Wireless Headphones", quantity: 2, date: "2024-01-20", customer: "John Doe" },
    { id: 2, productId: 2, productName: "Smartphone Case", quantity: 1, date: "2024-01-19", customer: "Jane Smith" },
    { id: 3, productId: 1, productName: "Wireless Headphones", quantity: 1, date: "2024-01-18", customer: "Bob Johnson" },
    { id: 4, productId: 3, productName: "Bluetooth Speaker", quantity: 1, date: "2024-01-17", customer: "Alice Brown" },
    { id: 5, productId: 2, productName: "Smartphone Case", quantity: 3, date: "2024-01-16", customer: "Charlie Wilson" }
];

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
                        <div class="text-sm font-medium text-gray-900">${product.name}</div>
                        <div class="text-sm text-gray-500">${product.description}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹${product.price}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${product.stock}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                            ${product.status === 'active' ? 'Active' : 'Low Stock'}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onclick="editProduct(${product.id})" class="text-blue-600 hover:text-blue-900 mr-3">
                            <i data-feather="edit" class="h-4 w-4"></i>
                        </button>
                        <button onclick="deleteProduct(${product.id})" class="text-red-600 hover:text-red-900">
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
    const product = products.find(p => p.id === id);
    if (product) {
        editingProductId = id;
        document.getElementById('modalTitle').textContent = 'Edit Product';
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productStock').value = product.stock;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productModal').classList.remove('hidden');
    }
}

function hideProductModal() {
    document.getElementById('productModal').classList.add('hidden');
}

function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        products = products.filter(p => p.id !== id);
        renderProducts();
        updateStats();
    }
}

// Handle form submission
document.getElementById('productForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const formData = {
        name: document.getElementById('productName').value,
        price: parseFloat(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        description: document.getElementById('productDescription').value,
        status: parseInt(document.getElementById('productStock').value) < 10 ? 'low_stock' : 'active'
    };

    if (editingProductId) {
        // Edit existing product
        const index = products.findIndex(p => p.id === editingProductId);
        if (index !== -1) {
            products[index] = { ...products[index], ...formData };
        }
    } else {
        // Add new product
        const newId = Math.max(...products.map(p => p.id)) + 1;
        products.push({ id: newId, ...formData });
    }

    renderProducts();
    updateStats();
    hideProductModal();
});

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', initDashboard);

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
