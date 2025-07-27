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
    const discount = document.getElementById('discount').value;
    const bgColor = document.getElementById('bgColor').value;
    const textColor = document.getElementById('textColor').value;
    const panelColor = document.getElementById('panelColor').value;
    const imagePreview = document.getElementById('imagePreview').src;

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
                </div>
            </div>
        </div>
    `;
    } else {
        preview.innerHTML = '<p class="text-gray-400 text-sm">Preview will appear here as you fill the form</p>';
    }
}

// Add event listeners for live preview
['name', 'price', 'discount'].forEach(id => {
    document.getElementById(id).addEventListener('input', updateLivePreview);
});

// Auto-hide flash messages
function hideMessage(elementId) {
    const element = document.getElementById(elementId);
    if (element && !element.classList.contains('hidden')) {
        setTimeout(() => {
            element.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
            element.style.opacity = '0';
            element.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                element.classList.add('hidden');
            }, 500);
        }, 5000);
    }
}

// Show flash messages if they exist (you can call these based on server response)
// hideMessage('successMessage');
// hideMessage('errorMessage');

// Form validation and submission
document.querySelector('form').addEventListener('submit', function (e) {
    const requiredFields = ['name', 'price', 'image', 'bgColor', 'textColor', 'panelColor', 'category'];
    let hasErrors = false;

    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            field.classList.add('border-red-500', 'ring-red-100');
            field.classList.remove('border-gray-200');
            hasErrors = true;
        } else {
            field.classList.remove('border-red-500', 'ring-red-100');
            field.classList.add('border-gray-200');
        }
    });

    if (hasErrors) {
        e.preventDefault();
        // Show error message
        const errorMsg = document.getElementById('errorMessage');
        errorMsg.classList.remove('hidden');
        errorMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
        hideMessage('errorMessage');
    }
});