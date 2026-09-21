let cart                = [];
let posCategory         = 'All';
let posSearch           = '';
let posOrderType        = 'dinein';
let posDiscountPercent  = 0;
let posPaymentMethod    = 'cash';
let posCalculatedTotal  = 0;
let posCurrentPage      = 1;
const posItemsPerPage   = 12;

// Initialize POS page
function initPOS() {
  posCategory        = 'All';
  posSearch          = '';
  posOrderType       = 'dinein';
  posDiscountPercent = 0;
  posPaymentMethod   = 'cash';
  posCurrentPage     = 1;

  renderPOSCategories();
  renderPOSMenu();
  populateTableSelect();
  setPOSOrderType('dinein');
  renderCart();
  updatePOSTime();

  const searchEl = document.getElementById('pos-search');
  if (searchEl) searchEl.value = '';
}

// Update live time display in POS topbar
function updatePOSTime() {
  const el = document.getElementById('pos-screen-time');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Render category filter tabs
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

// Switch category and reset to page 1
function setPOSCategory(cat, btn) {
  posCategory = cat;
  posCurrentPage = 1;
  document.querySelectorAll('#pos-categories .cat-tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderPOSMenu();
}

// Search menu items and reset to page 1
function posSearchHandler(value) {
  posSearch = value.toLowerCase().trim();
  posCurrentPage = 1;
  renderPOSMenu();
}

// Jump to specific page
function goToPOSPage(page) {
  posCurrentPage = page;
  renderPOSMenu();
}

// Render menu items grid with fixed pagination (1, 2, 3...)
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
  const paginationEl = document.getElementById('pos-pagination');
  if (!grid) return;

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / posItemsPerPage));

  // Keep page number valid
  if (posCurrentPage > totalPages) posCurrentPage = totalPages;
  if (posCurrentPage < 1) posCurrentPage = 1;

  const startIndex = (posCurrentPage - 1) * posItemsPerPage;
  const endIndex = Math.min(startIndex + posItemsPerPage, totalCount);
  const pageItems = filtered.slice(startIndex, endIndex);

  if (totalCount === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; color:var(--gray-500); padding:24px;">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:8px; opacity:0.6;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <p style="font-size:13px; font-weight:500;">No available dishes match your search.</p>
      </div>`;
    if (paginationEl) paginationEl.innerHTML = '';
    return;
  }

  grid.innerHTML = pageItems.map(item => {
    const imgHTML = item.image
      ? `<img src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.style.display='none'" />`
      : `<div class="no-image-placeholder"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`;

    return `
      <div class="menu-card" onclick="addToCart('${item.id}')">
        <div class="menu-card-img">
          ${imgHTML}
          <div class="menu-card-price-badge">${formatPKR(item.price)}</div>
        </div>
        <div class="menu-card-body">
          <div class="menu-card-info">
            <div class="menu-card-name" title="${item.name}">${item.name}</div>
            <div class="menu-card-cat">${item.category}</div>
          </div>
          <button class="menu-card-add" type="button" onclick="event.stopPropagation(); addToCart('${item.id}')">
            + Add
          </button>
        </div>
      </div>
    `;
  }).join('');

  renderPOSPagination(totalPages, totalCount, startIndex + 1, endIndex);
}

// Render 1, 2, 3... pagination buttons
function renderPOSPagination(totalPages, totalCount, from, to) {
  const container = document.getElementById('pos-pagination');
  if (!container) return;

  if (totalPages <= 1) {
    container.innerHTML = `
      <div class="pos-pag-summary">${totalCount} item${totalCount === 1 ? '' : 's'}</div>
      <div class="pos-pag-actions">
        <span class="pos-page-btn active" style="cursor:default">1</span>
      </div>
    `;
    return;
  }

  let pageButtons = '';
  for (let i = 1; i <= totalPages; i++) {
    pageButtons += `
      <button type="button" class="pos-page-btn ${i === posCurrentPage ? 'active' : ''}"
              onclick="goToPOSPage(${i})">
        ${i}
      </button>
    `;
  }

  container.innerHTML = `
    <div class="pos-pag-summary">
      Showing <strong>${from}–${to}</strong> of <strong>${totalCount}</strong>
    </div>
    <div class="pos-pag-actions">
      <button type="button" class="pos-page-arrow" onclick="goToPOSPage(${posCurrentPage - 1})"
              ${posCurrentPage <= 1 ? 'disabled' : ''} title="Previous Page">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
      </button>
      ${pageButtons}
      <button type="button" class="pos-page-arrow" onclick="goToPOSPage(${posCurrentPage + 1})"
              ${posCurrentPage >= totalPages ? 'disabled' : ''} title="Next Page">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </button>
    </div>
  `;
}

