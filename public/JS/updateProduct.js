// Color picker synchronization
function setupColorSync(colorId, textId) {
    const colorInput = document.getElementById(colorId);
    const textInput = document.getElementById(textId);

    colorInput.addEventListener('change', function () {
        textInput.value = this.value;
        updateLivePreview();
    });

    textInput.addEventListener('input', function () {
        if (this.value.match(/^#[0-9A-F]{6}$/i)) {
            colorInput.value = this.value;
        }
        updateLivePreview();
    });
}

// Setup color synchronization
setupColorSync('bgColor', 'bgColorText');
setupColorSync('textColor', 'textColorText');
setupColorSync('panelColor', 'panelColorText');

// Image preview functionality
function previewImage(event) {
    const file = event.target.files[0];
    const previewContainer = document.getElementById('imagePreviewContainer');
    const imagePreview = document.getElementById('imagePreview');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');

    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            imagePreview.src = e.target.result;
            fileName.textContent = file.name;
            fileSize.textContent = formatFileSize(file.size);
            previewContainer.classList.remove('hidden');
            updateLivePreview();
        };

        reader.readAsDataURL(file);
    } else {
        removeImage();
    }
}

function removeImage() {
    const previewContainer = document.getElementById('imagePreviewContainer');
    const imageInput = document.getElementById('image');
    const imagePreview = document.getElementById('imagePreview');

    imageInput.value = '';
    imagePreview.src = '';
    previewContainer.classList.add('hidden');
    updateLivePreview();
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Live preview functionality
function updateLivePreview() {
    const preview = document.getElementById('livePreview');
    const name = document.getElementById('name').value;
    const price = document.getElementById('price').value;
    const stock = document.getElementById('stock').value;
    const discount = document.getElementById('discount').value;
    const bgColor = document.getElementById('bgColor').value;
    const textColor = document.getElementById('textColor').value;
    const panelColor = document.getElementById('panelColor').value;
    const imagePreview = document.getElementById('imagePreview').src || document.querySelector('img[alt="Current Product Image"]')?.src;

    if (name || price || imagePreview) {
        const discountedPrice = discount ? (price * (1 - discount / 100)).toFixed(2) : price;

        preview.innerHTML = `
        <div class="w-full p-4 rounded-lg shadow-sm" style="color: ${textColor};">
            <div class="flex items-center gap-4">
                ${imagePreview
                ? `<img src="${imagePreview}" alt="Product" class="w-16 h-16 object-cover rounded-lg" style="background-color: ${bgColor};">`
                : `<div class="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">No Image</div>`
            }
                <div class="flex-1 p-2 rounded-lg" style="background-color: ${panelColor};">
                    <h4 class="font-bold text-lg">${name || 'Product Name'}</h4>
                    <div class="flex items-center gap-2">
                        ${discount > 0 ? `<span class="text-sm line-through opacity-60">₹${price}</span>` : ''}
                        <span class="font-bold">₹${discountedPrice || price || '0.00'}</span>
                        ${discount > 0 ? `<span class="text-xs text-white italic px-2 py-1 rounded-full bg-red-500">${discount}% OFF</span>` : ''}
                    </div>
                    <div class="text-sm mt-1">Stock: ${stock || 0} units</div>
                </div>
            </div>
        </div>
    `;
    } else {
        preview.innerHTML = '<p class="text-gray-400 text-sm">Preview will update as you modify the form</p>';
    }
}

// Handle form submission
document.getElementById('updateForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    
    // Show loading state
    const submitButton = this.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="flex items-center justify-center gap-2"><svg class="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Updating...</span>';

    try {
        const formData = new FormData(this);
        const productId = this.action.split('/').pop();

        const response = await fetch(`/products/update/${productId}`, {
            method: 'POST',
            body: formData,
            credentials: 'same-origin'
        });

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Received non-JSON response from server');
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update product');
        }

        if (data.success) {
            // Show success message
            const successMsg = document.getElementById('successMessage');
            successMsg.textContent = data.message || 'Product updated successfully!';
            successMsg.classList.remove('hidden');
            successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Redirect to dashboard after delay
            setTimeout(() => {
                window.location.href = '/owners/dashboard';
            }, 2000);
        } else {
            throw new Error(data.message || 'Failed to update product');
        }
    } catch (error) {
        console.error('Error updating product:', error);
        const errorMsg = document.getElementById('errorMessage');
        errorMsg.textContent = error.message || 'Something went wrong. Please try again.';
        errorMsg.classList.remove('hidden');
        errorMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Reset button state
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
    }
});

// Initialize preview
document.addEventListener('DOMContentLoaded', updateLivePreview);

// Add event listeners for live preview
['name', 'price', 'stock', 'discount'].forEach(id => {
    document.getElementById(id).addEventListener('input', updateLivePreview);
});