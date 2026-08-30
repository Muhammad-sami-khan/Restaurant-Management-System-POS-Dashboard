// initialize dashboard elements
function initDashboard() {
  renderDashboardStats();
  renderWeeklyChart();
  renderRecentOrders();

  const settings = Storage.get('rms_settings') || {};
  const nameEl = document.getElementById('sidebar-restaurant-name');
  if (nameEl && settings.restaurantName) {
    nameEl.textContent = settings.restaurantName;
  }
}

// compute stats values
function renderDashboardStats() {
  const orders = Storage.get('rms_orders') || [];
  const tables = Storage.get('rms_tables') || [];
  const today  = new Date().toDateString();

  const delivered    = orders.filter(o => o.status === 'delivered');
  const totalRevenue = delivered.reduce((sum, o) => sum + o.total, 0);

  const todayOrders  = orders.filter(o => new Date(o.createdAt).toDateString() === today);

  const occupied     = tables.filter(t => t.status === 'occupied').length;

  const active       = orders.filter(o => o.status === 'pending' || o.status === 'preparing').length;

  setText('stat-revenue', formatPKR(totalRevenue));
  setText('stat-orders',  todayOrders.length);
  setText('stat-tables',  occupied + ' / ' + tables.length);
  setText('stat-pending', active);
}

// render weekly svg chart
function renderWeeklyChart() {
  const orders    = Storage.get('rms_orders') || [];
  const delivered = orders.filter(o => o.status === 'delivered');

  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      label: d.toLocaleDateString('en-PK', { weekday: 'short' }),
      date:  d.toDateString(),
      total: 0,
    });
  }

  delivered.forEach(o => {
    const ds  = new Date(o.createdAt).toDateString();
    const day = days.find(d => d.date === ds);
    if (day) day.total += o.total;
  });

  const maxVal    = Math.max(...days.map(d => d.total), 1);
  const SVG_W     = 460;
  const SVG_H     = 160;
  const PAD_L     = 10;
  const PAD_B     = 24;
  const BAR_W     = 36;
  const chartH    = SVG_H - PAD_B - 10;
  const step      = (SVG_W - PAD_L) / days.length;

  const bars = days.map((day, i) => {
    const barH  = Math.max(2, Math.round((day.total / maxVal) * chartH));
    const x     = PAD_L + i * step + (step - BAR_W) / 2;
    const y     = SVG_H - PAD_B - barH;
    const label = day.total >= 1000 ? (day.total / 1000).toFixed(1) + 'k' : day.total.toString();

    return `
      <rect x="${x}" y="${y}" width="${BAR_W}" height="${barH}" fill="#2563eb" rx="3" opacity="0.82"/>
      ${day.total > 0
        ? `<text x="${x + BAR_W / 2}" y="${y - 4}" text-anchor="middle" font-size="10" fill="#475569">${label}</text>`
        : ''}
      <text x="${x + BAR_W / 2}" y="${SVG_H - 7}" text-anchor="middle" font-size="11" fill="#94a3b8">${day.label}</text>
    `;
  }).join('');

  const svg = document.getElementById('weekly-chart');
  if (svg) {
    svg.setAttribute('viewBox', `0 0 ${SVG_W} ${SVG_H}`);
    svg.innerHTML = bars;
  }
}

// render recent orders list
function renderRecentOrders() {
  const orders = Storage.get('rms_orders') || [];

  const recent = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8);

  const tbody = document.getElementById('recent-orders-body');
  if (!tbody) return;

  if (recent.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:28px;color:var(--gray-400)">No orders yet. <a onclick="navigateTo('pos')" style="color:var(--primary);cursor:pointer">Create one in POS →</a></td></tr>`;
    return;
  }

  tbody.innerHTML = recent.map(order => {
    const itemsStr = order.items.map(i => i.name).join(', ');
    const truncated = itemsStr.length > 40 ? itemsStr.slice(0, 40) + '…' : itemsStr;
    return `
      <tr>
        <td><strong>${order.id}</strong></td>
        <td>${order.tableName}</td>
        <td style="color:var(--gray-500)">${truncated}</td>
        <td>${formatDateTime(order.createdAt)}</td>
        <td><strong>${formatPKR(order.total)}</strong></td>
        <td><span class="badge badge-${order.status}">${order.status}</span></td>
      </tr>
    `;
  }).join('');
}

// set element text helper
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}
