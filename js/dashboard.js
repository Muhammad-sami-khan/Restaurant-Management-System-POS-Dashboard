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
  const todayStr  = new Date().toDateString();

  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      label: d.toLocaleDateString('en-PK', { weekday: 'short' }),
      date:  d.toDateString(),
      isToday: d.toDateString() === todayStr,
      total: 0,
    });
  }

  delivered.forEach(o => {
    const ds  = new Date(o.createdAt).toDateString();
    const day = days.find(d => d.date === ds);
    if (day) day.total += o.total;
  });

  const rawMax = Math.max(...days.map(d => d.total));
  const maxVal = rawMax > 0 ? rawMax * 1.15 : 5000;
  const SVG_W  = 480;
  const SVG_H  = 170;
  const PAD_L  = 12;
  const PAD_R  = 12;
  const PAD_T  = 20;
  const PAD_B  = 26;
  const BAR_W  = 34;
  const chartH = SVG_H - PAD_T - PAD_B;
  const step   = (SVG_W - PAD_L - PAD_R) / days.length;

  // Grid lines
  const gridLines = [0.25, 0.5, 0.75, 1.0].map(pct => {
    const y = PAD_T + chartH * (1 - pct);
    return `<line x1="${PAD_L}" y1="${y}" x2="${SVG_W - PAD_R}" y2="${y}" stroke="#F1F5F9" stroke-width="1" stroke-dasharray="3 3"/>`;
  }).join('');

  const defs = `
    <defs>
      <linearGradient id="chartBarGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FF6B35" />
        <stop offset="100%" stop-color="#E84E1B" />
      </linearGradient>
      <linearGradient id="chartBarGradToday" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FF8A50" />
        <stop offset="100%" stop-color="#FF5722" />
      </linearGradient>
      <filter id="chartGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#FF5722" flood-opacity="0.25"/>
      </filter>
    </defs>
  `;

  const bars = days.map((day, i) => {
    const x = PAD_L + i * step + (step - BAR_W) / 2;
    const barH = day.total > 0 ? Math.max(8, Math.round((day.total / maxVal) * chartH)) : 4;
    const y = SVG_H - PAD_B - barH;
    const label = day.total >= 1000 ? (day.total / 1000).toFixed(1) + 'k' : day.total.toString();
    const fill = day.isToday ? 'url(#chartBarGradToday)' : 'url(#chartBarGrad)';
    const filter = day.total > 0 ? 'filter="url(#chartGlow)"' : '';
    const labelColor = day.isToday ? '#FF5722' : '#64748B';
    const dayColor = day.isToday ? '#FF5722' : '#94A3B8';
    const fontWeight = day.isToday ? '700' : '500';

    return `
      <!-- Background Track Slot -->
      <rect x="${x}" y="${PAD_T}" width="${BAR_W}" height="${chartH}" rx="6" fill="#F8FAFC" opacity="0.9"/>
      <!-- Active Bar -->
      <rect x="${x}" y="${y}" width="${BAR_W}" height="${barH}" fill="${fill}" rx="6" ${filter} opacity="${day.total > 0 ? '1' : '0.2'}"/>
      <!-- Value Label -->
      ${day.total > 0
        ? `<text x="${x + BAR_W / 2}" y="${y - 6}" text-anchor="middle" font-size="10.5" font-weight="700" fill="${labelColor}">${label}</text>`
        : ''}
      <!-- Weekday Label -->
      <text x="${x + BAR_W / 2}" y="${SVG_H - 8}" text-anchor="middle" font-size="11" font-weight="${fontWeight}" fill="${dayColor}">${day.label}${day.isToday ? ' •' : ''}</text>
    `;
  }).join('');

  const svg = document.getElementById('weekly-chart');
  if (svg) {
    svg.setAttribute('viewBox', `0 0 ${SVG_W} ${SVG_H}`);
    svg.innerHTML = defs + gridLines + bars;
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
    const target = order.customerName ? `${order.tableName} · ${order.customerName}` : order.tableName;
    return `
      <tr>
        <td><strong>${order.id}</strong></td>
        <td>${target}</td>
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
