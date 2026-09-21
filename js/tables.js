// Initialize tables page
function initTables() {
  syncTableStatusesWithOrders();
  renderTableSummary();
  renderTables();
}

// Ensure tables with active orders reflect occupied status
function syncTableStatusesWithOrders() {
  const orders = Storage.get('rms_orders') || [];
  const tables = Storage.get('rms_tables') || [];
  let updated = false;

  tables.forEach(table => {
    const hasActiveOrder = orders.some(
      o => o.tableId === table.id && o.status !== 'delivered' && o.status !== 'cancelled'
    );
    if (hasActiveOrder && table.status === 'available') {
      table.status = 'occupied';
      updated = true;
    }
  });

  if (updated) {
    Storage.set('rms_tables', tables);
  }
}

// Compute table status counters
function renderTableSummary() {
  const tables = Storage.get('rms_tables') || [];

  const available = tables.filter(t => t.status === 'available').length;
  const occupied  = tables.filter(t => t.status === 'occupied').length;
  const reserved  = tables.filter(t => t.status === 'reserved').length;

  setTxt('tables-stat-available', available);
  setTxt('tables-stat-occupied',  occupied);
  setTxt('tables-stat-reserved',  reserved);
  setTxt('tables-stat-total',     tables.length);
}

// Render interactive table cards
function renderTables() {
  const tables = Storage.get('rms_tables') || [];
  const orders = Storage.get('rms_orders') || [];
  const grid   = document.getElementById('tables-grid');
  if (!grid) return;

  if (tables.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><p>No dining tables configured. Click "+ Add Table" above to create one.</p></div>`;
    return;
  }

  grid.innerHTML = tables.map(table => {
    // Find active order for this table
    const activeOrder = orders
      .filter(o => o.tableId === table.id && o.status !== 'delivered' && o.status !== 'cancelled')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

    const orderBadge = activeOrder
      ? `<span class="table-order-badge" title="Active Order: ${activeOrder.id}">🛒 ${activeOrder.id} · ${formatPKR(activeOrder.total)}</span>`
      : '';

    return `
      <div class="table-card status-${table.status}">
        <div class="table-card-header-bar">
          <span class="table-number">${table.name}</span>
          <button type="button" class="table-delete-icon" title="Delete table" onclick="deleteTable('${table.id}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path></svg>
          </button>
        </div>

        <div class="table-seats">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          ${table.seats} seats
        </div>

        <div class="table-status-text">${table.status}</div>
        ${orderBadge}

        <div class="table-btn-group">
          ${activeOrder
            ? `<button class="table-secondary-btn" onclick="viewTableDetails('${table.id}')">Order Details</button>`
            : `<button class="table-secondary-btn" onclick="openPOSForTable('${table.id}')">+ New Order</button>`
          }
          <button class="table-action-btn" style="flex:1" onclick="cycleTableStatus('${table.id}')" title="Cycle table status">
            Status
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Open POS pre-selecting this table
function openPOSForTable(tableId) {
  navigateTo('pos');
  setTimeout(() => {
    setPOSOrderType('dinein');
    const tableSelect = document.getElementById('pos-table-select');
    if (tableSelect) tableSelect.value = tableId;
  }, 50);
}

// View active table details & settle order
function viewTableDetails(tableId) {
  const tables = Storage.get('rms_tables') || [];
  const orders = Storage.get('rms_orders') || [];
  const table  = tables.find(t => t.id === tableId);
  if (!table) return;

  const activeOrder = orders
    .filter(o => o.tableId === table.id && o.status !== 'delivered' && o.status !== 'cancelled')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

  const modalTitle = document.getElementById('table-action-title');
  const modalBody  = document.getElementById('table-action-body');
  if (!modalBody) return;

  if (modalTitle) modalTitle.textContent = `${table.name} (${table.seats} Seats) — Active Dining Session`;

  if (activeOrder) {
    modalBody.innerHTML = `
      <div class="table-modal-header-info">
        <div class="table-modal-info-item">
          <label>Active Order ID</label>
          <span>${activeOrder.id}</span>
        </div>
        <div class="table-modal-info-item">
          <label>Order Status</label>
          <span class="badge badge-${activeOrder.status}">${activeOrder.status}</span>
        </div>
        <div class="table-modal-info-item">
          <label>Order Placed At</label>
          <span>${formatDateTime(activeOrder.createdAt)}</span>
        </div>
        <div class="table-modal-info-item">
          <label>Payment Method</label>
          <span style="text-transform:capitalize">${activeOrder.paymentMethod || 'Cash'}</span>
        </div>
      </div>

      <table class="data-table" style="margin-bottom:12px">
        <thead>
          <tr>
            <th>Item</th>
            <th style="text-align:center">Qty</th>
            <th style="text-align:right">Price</th>
            <th style="text-align:right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${activeOrder.items.map(item => `
            <tr>
              <td>${item.name}</td>
              <td style="text-align:center">${item.qty}</td>
              <td style="text-align:right">${formatPKR(item.price)}</td>
              <td style="text-align:right"><strong>${formatPKR(item.price * item.qty)}</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="order-totals" style="margin-bottom:14px">
        <div class="order-total-row"><span>Subtotal:</span><span>${formatPKR(activeOrder.subtotal)}</span></div>
        <div class="order-total-row"><span>Discount:</span><span>${formatPKR(activeOrder.discount || 0)}</span></div>
        <div class="order-total-row"><span>Tax:</span><span>${formatPKR(activeOrder.tax)}</span></div>
        <div class="order-total-row grand"><span>Total Bill:</span><span>${formatPKR(activeOrder.total)}</span></div>
      </div>

      <div class="table-modal-actions">
        <button class="btn btn-secondary" onclick="viewInvoice('${activeOrder.id}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
          <span>View Invoice</span>
        </button>
        <button class="btn btn-primary" onclick="settleAndFreeTable('${table.id}', '${activeOrder.id}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span>Settle &amp; Free Table</span>
        </button>
      </div>
    `;
  } else {
    modalBody.innerHTML = `
      <div style="text-align:center;padding:24px 12px;">
        <p style="color:var(--gray-500);margin-bottom:16px;">This table is marked as <strong>${table.status}</strong> with no active open orders.</p>
        <div style="display:flex;gap:10px;justify-content:center;">
          <button class="btn btn-secondary" onclick="Storage.updateById('rms_tables', '${table.id}', { status: 'available' }); closeModal(); initTables(); showToast('Table marked Available');">Mark Available</button>
          <button class="btn btn-primary" onclick="closeModal(); openPOSForTable('${table.id}')">Take Order in POS →</button>
        </div>
      </div>
    `;
  }

  openModal('modal-table-action');
}

// Settle bill and free table back to available
function settleAndFreeTable(tableId, orderId) {
  Storage.updateById('rms_tables', tableId, { status: 'available' });

  if (orderId) {
    Storage.updateById('rms_orders', orderId, { status: 'delivered' });
  }

  showToast('Table settled and freed for new guests!');
  closeModal();
  initTables();
}

// Cycle table status
function cycleTableStatus(tableId) {
  const tables = Storage.get('rms_tables') || [];
  const table  = tables.find(t => t.id === tableId);
  if (!table) return;

  const cycle = { available: 'occupied', occupied: 'reserved', reserved: 'available' };
  const next  = cycle[table.status] || 'available';

  Storage.updateById('rms_tables', tableId, { status: next });
  showToast(`${table.name}: ${table.status} → ${next}`);

  renderTableSummary();
  renderTables();
}

// Open modal to add a new table
function openAddTableModal() {
  const form = document.getElementById('table-add-form');
  if (form) form.reset();
  openModal('modal-table-form');
}

// Save new dining table
function saveNewTable(e) {
  if (e && e.preventDefault) e.preventDefault();

  const nameEl  = document.getElementById('table-form-name');
  const seatsEl = document.getElementById('table-form-seats');

  const name  = nameEl?.value.trim();
  const seats = parseInt(seatsEl?.value, 10);

  if (!name || isNaN(seats) || seats < 1) {
    showToast('Please enter a valid table name and seat count.');
    return;
  }

  const tables = Storage.get('rms_tables') || [];
  const newTable = {
    id:     generateId('t_'),
    name,
    seats,
    status: 'available',
  };

  tables.push(newTable);
  Storage.set('rms_tables', tables);

  showToast(`Added "${name}" with ${seats} seats.`);
  closeModal();
  initTables();
}

// Delete table
function deleteTable(tableId) {
  const tables = Storage.get('rms_tables') || [];
  const table  = tables.find(t => t.id === tableId);
  if (!table) return;

  if (table.status === 'occupied') {
    if (!confirm(`Warning: ${table.name} is currently OCCUPIED. Are you sure you want to delete it?`)) return;
  } else {
    if (!confirm(`Are you sure you want to delete ${table.name}?`)) return;
  }

  Storage.removeById('rms_tables', tableId);
  showToast(`Deleted ${table.name}`);
  initTables();
}

// Helper to set element text
function setTxt(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}
