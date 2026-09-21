let ordersFilter = 'all';
let ordersSearch = '';
let ordersView   = 'list';

// Initialize orders page
function initOrders() {
  ordersFilter = 'all';
  ordersSearch = '';

  document.querySelectorAll('.order-filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.status === 'all');
  });

  const searchEl = document.getElementById('orders-search');
  if (searchEl) searchEl.value = '';

  renderOrdersView();
}

// Switch between Table List and Kitchen Board (KDS)
function switchOrdersView(view) {
  ordersView = view;

  const btnList = document.getElementById('btn-view-list');
  const btnKDS  = document.getElementById('btn-view-kds');
  const tableWrap = document.getElementById('orders-table-wrap');
  const kdsView   = document.getElementById('orders-kds-view');

  if (btnList) btnList.classList.toggle('active', view === 'list');
  if (btnKDS)  btnKDS.classList.toggle('active', view === 'kds');

  if (tableWrap) tableWrap.style.display = view === 'list' ? 'block' : 'none';
  if (kdsView)   kdsView.style.display   = view === 'kds'  ? 'grid'  : 'none';

  renderOrdersView();
}

// Filter button click
function setOrdersFilter(btn, status) {
  ordersFilter = status;
  document.querySelectorAll('.order-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderOrdersView();
}

// Search field handler
function ordersSearchHandler(value) {
  ordersSearch = value.toLowerCase().trim();
  renderOrdersView();
}

// Render active view
function renderOrdersView() {
  if (ordersView === 'kds') {
    renderKDS();
  } else {
    renderOrdersList();
  }
}

// Render tabular list of orders
function renderOrdersList() {
  const orders = Storage.get('rms_orders') || [];

  let filtered = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (ordersFilter !== 'all') {
    filtered = filtered.filter(o => o.status === ordersFilter);
  }

  if (ordersSearch) {
    filtered = filtered.filter(o =>
      o.id.toLowerCase().includes(ordersSearch) ||
      (o.tableName || '').toLowerCase().includes(ordersSearch) ||
      (o.customerName || '').toLowerCase().includes(ordersSearch) ||
      (o.paymentMethod || '').toLowerCase().includes(ordersSearch) ||
      o.items.some(item => item.name.toLowerCase().includes(ordersSearch))
    );
  }

  const tbody = document.getElementById('orders-table-body');
  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:36px;color:var(--gray-400)">No orders found.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(order => {
    const itemStr = order.items.map(i => `${i.name} ×${i.qty}`).join(', ');
    const truncated = itemStr.length > 38 ? itemStr.slice(0, 38) + '…' : itemStr;
    const targetDesc = order.customerName ? `${order.tableName} · ${order.customerName}` : order.tableName;
    const orderType = order.orderType || (order.tableId ? 'dinein' : 'takeaway');

    const typeNames = { dinein: 'Dine-In', takeaway: 'Takeaway', delivery: 'Delivery' };
    const payNames  = { cash: 'Cash', card: 'Card', online: 'Online' };

    return `
      <tr>
        <td><strong>${order.id}</strong></td>
        <td>
          <span style="font-size:11px;font-weight:600;color:var(--gray-500);display:block;">
            ${(typeNames[orderType] || orderType).toUpperCase()}
          </span>
          <strong>${targetDesc}</strong>
        </td>
        <td style="color:var(--gray-600);font-size:12px;max-width:200px" title="${itemStr}">${truncated}</td>
        <td style="white-space:nowrap;font-size:12px;">${formatDateTime(order.createdAt)}</td>
        <td><span class="badge" style="background:var(--gray-100);color:var(--gray-700);">${payNames[order.paymentMethod] || 'Cash'}</span></td>
        <td><strong>${formatPKR(order.total)}</strong></td>
        <td>
          <select class="status-select" onchange="updateOrderStatus('${order.id}', this.value)">
            <option value="pending"   ${order.status === 'pending'   ? 'selected' : ''}>Pending</option>
            <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>Preparing</option>
            <option value="ready"     ${order.status === 'ready'     ? 'selected' : ''}>Ready</option>
            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </td>
        <td style="white-space:nowrap">
          <button class="btn btn-sm btn-secondary" onclick="viewOrderDetail('${order.id}')">View</button>
          <button class="btn btn-sm btn-secondary" onclick="openInvoiceModal('${order.id}')" title="Print Invoice">Receipt</button>
        </td>
      </tr>
    `;
  }).join('');
}

