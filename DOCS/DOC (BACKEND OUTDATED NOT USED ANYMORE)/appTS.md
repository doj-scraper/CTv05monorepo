// public/app.js
const API_URL = window.location.origin;

// =====================
// UTILITY FUNCTIONS
// =====================

function showLoading(button) {
button.disabled = true;
button.innerHTML = ‘<span class="spinner"></span> Loading…’;
}

function hideLoading(button, text) {
button.disabled = false;
button.innerHTML = text;
}

async function apiCall(endpoint) {
try {
const response = await fetch(`${API_URL}${endpoint}`);
if (!response.ok) throw new Error(`HTTP ${response.status}`);
return await response.json();
} catch (error) {
console.error(‘API Error:’, error);
throw error;
}
}

function formatPrice(cents) {
if (cents === null) return ‘N/A’;
return `$${(cents / 100).toFixed(2)}`;
}

function getStockClass(stock) {
if (stock === 0) return ‘low’;
if (stock < 50) return ‘medium’;
return ‘high’;
}

function getQualityBadge(quality) {
const classMap = {
‘OEM’: ‘badge-oem’,
‘Premium’: ‘badge-premium’,
‘Aftermarket’: ‘badge-aftermarket’,
};
return classMap[quality] || ‘’;
}

function copyToClipboard(text) {
navigator.clipboard.writeText(text).then(() => {
showNotification(‘Copied to clipboard!’, ‘success’);
});
}

function showNotification(message, type = ‘success’) {
const div = document.createElement(‘div’);
div.className = `${type}-message`;
div.textContent = message;
document.body.appendChild(div);
setTimeout(() => div.remove(), 3000);
}

// =====================
// TAB NAVIGATION
// =====================

document.querySelectorAll(’.tab-button’).forEach(button => {
button.addEventListener(‘click’, (e) => {
const tabName = e.target.dataset.tab;

```
// Hide all tabs
document.querySelectorAll('.tab-content').forEach(tab => {
  tab.classList.remove('active');
});

// Remove active class from all buttons
document.querySelectorAll('.tab-button').forEach(btn => {
  btn.classList.remove('active');
});

// Show selected tab
document.getElementById(tabName).classList.add('active');
e.target.classList.add('active');
```

});
});

// =====================
// CHECK API STATUS
// =====================

async function checkApiStatus() {
try {
const response = await apiCall(’/api/health’);
document.getElementById(‘apiStatus’).textContent = ‘● Connected’;
document.getElementById(‘apiStatus’).className = ‘status connected’;
document.getElementById(‘dbInfo’).textContent = response.timestamp;
} catch (error) {
document.getElementById(‘apiStatus’).textContent = ‘● Offline’;
document.getElementById(‘apiStatus’).className = ‘status error’;
}
}

// =====================
// 1. SEARCH PARTS
// =====================

document.getElementById(‘searchBtn’).addEventListener(‘click’, async () => {
const device = document.getElementById(‘deviceName’).value.trim();

if (!device) {
showNotification(‘Please enter a device name’, ‘error’);
return;
}

const btn = document.getElementById(‘searchBtn’);
showLoading(btn, ‘🔍 Searching…’);

try {
const data = await apiCall(`/api/parts?device=${encodeURIComponent(device)}`);

```
if (data.parts.length === 0) {
  document.getElementById('searchResults').classList.remove('hidden');
  document.getElementById('searchTable').innerHTML = '<p style="color: var(--text-muted);">No parts found for this device.</p>';
  hideLoading(btn, 'Search Parts');
  return;
}

// Create table
let html = `
  <table class="table">
    <thead>
      <tr>
        <th>SKU ID</th>
        <th>Part Name</th>
        <th>Category</th>
        <th>Price</th>
        <th>Stock</th>
        <th>Quality</th>
      </tr>
    </thead>
    <tbody>
`;

data.parts.forEach(part => {
  html += `
    <tr>
      <td><code>${part.skuId}</code></td>
      <td>${part.partName}</td>
      <td>${part.category}</td>
      <td class="price">${formatPrice(part.price * 100)}</td>
      <td class="stock ${getStockClass(part.stock)}">${part.stock}</td>
      <td><span class="badge ${getQualityBadge(part.quality)}">${part.quality}</span></td>
    </tr>
  `;
});

html += '</tbody></table>';

document.getElementById('searchTable').innerHTML = html;
document.getElementById('searchJson').textContent = JSON.stringify(data, null, 2);
document.getElementById('searchResults').classList.remove('hidden');

document.getElementById('exportSearchBtn').onclick = () => {
  copyToClipboard(JSON.stringify(data, null, 2));
};
```

} catch (error) {
document.getElementById(‘searchTable’).innerHTML = `<div class="error-message">Error: ${error.message}</div>`;
document.getElementById(‘searchResults’).classList.remove(‘hidden’);
}

hideLoading(btn, ‘Search Parts’);
});

