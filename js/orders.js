let ordersFilter = 'all';
let ordersSearch = '';

// reset filters and list orders
function initOrders() {
  ordersFilter = 'all';
  ordersSearch = '';

  document.querySelectorAll('.order-filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.status === 'all');
  });

  const searchEl = document.getElementById('orders-search');
  if (searchEl) searchEl.value = '';

  renderOrdersList();
}

// set selected filter status
function setOrdersFilter(btn, status) {
  ordersFilter = status;
  document.querySelectorAll('.order-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderOrdersList();
}

// search filter keypress
function ordersSearchHandler(value) {
  ordersSearch = value.toLowerCase().trim();
  renderOrdersList();
}

// draw list of orders in table
function renderOrdersList() {
  const orders = Storage.get('rms_orders') || [];

  let filtered = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (ordersFilter !== 'all') {
    filtered = filtered.filter(o => o.status === ordersFilter);
  }

  if (ordersSearch) {
    filtered = filtered.filter(o =>
      o.id.toLowerCase().includes(ordersSearch) ||
      o.tableName.toLowerCase().includes(ordersSearch) ||
      o.items.some(item => item.name.toLowerCase().includes(ordersSearch))
    );
  }

  const tbody = document.getElementById('orders-table-body');
  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:36px;color:var(--gray-400)">No orders found.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(order => {
    const itemStr = order.items.map(i => `${i.name} ×${i.qty}`).join(', ');
    const truncated = itemStr.length > 45 ? itemStr.slice(0, 45) + '…' : itemStr;

    return `
      <tr>
        <td><strong>${order.id}</strong></td>
        <td>${order.tableName}</td>
        <td style="color:var(--gray-500);font-size:12px;max-width:180px">${truncated}</td>
        <td style="white-space:nowrap">${formatDateTime(order.createdAt)}</td>
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
          <button class="btn btn-sm btn-secondary" onclick="viewInvoice('${order.id}')" style="margin-left:4px">Invoice</button>
        </td>
      </tr>
    `;
  }).join('');
}

// modify order status select
function updateOrderStatus(orderId, newStatus) {
  Storage.updateById('rms_orders', orderId, { status: newStatus });
  showToast(`${orderId} marked as "${newStatus}"`);
  renderOrdersList();
}

// open modal with order particulars
function viewOrderDetail(orderId) {
  const orders = Storage.get('rms_orders') || [];
  const order  = orders.find(o => o.id === orderId);
  if (!order) return;

  document.getElementById('order-detail-id').textContent     = order.id;
  document.getElementById('order-detail-table').textContent  = order.tableName;
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