// 2. Render Kitchen Display System (KDS) Cards Grid
function renderOrdersKDS() {
  const container = document.getElementById('orders-kds-view');
  if (!container) return;

  const orders = Storage.get('rms_orders') || [];
  let filtered = [...orders];

  if (ordersFilter !== 'all') {
    filtered = filtered.filter(o => o.status === ordersFilter);
  }
  if (ordersSearch) {
    filtered = filtered.filter(o =>
      o.id.toLowerCase().includes(ordersSearch) ||
      (o.tableName && o.tableName.toLowerCase().includes(ordersSearch)) ||
      (o.customerName && o.customerName.toLowerCase().includes(ordersSearch)) ||
      o.items.some(i => i.name.toLowerCase().includes(ordersSearch))
    );
  }

  // Active orders first, descending by time
  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;background:#fff;border-radius:var(--radius-lg);padding:40px;border:1px solid var(--gray-200);">
        <p>No orders currently match the selected filter.</p>
      </div>`;
    return;
  }

  const now = new Date();

  container.innerHTML = filtered.map(order => {
    const elapsedMs = now - new Date(order.createdAt);
    const diffMins = Math.floor(elapsedMs / (1000 * 60));
    const timeText = diffMins < 1 ? 'Just now' : `${diffMins}m ago`;

    // Urgency styling
    let urgencyClass = '';
    if (order.status !== 'delivered' && order.status !== 'cancelled') {
      if (diffMins >= 20) urgencyClass = 'kds-card-late';
      else if (diffMins >= 10) urgencyClass = 'kds-card-urgent';
    }

    const orderType = order.orderType || (order.tableId ? 'dinein' : 'takeaway');
    const typeLabel = orderType === 'dinein' ? order.tableName : (orderType === 'takeaway' ? 'Takeaway' : 'Delivery');

    // Action button depending on status
    let actionHTML = '';
    if (order.status === 'pending') {
      actionHTML = `<button type="button" class="btn btn-primary" onclick="updateOrderStatus('${order.id}', 'preparing')">Start Prep</button>`;
    } else if (order.status === 'preparing') {
      actionHTML = `<button type="button" class="btn btn-primary" style="background:var(--success);border-color:var(--success);" onclick="updateOrderStatus('${order.id}', 'ready')">Mark Ready</button>`;
    } else if (order.status === 'ready') {
      actionHTML = `<button type="button" class="btn btn-secondary" onclick="updateOrderStatus('${order.id}', 'delivered')">Deliver &amp; Settle</button>`;
    } else {
      actionHTML = `<span class="badge badge-${order.status}" style="padding:6px 12px;">${order.status}</span>`;
    }

    return `
      <div class="kds-card ${urgencyClass}">
        <div class="kds-card-header">
          <div>
            <span class="kds-order-num">${order.id}</span>
            <span class="kds-order-type-badge">${orderType}</span>
          </div>
          <div class="kds-time-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <span>${timeText}</span>
          </div>
        </div>

        <div class="kds-card-body">
          <div class="kds-target-info">
            <div>${typeLabel}</div>
            ${order.customerName ? `<div style="font-size:11px;color:var(--gray-500);font-weight:400;margin-top:2px;">Customer: ${order.customerName}</div>` : ''}
          </div>

          <div class="kds-items-list">
            ${order.items.map(item => `
              <div class="kds-item-row" onclick="this.classList.toggle('done')" title="Click to strike-through item as prepped">
                <div>
                  <span class="kds-item-qty">${item.qty}×</span>
                  <span>${item.name}</span>
                </div>
                <span style="font-size:11px;color:var(--gray-400)">✓</span>
              </div>
            `).join('')}
          </div>

          ${order.note ? `<div class="kds-note-box"><strong>Note:</strong> ${order.note}</div>` : ''}
        </div>

        <div class="kds-card-footer">
          ${actionHTML}
          <button type="button" class="btn btn-secondary" onclick="viewOrderDetail('${order.id}')" title="Full details">Info</button>
        </div>
      </div>
    `;
  }).join('');
}

// Update order status & automatically release dining table if completed
function updateOrderStatus(orderId, newStatus) {
  const orders = Storage.get('rms_orders') || [];
  const order  = orders.find(o => o.id === orderId);

  Storage.updateById('rms_orders', orderId, { status: newStatus });

  // Auto-free table if order is delivered or cancelled
  if ((newStatus === 'delivered' || newStatus === 'cancelled') && order && order.tableId) {
    // Check if table has any other remaining active orders
    const otherActive = orders.some(o => o.id !== orderId && o.tableId === order.tableId && o.status !== 'delivered' && o.status !== 'cancelled');
    if (!otherActive) {
      Storage.updateById('rms_tables', order.tableId, { status: 'available' });
      showToast(`${orderId} marked "${newStatus}" and ${order.tableName} freed!`);
    } else {
      showToast(`${orderId} marked as "${newStatus}"`);
    }
  } else {
    showToast(`${orderId} marked as "${newStatus}"`);
  }

  renderOrdersView();
}

// Open modal with order particulars
function viewOrderDetail(orderId) {
  const orders = Storage.get('rms_orders') || [];
  const order  = orders.find(o => o.id === orderId);
  if (!order) return;

  const targetDesc = order.customerName ? `${order.tableName} (${order.customerName})` : order.tableName;

  document.getElementById('order-detail-id').textContent     = order.id;
  document.getElementById('order-detail-table').textContent  = targetDesc;
  document.getElementById('order-detail-date').textContent   = formatDateTime(order.createdAt);
  document.getElementById('order-detail-status').innerHTML   = `<span class="badge badge-${order.status}">${order.status}</span>`;
  document.getElementById('order-detail-note').textContent   = order.note || '—';

  document.getElementById('order-detail-items').innerHTML = order.items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td style="text-align:center">${item.qty}</td>
      <td style="text-align:right">${formatPKR(item.price)}</td>
      <td style="text-align:right"><strong>${formatPKR(item.price * item.qty)}</strong></td>
    </tr>
  `).join('');

  document.getElementById('order-detail-subtotal').textContent = formatPKR(order.subtotal);
  document.getElementById('order-detail-discount').textContent = formatPKR(order.discount || 0);
  document.getElementById('order-detail-tax').textContent      = formatPKR(order.tax);
  document.getElementById('order-detail-total').textContent    = formatPKR(order.total);

  openModal('modal-order-detail');
}