// =====================
// 2. INVENTORY LOOKUP
// =====================

document.getElementById(‘inventoryBtn’).addEventListener(‘click’, async () => {
const skuId = document.getElementById(‘skuId’).value.trim();

if (!skuId) {
showNotification(‘Please enter a SKU ID’, ‘error’);
return;
}

const btn = document.getElementById(‘inventoryBtn’);
showLoading(btn, ‘📦 Looking up…’);

try {
const data = await apiCall(`/api/inventory/${skuId}`);

```
const part = data.part;
let html = `
  <div class="detail-grid">
    <div class="detail-item">
      <strong>SKU ID</strong>
      <span><code>${part.skuId}</code></span>
    </div>
    <div class="detail-item">
      <strong>Part Name</strong>
      <span>${part.partName}</span>
    </div>
    <div class="detail-item">
      <strong>Category</strong>
      <span>${part.category}</span>
    </div>
    <div class="detail-item">
      <strong>Quality</strong>
      <span><span class="badge ${getQualityBadge(part.quality)}">${part.quality}</span></span>
    </div>
    <div class="detail-item">
      <strong>Price</strong>
      <span class="price">${formatPrice(part.price * 100)}</span>
    </div>
    <div class="detail-item">
      <strong>Stock Level</strong>
      <span class="stock ${getStockClass(part.stock)}">${part.stock} units</span>
    </div>
  </div>
`;

if (part.specifications) {
  html += `
    <div class="section-box">
      <h4>Specifications</h4>
      <p>${part.specifications}</p>
    </div>
  `;
}

if (part.primaryModel) {
  html += `
    <div class="section-box">
      <h4>Primary Model</h4>
      <p>${part.primaryModel}</p>
    </div>
  `;
}

if (part.compatibleModels && part.compatibleModels.length > 0) {
  html += `
    <div class="section-box">
      <h4>Compatible Models</h4>
      <table class="table">
        <thead>
          <tr>
            <th>Model Number</th>
            <th>Marketing Name</th>
            <th>Release Year</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  part.compatibleModels.forEach(model => {
    html += `
      <tr>
        <td>${model.modelNumber}</td>
        <td>${model.marketingName}</td>
        <td>${model.releaseYear}</td>
      </tr>
    `;
  });

  html += '</tbody></table></div>';
}

document.getElementById('inventoryDetail').innerHTML = html;
document.getElementById('inventoryJson').textContent = JSON.stringify(data, null, 2);
document.getElementById('inventoryResults').classList.remove('hidden');

document.getElementById('exportInventoryBtn').onclick = () => {
  copyToClipboard(JSON.stringify(data, null, 2));
};
```

} catch (error) {
document.getElementById(‘inventoryDetail’).innerHTML = `<div class="error-message">Error: ${error.message}</div>`;
document.getElementById(‘inventoryResults’).classList.remove(‘hidden’);
}

hideLoading(btn, ‘Lookup Part’);
});

// =====================
// 3. COMPATIBILITY
// =====================

document.getElementById(‘compatBtn’).addEventListener(‘click’, async () => {
const skuId = document.getElementById(‘compatSku’).value.trim();

if (!skuId) {
showNotification(‘Please enter a SKU ID’, ‘error’);
return;
}

const btn = document.getElementById(‘compatBtn’);
showLoading(btn, ‘🔗 Checking…’);

try {
const data = await apiCall(`/api/compatibility/${skuId}`);

```
if (data.compatibleModels.length === 0) {
  document.getElementById('compatTable').innerHTML = '<p style="color: var(--text-muted);">No compatible models found.</p>';
  document.getElementById('compatResults').classList.remove('hidden');
  hideLoading(btn, 'Check Compatibility');
  return;
}

let html = `<table class="table">
  <thead>
    <tr>
      <th>Model Number</th>
      <th>Marketing Name</th>
      <th>Release Year</th>
    </tr>
  </thead>
  <tbody>
`;

data.compatibleModels.forEach(model => {
  html += `
    <tr>
      <td>${model.modelNumber}</td>
      <td>${model.marketingName}</td>
      <td>${model.releaseYear}</td>
    </tr>
  `;
});

html += '</tbody></table>';

document.getElementById('compatTable').innerHTML = html;
document.getElementById('compatJson').textContent = JSON.stringify(data, null, 2);
document.getElementById('compatResults').classList.remove('hidden');

document.getElementById('exportCompatBtn').onclick = () => {
  copyToClipboard(JSON.stringify(data, null, 2));
};
```

} catch (error) {
document.getElementById(‘compatTable’).innerHTML = `<div class="error-message">Error: ${error.message}</div>`;
document.getElementById(‘compatResults’).classList.remove(‘hidden’);
}

hideLoading(btn, ‘Check Compatibility’);
});

// =====================
// 4. BRANDS & MODELS
// =====================

async function loadBrands() {
try {
const data = await apiCall(’/api/brands’);

```
let html = `<table class="table">
  <thead>
    <tr>
      <th>ID</th>
      <th>Brand Name</th>
    </tr>
  </thead>
  <tbody>
`;

data.brands.forEach(brand => {
  html += `<tr><td>${brand.id}</td><td>${brand.name}</td></tr>`;
});

html += '</tbody></table>';

document.getElementById('brandsTable').innerHTML = html;
document.getElementById('brandsJson').textContent = JSON.stringify(data, null, 2);
document.getElementById('brandsList').classList.remove('hidden');

// Populate brand select
let selectHtml = '<option value="">-- All Brands --</option>';
data.brands.forEach(brand => {
  selectHtml += `<option value="${brand.id}">${brand.name}</option>`;
});
document.getElementById('brandSelect').innerHTML = selectHtml;

document.getElementById('exportBrandsBtn').onclick = () => {
  copyToClipboard(JSON.stringify(data, null, 2));
};
```

} catch (error) {
document.getElementById(‘brandsTable’).innerHTML = `<div class="error-message">Error: ${error.message}</div>`;
document.getElementById(‘brandsList’).classList.remove(‘hidden’);
}
}

document.getElementById(‘brandsBtn’).addEventListener(‘click’, async () => {
const btn = document.getElementById(‘brandsBtn’);
showLoading(btn, ‘🏢 Loading…’);
await loadBrands();
hideLoading(btn, ‘Load Brands’);
});

document.getElementById(‘modelsBtn’).addEventListener(‘click’, async () => {
const brandId = document.getElementById(‘brandSelect’).value;
const btn = document.getElementById(‘modelsBtn’);
showLoading(btn, ‘📱 Loading…’);

try {
const endpoint = brandId ? `/api/models?brandId=${brandId}` : ‘/api/models’;
const data = await apiCall(endpoint);

```
let html = `<table class="table">
  <thead>
    <tr>
      <th>Model Number</th>
      <th>Marketing Name</th>
      <th>Brand</th>
      <th>Release Year</th>
    </tr>
  </thead>
  <tbody>
`;

data.models.forEach(model => {
  html += `
    <tr>
      <td>${model.modelNumber}</td>
      <td>${model.marketingName}</td>
      <td>${model.brand.name}</td>
      <td>${model.releaseYear}</td>
    </tr>
  `;
});

html += '</tbody></table>';

document.getElementById('modelsTable').innerHTML = html;
document.getElementById('modelsJson').textContent = JSON.stringify(data, null, 2);
document.getElementById('modelsList').classList.remove('hidden');

document.getElementById('exportModelsBtn').onclick = () => {
  copyToClipboard(JSON.stringify(data, null, 2));
};
```

} catch (error) {
document.getElementById(‘modelsTable’).innerHTML = `<div class="error-message">Error: ${error.message}</div>`;
document.getElementById(‘modelsList’).classList.remove(‘hidden’);
}

hideLoading(btn, ‘Load Models’);
});

// =====================
// INITIALIZATION
// =====================

document.addEventListener(‘DOMContentLoaded’, () => {
checkApiStatus();
loadBrands();
});