// Populate dining tables dropdown
function populateTableSelect() {
  const tables = Storage.get('rms_tables') || [];
  const select = document.getElementById('pos-table-select');
  if (!select) return;

  select.innerHTML = `<option value="">Select a dining table...</option>` +
    tables.map(t =>
      `<option value="${t.id}" ${t.status === 'occupied' ? 'style="color:var(--danger)"' : ''}>${t.name} (${t.seats} seats) · ${t.status.toUpperCase()}</option>`
    ).join('');
}

// Switch order type: dinein, takeaway, delivery
function setPOSOrderType(type) {
  posOrderType = type;

  document.querySelectorAll('#pos-order-types .pos-type-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.type === type);
  });

  const tableGroup    = document.getElementById('pos-table-group');
  const customerGroup = document.getElementById('pos-customer-group');
  const deliveryGroup = document.getElementById('pos-delivery-group');

  if (tableGroup)    tableGroup.style.display    = type === 'dinein'   ? 'block' : 'none';
  if (customerGroup) customerGroup.style.display = type !== 'dinein'   ? 'flex'  : 'none';
  if (deliveryGroup) deliveryGroup.style.display = type === 'delivery' ? 'block' : 'none';
}

// Apply discount percentage preset
function applyDiscountPercent(percent) {
  posDiscountPercent = percent;

  document.querySelectorAll('#discount-chips .chip').forEach((chip, i) => {
    const chipPercents = [0, 5, 10, 15];
    chip.classList.toggle('active', chipPercents[i] === percent);
  });

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discountEl = document.getElementById('pos-discount');
  if (discountEl) {
    if (percent === 0) {
      discountEl.value = '';
    } else {
      discountEl.value = Math.round(subtotal * (percent / 100));
    }
  }

  renderCart();
}

// User typed custom discount
function onCustomDiscountInput() {
  posDiscountPercent = 0;
  document.querySelectorAll('#discount-chips .chip').forEach((chip, i) => {
    chip.classList.toggle('active', i === 0);
  });
  renderCart();
}

// Add item to cart
function addToCart(menuId) {
  const menu = Storage.get('rms_menu') || [];
  const item = menu.find(m => m.id === menuId);
  if (!item) return;

  const existing = cart.find(c => c.menuId === menuId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ menuId: item.id, name: item.name, price: item.price, qty: 1 });
  }

  renderCart();
  showToast(`Added ${item.name}`);
}

// Remove item from cart
function removeFromCart(menuId) {
  cart = cart.filter(c => c.menuId !== menuId);
  renderCart();
}

// Change cart quantity
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

