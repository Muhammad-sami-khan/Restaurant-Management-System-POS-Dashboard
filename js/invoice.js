// show invoice popup
function viewInvoice(orderId) {
  const orders = Storage.get('rms_orders') || [];
  const order  = orders.find(o => o.id === orderId);

  if (!order) {
    showToast('Order not found.');
    return;
  }

  const settings = Storage.get('rms_settings') || {};

  // set shop name and info
  setInv('invoice-restaurant-name',    settings.restaurantName || 'Smart Restaurant');
  setInv('invoice-restaurant-address', settings.address || '');
  setInv('invoice-restaurant-phone',   settings.phone ? 'Tel: ' + settings.phone : '');

  // set order metadata
  setInv('invoice-order-id', order.id);

  const orderType = order.orderType || (order.tableId ? 'dinein' : 'takeaway');
  const typeLabels = { dinein: 'Dine-In', takeaway: 'Takeaway', delivery: 'Delivery' };
  const serviceText = orderType === 'dinein'
    ? `${order.tableName} · Dine-In`
    : (orderType === 'takeaway' ? 'Takeaway' : 'Home Delivery');
  setInv('invoice-table', serviceText);

  setInv('invoice-date', formatDateTime(order.createdAt));
  document.getElementById('invoice-status').innerHTML =
    `<span class="badge badge-${order.status}">${order.status}</span>`;

  // customer details
  const custWrap = document.getElementById('invoice-customer-wrap');
  const custName = document.getElementById('invoice-customer-name');
  const custPhone = document.getElementById('invoice-customer-phone');
  const addrLine = document.getElementById('invoice-address-line');
  const addrText = document.getElementById('invoice-delivery-address');

  if (custWrap) {
    if (order.customerName || order.customerPhone || order.deliveryAddress) {
      if (custName) custName.textContent = order.customerName || 'Walk-in';
      if (custPhone) custPhone.textContent = order.customerPhone || 'N/A';
      if (addrLine && addrText) {
        if (order.deliveryAddress) {
          addrText.textContent = order.deliveryAddress;
          addrLine.style.display = 'block';
        } else {
          addrLine.style.display = 'none';
        }
      }
      custWrap.style.display = 'block';
    } else {
      custWrap.style.display = 'none';
    }
  }

  // draw items rows
  const tbody = document.getElementById('invoice-items-body');
  if (tbody) {
    tbody.innerHTML = order.items.map(item => `
      <tr>
        <td>${item.name}</td>
        <td style="text-align:center">${item.qty}</td>
        <td style="text-align:right">${formatPKR(item.price)}</td>
        <td style="text-align:right"><strong>${formatPKR(item.price * item.qty)}</strong></td>
      </tr>
    `).join('');
  }

  // set totals
  setInv('invoice-subtotal', formatPKR(order.subtotal));
  setInv('invoice-discount', formatPKR(order.discount || 0));
  setInv('invoice-tax',      formatPKR(order.tax));
  setInv('invoice-total',    formatPKR(order.total));

  // payment method & change
  const payMethod = order.paymentMethod || 'cash';
  const payNames  = { cash: 'Cash', card: 'Credit/Debit Card (POS)', online: 'Digital Wallet / UPI' };
  setInv('invoice-payment-method', payNames[payMethod] || payMethod.toUpperCase());

  const tenderedRow = document.getElementById('invoice-tendered-row');
  const changeRow   = document.getElementById('invoice-change-row');

  if (payMethod === 'cash') {
    if (tenderedRow) tenderedRow.style.display = 'flex';
    if (changeRow)   changeRow.style.display   = 'flex';
    setInv('invoice-tendered', formatPKR(order.amountTendered || order.total));
    setInv('invoice-change',   formatPKR(order.changeDue || 0));
  } else {
    if (tenderedRow) tenderedRow.style.display = 'none';
    if (changeRow)   changeRow.style.display   = 'none';
  }

  // barcode
  setInv('invoice-barcode-number', `${order.id}-${order.createdAt.slice(0, 10).replace(/-/g, '')}`);

  // set order note
  const noteWrap = document.getElementById('invoice-note-wrap');
  const noteText = document.getElementById('invoice-note');
  if (noteWrap && noteText) {
    if (order.note && order.note.trim()) {
      noteText.textContent   = order.note;
      noteWrap.style.display = 'block';
    } else {
      noteWrap.style.display = 'none';
    }
  }

  closeModal();
  openModal('modal-invoice');
}

// utility helper
function setInv(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// open print dialog in new window
function printInvoice() {
  const settings  = Storage.get('rms_settings') || {};
  const printable = document.getElementById('invoice-printable');
  if (!printable) return;

  const html = printable.innerHTML;

  const win = window.open('', '_blank', 'width=480,height=750');
  if (!win) {
    showToast('Pop-ups blocked. Please allow pop-ups and try again.');
    return;
  }

  win.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Receipt — ${settings.restaurantName || 'Smart Restaurant'}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 13px;
      color: #1e293b;
      padding: 24px;
    }
    .invoice-header { text-align: center; padding-bottom: 14px; margin-bottom: 14px; border-bottom: 1px dashed #cbd5e1; }
    .invoice-restaurant-name { font-size: 19px; font-weight: 700; margin-bottom: 4px; }
    .invoice-restaurant-info { font-size: 12px; color: #64748b; line-height: 1.6; }
    .invoice-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin-bottom: 12px; }
    .invoice-meta-label { font-size: 10px; font-weight: 600; text-transform: uppercase; color: #94a3b8; margin-bottom: 2px; }
    .invoice-meta-value { font-size: 13px; font-weight: 600; }
    .invoice-customer-wrap { font-size: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 10px; margin-bottom: 12px; line-height: 1.5; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
    th { padding: 8px 10px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #e2e8f0; background: #f8fafc; }
    td { padding: 8px 10px; border-bottom: 1px solid #f1f5f9; color: #334155; }
    .invoice-note-wrap { font-size: 12px; color: #64748b; margin: 8px 0; padding: 8px; background: #f8fafc; border-radius: 4px; border-left: 3px solid #cbd5e1; }
    .invoice-totals { margin-top: 10px; }
    .invoice-total-row { display: flex; justify-content: space-between; font-size: 13px; color: #64748b; padding: 4px 0; }
    .invoice-total-row.grand { font-size: 16px; font-weight: 700; color: #0f172a; border-top: 2px solid #e2e8f0; margin-top: 6px; padding-top: 9px; }
    .invoice-barcode-wrap { text-align: center; margin-top: 16px; padding-top: 12px; border-top: 1px dashed #cbd5e1; }
    .invoice-footer { text-align: center; font-size: 12px; color: #94a3b8; margin-top: 14px; padding-top: 10px; border-top: 1px solid #f1f5f9; }
    .badge { display: inline-flex; align-items: center; padding: 2px 9px; border-radius: 99px; font-size: 11px; font-weight: 600; text-transform: capitalize; }
    .badge-delivered { background: #f1f5f9; color: #475569; }
    .badge-pending   { background: #fef3c7; color: #92400e; }
    .badge-preparing { background: #dbeafe; color: #1e40af; }
    .badge-ready     { background: #d1fae5; color: #065f46; }
    .badge-cancelled { background: #fee2e2; color: #991b1b; }
    @media print {
      body { padding: 0; }
      button { display: none !important; }
    }
  </style>
</head>
<body>
  ${html}
  <script>
    window.onload = function() {
      window.print();
      setTimeout(function(){ window.close(); }, 500);
    };
  <\/script>
</body>
</html>`);

  win.document.close();
}
