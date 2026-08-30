let cart        = [];
let posCategory = 'All';
let posSearch   = '';

// clear parameters and load POS page
function initPOS() {
  cart        = [];
  posCategory = 'All';
  posSearch   = '';

  renderPOSCategories();
  renderPOSMenu();
  renderCart();
  populateTableSelect();

  const searchEl   = document.getElementById('pos-search');
  if (searchEl)   searchEl.value   = '';
  const discountEl = document.getElementById('pos-discount');
  if (discountEl) discountEl.value = '';
  const noteEl     = document.getElementById('pos-note');
  if (noteEl)     noteEl.value     = '';
}

// category filter buttons loading
function renderPOSCategories() {
  const menu       = Storage.get('rms_menu') || [];
  const categories = ['All', ...new Set(menu.map(item => item.category))];
  const container  = document.getElementById('pos-categories');
  if (!container) return;

  container.innerHTML = categories.map(cat => `
    <button class="cat-tab ${cat === posCategory ? 'active' : ''}"
            onclick="setPOSCategory('${cat}', this)">
      ${cat}
    </button>
  `).join('');
}

// set filter category
function setPOSCategory(cat, btn) {
  posCategory = cat;
  document.querySelectorAll('#pos-categories .cat-tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderPOSMenu();
}

// handle menu search input
function posSearchHandler(value) {
  posSearch = value.toLowerCase().trim();
  renderPOSMenu();
}

// render items menu grid with images
function renderPOSMenu() {
  const menu = Storage.get('rms_menu') || [];
  let filtered = menu.filter(item => item.available);

  if (posCategory !== 'All') {
    filtered = filtered.filter(item => item.category === posCategory);
  }
  if (posSearch) {
    filtered = filtered.filter(item =>
      item.name.toLowerCase().includes(posSearch) ||
      item.category.toLowerCase().includes(posSearch)
    );
  }

  const grid = document.getElementById('pos-menu-grid');
  if (!grid) return;

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><p>No items found.</p></div>`;
    return;
  }

  grid.innerHTML = filtered.map(item => {
    const imgHTML = item.image
      ? `<img src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.style.display='none'" />`
      : `<div class="no-image-placeholder"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`;

    return `
      <div class="menu-card">
        <div class="menu-card-img">${imgHTML}</div>
        <div class="menu-card-body">
          <div class="menu-card-name">${item.name}</div>
          <div class="menu-card-cat">${item.category}</div>
          <div class="menu-card-price">${formatPKR(item.price)}</div>
          <button class="menu-card-add" onclick="addToCart('${item.id}')">+ Add to Order</button>
        </div>
      </div>
    `;
  }).join('');
}

// drop down options for table selection
function populateTableSelect() {
  const tables = Storage.get('rms_tables') || [];
  const select = document.getElementById('pos-table-select');
  if (!select) return;

  select.innerHTML = `<option value="">Takeaway (no table)</option>` +
    tables.map(t =>
      `<option value="${t.id}">${t.name} (${t.seats} seats) · ${t.status}</option>`
    ).join('');
}

// add food to cart
function addToCart(menuId) {
  const menu     = Storage.get('rms_menu') || [];
  const item     = menu.find(m => m.id === menuId);
  if (!item) return;

  const existing = cart.find(c => c.menuId === menuId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ menuId: item.id, name: item.name, price: item.price, qty: 1 });
  }

  renderCart();
  showToast(`${item.name} added`);
}

// remove item from cart list
function removeFromCart(menuId) {
  cart = cart.filter(c => c.menuId !== menuId);
  renderCart();
}

// adjust cart quantities
function changeCartQty(menuId, delta) {
  const item = cart.find(c => c.menuId === menuId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(menuId);
  } else {
    renderCart();
  }
}

// compute subtotal, discounts, tax, total
function renderCart() {
  const emptyMsg   = document.getElementById('cart-empty');
  const cartList   = document.getElementById('cart-items');
  const placeBtn   = document.getElementById('pos-place-order');

  if (emptyMsg) emptyMsg.style.display = cart.length === 0 ? 'block' : 'none';

  if (cartList) {
    cartList.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${formatPKR(item.price)} each</div>
        </div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="changeCartQty('${item.menuId}', -1)">−</button>
          <span class="qty-value">${item.qty}</span>
          <button class="qty-btn" onclick="changeCartQty('${item.menuId}', 1)">+</button>
          <button class="qty-remove" onclick="removeFromCart('${item.menuId}')" title="Remove">✕</button>
        </div>
      </div>
    `).join('');
  }

  const subtotal   = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const settings   = Storage.get('rms_settings') || {};
  const taxRate    = parseFloat(settings.taxRate) || 10;

  const discountEl = document.getElementById('pos-discount');
  const discount   = Math.max(0, parseFloat(discountEl?.value) || 0);

  const taxable    = Math.max(0, subtotal - discount);
  const tax        = Math.round(taxable * (taxRate / 100));
  const total      = taxable + tax;

  const s2 = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  s2('cart-subtotal', formatPKR(subtotal));
  s2('cart-discount', formatPKR(discount));
  s2('cart-tax',      `${formatPKR(tax)} (${taxRate}%)`);
  s2('cart-total',    formatPKR(total));

  if (placeBtn) placeBtn.disabled = cart.length === 0;
}

// save order to local storage
function placeOrder() {
  if (cart.length === 0) { showToast('Cart is empty!'); return; }

  const tableSelect = document.getElementById('pos-table-select');
  const tableId     = tableSelect?.value || '';
  const tableOpt    = tableSelect?.options[tableSelect.selectedIndex];
  const tableName   = tableId ? (tableOpt?.text.split(' ·')[0] || 'Table') : 'Takeaway';

  const discountEl  = document.getElementById('pos-discount');
  const discount    = Math.max(0, parseFloat(discountEl?.value) || 0);

  const noteEl      = document.getElementById('pos-note');
  const note        = noteEl?.value.trim() || '';

  const settings    = Storage.get('rms_settings') || {};
  const taxRate     = parseFloat(settings.taxRate) || 10;
  const subtotal    = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const taxable     = Math.max(0, subtotal - discount);
  const tax         = Math.round(taxable * (taxRate / 100));
  const total       = taxable + tax;

  const orders      = Storage.get('rms_orders') || [];
  const orderNum    = orders.length + 1;

  const newOrder = {
    id:        `ORD-${String(orderNum).padStart(3, '0')}`,
    tableId,
    tableName,
    items:     cart.map(i => ({ ...i })),
    subtotal, tax, discount, total,
    status:    'pending',
    createdAt: new Date().toISOString(),
    note,
  };

  orders.push(newOrder);
  Storage.set('rms_orders', orders);

  if (tableId) {
    Storage.updateById('rms_tables', tableId, { status: 'occupied' });
  }

  showToast(`${newOrder.id} placed!`);

  cart = [];
  if (tableSelect)  tableSelect.value  = '';
  if (discountEl)   discountEl.value   = '';
  if (noteEl)       noteEl.value       = '';
  renderCart();

  if (confirm(`Order ${newOrder.id} placed successfully!\n\nOpen invoice?`)) {
    viewInvoice(newOrder.id);
  }
}

// clear current cart items list
function clearCart() {
  if (cart.length === 0) return;
  if (!confirm('Clear the current order?')) return;
  cart = [];
  renderCart();
}