// Re-render cart and calculate totals
function renderCart() {
  const emptyMsg = document.getElementById('cart-empty');
  const cartList = document.getElementById('cart-items');
  const placeBtn = document.getElementById('pos-place-order');

  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  const countBadge = document.getElementById('cart-item-count');
  if (countBadge) countBadge.textContent = totalQty;

  if (emptyMsg) emptyMsg.style.display = cart.length === 0 ? 'block' : 'none';

  if (cartList) {
    cartList.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${formatPKR(item.price)} each</div>
        </div>
        <div class="cart-item-controls">
          <button class="qty-btn" type="button" onclick="changeCartQty('${item.menuId}', -1)">−</button>
          <span class="qty-value">${item.qty}</span>
          <button class="qty-btn" type="button" onclick="changeCartQty('${item.menuId}', 1)">+</button>
          <button class="qty-remove" type="button" onclick="removeFromCart('${item.menuId}')" title="Remove">✕</button>
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

  posCalculatedTotal = total;

  const s2 = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  s2('cart-subtotal', formatPKR(subtotal));
  s2('cart-discount', formatPKR(discount));
  s2('cart-tax',      `${formatPKR(tax)} (${taxRate}%)`);
  s2('cart-total',    formatPKR(total));

  if (placeBtn) placeBtn.disabled = cart.length === 0;
}

// Open Checkout Modal
function openCheckoutModal() {
  if (cart.length === 0) {
    showToast('Cart is empty!');
    return;
  }

  // Validate order type inputs
  const tableSelect = document.getElementById('pos-table-select');
  const tableId     = tableSelect?.value || '';

  if (posOrderType === 'dinein' && !tableId) {
    showToast('Please select a dining table for Dine-In!');
    if (tableSelect) tableSelect.focus();
    return;
  }

  // Populate checkout summary
  const orderTypeEl   = document.getElementById('checkout-order-type');
  const targetDescEl  = document.getElementById('checkout-target-desc');
  const totalPayEl    = document.getElementById('checkout-total-payable');

  const typeLabels = { dinein: 'Dine-In', takeaway: 'Takeaway', delivery: 'Delivery' };
  if (orderTypeEl) orderTypeEl.textContent = typeLabels[posOrderType] || 'Order';

  if (targetDescEl) {
    if (posOrderType === 'dinein') {
      const tableOpt = tableSelect?.options[tableSelect.selectedIndex];
      targetDescEl.textContent = tableOpt ? tableOpt.text.split(' ·')[0] : 'Table';
    } else {
      const custName  = document.getElementById('pos-customer-name')?.value.trim();
      const custPhone = document.getElementById('pos-customer-phone')?.value.trim();
      targetDescEl.textContent = custName ? `${custName} ${custPhone ? `(${custPhone})` : ''}` : (posOrderType === 'takeaway' ? 'Walk-in Customer' : 'Delivery Customer');
    }
  }

  if (totalPayEl) totalPayEl.textContent = formatPKR(posCalculatedTotal);

  // Set default payment method to cash
  onPaymentMethodChange('cash');

  // Set default tendered to exact total
  const tenderedInput = document.getElementById('checkout-cash-tendered');
  if (tenderedInput) tenderedInput.value = posCalculatedTotal;
  calculateChangeDue();

  openModal('modal-checkout');
}

// Payment method selection change
function onPaymentMethodChange(method) {
  posPaymentMethod = method;

  document.querySelectorAll('.pay-method-card').forEach(card => {
    const radio = card.querySelector('input');
    card.classList.toggle('active', radio && radio.value === method);
    if (radio && radio.value === method) radio.checked = true;
  });

  const cashSection = document.getElementById('checkout-cash-section');
  if (cashSection) {
    cashSection.style.display = method === 'cash' ? 'block' : 'none';
  }
}

// Quick cash tender helper
function quickCashTender(amount) {
  const tenderedInput = document.getElementById('checkout-cash-tendered');
  if (!tenderedInput) return;

  if (amount === 'exact') {
    tenderedInput.value = posCalculatedTotal;
  } else {
    const current = parseFloat(tenderedInput.value) || 0;
    tenderedInput.value = current + amount;
  }

  calculateChangeDue();
}

// Calculate change due in real time
function calculateChangeDue() {
  const tenderedInput = document.getElementById('checkout-cash-tendered');
  const changeDueEl   = document.getElementById('checkout-change-due');
  const banner        = document.getElementById('change-due-banner');
  const confirmBtn    = document.getElementById('btn-confirm-payment');

  if (!tenderedInput || !changeDueEl) return;

  const tendered = parseFloat(tenderedInput.value) || 0;
  const change   = tendered - posCalculatedTotal;

  if (posPaymentMethod === 'cash') {
    if (change < 0) {
      changeDueEl.textContent = `Short by ${formatPKR(Math.abs(change))}`;
      if (banner) banner.classList.add('insufficient');
      if (confirmBtn) confirmBtn.disabled = true;
    } else {
      changeDueEl.textContent = formatPKR(change);
      if (banner) banner.classList.remove('insufficient');
      if (confirmBtn) confirmBtn.disabled = false;
    }
  } else {
    if (banner) banner.classList.remove('insufficient');
    if (confirmBtn) confirmBtn.disabled = false;
  }
}

// Finalize order checkout & save to Storage
function processOrderCheckout() {
  if (cart.length === 0) return;

  const tableSelect = document.getElementById('pos-table-select');
  const tableId     = posOrderType === 'dinein' ? (tableSelect?.value || '') : '';
  const tableOpt    = tableSelect?.options[tableSelect.selectedIndex];
  const tableName   = posOrderType === 'dinein'
    ? (tableId ? (tableOpt?.text.split(' ·')[0] || 'Table') : 'Table')
    : (posOrderType === 'takeaway' ? 'Takeaway' : 'Delivery');

  const custName  = document.getElementById('pos-customer-name')?.value.trim() || '';
  const custPhone = document.getElementById('pos-customer-phone')?.value.trim() || '';
  const deliveryAddress = posOrderType === 'delivery'
    ? (document.getElementById('pos-delivery-address')?.value.trim() || '')
    : '';

  const discountEl = document.getElementById('pos-discount');
  const discount   = Math.max(0, parseFloat(discountEl?.value) || 0);
  const noteEl     = document.getElementById('pos-note');
  const note       = noteEl?.value.trim() || '';

  const settings   = Storage.get('rms_settings') || {};
  const taxRate    = parseFloat(settings.taxRate) || 10;
  const subtotal   = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const taxable    = Math.max(0, subtotal - discount);
  const tax        = Math.round(taxable * (taxRate / 100));
  const total      = taxable + tax;

  const tenderedInput = document.getElementById('checkout-cash-tendered');
  const amountTendered = posPaymentMethod === 'cash' ? (parseFloat(tenderedInput?.value) || total) : total;
  const changeDue      = posPaymentMethod === 'cash' ? Math.max(0, amountTendered - total) : 0;

  const orders   = Storage.get('rms_orders') || [];
  const orderNum = orders.length + 1;

  const newOrder = {
    id:              `ORD-${String(orderNum).padStart(3, '0')}`,
    orderType:       posOrderType,
    tableId,
    tableName,
    customerName:    custName || (posOrderType === 'takeaway' ? 'Walk-in Customer' : (posOrderType === 'delivery' ? 'Delivery Customer' : '')),
    customerPhone:   custPhone,
    deliveryAddress,
    items:           cart.map(i => ({ ...i })),
    subtotal,
    tax,
    discount,
    total,
    paymentMethod:   posPaymentMethod,
    amountTendered,
    changeDue,
    status:          'pending',
    createdAt:       new Date().toISOString(),
    note,
  };

  orders.push(newOrder);
  Storage.set('rms_orders', orders);

  // If table assigned, mark table occupied
  if (tableId) {
    Storage.updateById('rms_tables', tableId, { status: 'occupied' });
  }

  showToast(`${newOrder.id} successfully placed & paid!`);
  closeModal();

  // Reset cart & inputs
  cart = [];
  if (tableSelect) tableSelect.value = '';
  if (discountEl)  discountEl.value  = '';
  if (noteEl)      noteEl.value      = '';
  const cNameInput  = document.getElementById('pos-customer-name');
  const cPhoneInput = document.getElementById('pos-customer-phone');
  const cAddrInput  = document.getElementById('pos-delivery-address');
  if (cNameInput)  cNameInput.value  = '';
  if (cPhoneInput) cPhoneInput.value = '';
  if (cAddrInput)  cAddrInput.value  = '';

  setPOSOrderType('dinein');
  applyDiscountPercent(0);
  renderCart();

  // Prompt to open invoice
  setTimeout(() => {
    if (confirm(`Order ${newOrder.id} confirmed!\n\nOpen and print customer invoice?`)) {
      viewInvoice(newOrder.id);
    }
  }, 150);
}

// Clear cart
function clearCart() {
  if (cart.length === 0) return;
  if (!confirm('Clear the current order?')) return;
  cart = [];
  renderCart();
}
