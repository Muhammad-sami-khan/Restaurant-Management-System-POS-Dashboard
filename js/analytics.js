let analyticsRange = 'weekly';

// start analytics page
function initAnalytics() {
  analyticsRange = 'weekly';

  document.querySelectorAll('.analytics-range-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.range === 'weekly');
  });

  renderAnalyticsSummary();
  renderAnalyticsCharts();
  renderPaymentBreakdown();
  renderCategoryBreakdown();
  renderTopItems();
}

// set weekly or monthly view
function setAnalyticsRange(btn, range) {
  analyticsRange = range;
  document.querySelectorAll('.analytics-range-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderAnalyticsCharts();
  renderPaymentBreakdown();
  renderCategoryBreakdown();
}

// calculate key statistics card values
function renderAnalyticsSummary() {
  const orders = Storage.get('rms_orders') || [];
  const delivered = orders.filter(o => o.status === 'delivered');

  const totalRev = delivered.reduce((s, o) => s + o.total, 0);
  const totalCount = delivered.length;
  const avgOrder = totalCount > 0 ? Math.round(totalRev / totalCount) : 0;

  setEl('analytics-total-revenue', formatPKR(totalRev));
  setEl('analytics-total-orders', totalCount);
  setEl('analytics-avg-order', formatPKR(avgOrder));
}

// map dates and values for drawing
function renderAnalyticsCharts() {
  const orders = Storage.get('rms_orders') || [];
  const delivered = orders.filter(o => o.status === 'delivered');

  const days = analyticsRange === 'weekly' ? 7 : 30;
  const dataMap = {};

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toDateString();
    const lbl = analyticsRange === 'weekly'
      ? d.toLocaleDateString('en-PK', { weekday: 'short' })
      : d.getDate().toString();

    dataMap[key] = { label: lbl, total: 0, count: 0 };
  }

  delivered.forEach(o => {
    const key = new Date(o.createdAt).toDateString();
    if (dataMap[key]) {
      dataMap[key].total += o.total;
      dataMap[key].count += 1;
    }
  });

  const data = Object.values(dataMap);

  drawBarChart('analytics-sales-chart', data, 'total', 'PKR');
  drawBarChart('analytics-orders-chart', data, 'count', 'num');
}

// build bar chart using custom svg elements
function drawBarChart(containerId, data, valueKey, unit) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const W = 500;
  const H = 190;
  const PL = 48;
  const PB = 28;
  const PT = 18;
  const PR = 12;

  const chartW = W - PL - PR;
  const chartH = H - PB - PT;

  const vals = data.map(d => d[valueKey]);
  const rawMax = Math.max(...vals, 1);
  const maxVal = rawMax * 1.15;

  const barW = Math.max(6, Math.floor(chartW / data.length) - (data.length > 15 ? 3 : 8));
  const step = chartW / data.length;

  const isSales = unit === 'PKR';
  const gradId = isSales ? 'salesBarGrad' : 'ordersBarGrad';
  const gradColors = isSales
    ? { c1: '#FF6B35', c2: '#E84E1B' }
    : { c1: '#3B82F6', c2: '#1D4ED8' };

  const defs = `
    <defs>
      <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${gradColors.c1}" />
        <stop offset="100%" stop-color="${gradColors.c2}" />
      </linearGradient>
    </defs>
  `;

  const guides = [0, 0.5, 1].map(ratio => {
    const val = Math.round(rawMax * ratio);
    const y = PT + chartH - Math.round(ratio * chartH);
    const lbl = unit === 'PKR'
      ? (val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val)
      : val;
    return `
      <text x="${PL - 8}" y="${y + 4}" text-anchor="end" font-size="10" font-weight="600" fill="#94A3B8">${lbl}</text>
      <line x1="${PL}" y1="${y}" x2="${PL + chartW}" y2="${y}" stroke="#F1F5F9" stroke-width="1" stroke-dasharray="3 3"/>
    `;
  }).join('');

  const bars = data.map((d, i) => {
    const val = d[valueKey];
    const barH = val > 0 ? Math.max(6, Math.round((val / maxVal) * chartH)) : 3;
    const x = PL + i * step + (step - barW) / 2;
    const y = PT + chartH - barH;

    const lbl = unit === 'PKR'
      ? (val >= 1000 ? (val / 1000).toFixed(1) + 'k' : (val > 0 ? val : ''))
      : (val > 0 ? val : '');

    return `
      <rect x="${x}" y="${PT}" width="${barW}" height="${chartH}" rx="4" fill="#F8FAFC" opacity="0.9"/>
      <rect x="${x}" y="${y}" width="${barW}" height="${barH}" fill="url(#${gradId})" rx="4" opacity="${val > 0 ? '1' : '0.2'}"/>
      ${lbl && data.length <= 14 ? `<text x="${x + barW / 2}" y="${y - 4}" text-anchor="middle" font-size="9.5" font-weight="700" fill="#64748B">${lbl}</text>` : ''}
      <text x="${x + barW / 2}" y="${H - 8}" text-anchor="middle" font-size="${data.length > 15 ? '8.5' : '10'}" font-weight="500" fill="#94A3B8">${d.label}</text>
    `;
  }).join('');

  container.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block;overflow:visible">
      ${defs}
      ${guides}
      ${bars}
      <line x1="${PL}" y1="${PT + chartH}" x2="${PL + chartW}" y2="${PT + chartH}" stroke="#E2E8F0" stroke-width="1.5"/>
    </svg>
  `;
}

// compute rank and display bars for most sold products
function renderTopItems() {
  const orders = Storage.get('rms_orders') || [];
  const delivered = orders.filter(o => o.status === 'delivered');

  const itemMap = {};
  delivered.forEach(order => {
    order.items.forEach(item => {
      if (!itemMap[item.name]) {
        itemMap[item.name] = { name: item.name, qty: 0, revenue: 0 };
      }
      itemMap[item.name].qty += item.qty;
      itemMap[item.name].revenue += item.price * item.qty;
    });
  });

  const top = Object.values(itemMap).sort((a, b) => b.qty - a.qty).slice(0, 8);
  const maxQty = Math.max(...top.map(i => i.qty), 1);

  const container = document.getElementById('top-items-list');
  if (!container) return;

  if (top.length === 0) {
    container.innerHTML = `<p style="color:var(--gray-400);padding:24px;font-size:13px;text-align:center;">No sales recorded yet. Deliver orders in POS or Orders tab.</p>`;
    return;
  }

  container.innerHTML = top.map((item, i) => {
    const rankClass = i === 0 ? 'rank-1' : (i === 1 ? 'rank-2' : (i === 2 ? 'rank-3' : ''));
    return `
      <div class="top-item">
        <div class="top-item-rank ${rankClass}">${i + 1}</div>
        <div class="top-item-info">
          <div class="top-item-name">${item.name}</div>
          <div class="top-item-bar-wrap">
            <div class="top-item-bar" style="width:${Math.round((item.qty / maxQty) * 100)}%"></div>
          </div>
        </div>
        <div class="top-item-stats">
          <span style="font-weight:700; color:var(--gray-700);">${item.qty} sold</span>
          <span class="top-item-revenue">${formatPKR(item.revenue)}</span>
        </div>
      </div>
    `;
  }).join('');
}

// update element helper
function setEl(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// Payment method distribution breakdown
function renderPaymentBreakdown() {
  const container = document.getElementById('analytics-payment-breakdown');
  if (!container) return;

  const orders = Storage.get('rms_orders') || [];
  const days = analyticsRange === 'weekly' ? 7 : 30;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const delivered = orders.filter(o => o.status === 'delivered' && new Date(o.createdAt) >= cutoff);
  const totalRev = delivered.reduce((sum, o) => sum + o.total, 0) || 1;

  const methods = {
    cash:   { name: 'Cash', iconSvg: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px;margin-right:5px;display:inline-block;"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle></svg>', total: 0, count: 0, fillClass: 'fill-cash' },
    card:   { name: 'Card / POS', iconSvg: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px;margin-right:5px;display:inline-block;"><rect x="1" y="4" width="22" height="16" rx="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>', total: 0, count: 0, fillClass: 'fill-card' },
    online: { name: 'Online / UPI', iconSvg: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px;margin-right:5px;display:inline-block;"><rect x="5" y="2" width="14" height="20" rx="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>', total: 0, count: 0, fillClass: 'fill-online' },
  };

  delivered.forEach(o => {
    const m = (o.paymentMethod || 'cash').toLowerCase();
    if (methods[m]) {
      methods[m].total += o.total;
      methods[m].count += 1;
    } else {
      methods.cash.total += o.total;
      methods.cash.count += 1;
    }
  });

  const methodList = Object.values(methods);

  container.innerHTML = `
    <div class="breakdown-list">
      ${methodList.map(m => {
        const pct = Math.round((m.total / totalRev) * 100) || 0;
        return `
          <div class="breakdown-row">
            <div class="breakdown-row-header">
              <span class="breakdown-name">${m.iconSvg}${m.name} (${m.count} orders)</span>
              <span class="breakdown-meta"><strong>${formatPKR(m.total)}</strong> · ${pct}%</span>
            </div>
            <div class="breakdown-bar-track">
              <div class="breakdown-bar-fill ${m.fillClass}" style="width:${pct}%"></div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// Category sales revenue breakdown
function renderCategoryBreakdown() {
  const container = document.getElementById('analytics-category-breakdown');
  if (!container) return;

  const orders = Storage.get('rms_orders') || [];
  const menu   = Storage.get('rms_menu') || [];
  const days   = analyticsRange === 'weekly' ? 7 : 30;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const delivered = orders.filter(o => o.status === 'delivered' && new Date(o.createdAt) >= cutoff);
  const totalRev  = delivered.reduce((sum, o) => sum + o.total, 0) || 1;

  // Map menu item names to categories
  const catMap = {};
  menu.forEach(item => { catMap[item.name] = item.category; });

  const catTotals = {};

  delivered.forEach(order => {
    order.items.forEach(item => {
      const cat = catMap[item.name] || 'Other';
      if (!catTotals[cat]) catTotals[cat] = { name: cat, total: 0, count: 0 };
      catTotals[cat].total += item.price * item.qty;
      catTotals[cat].count += item.qty;
    });
  });

  const sortedCats = Object.values(catTotals).sort((a, b) => b.total - a.total);

  if (sortedCats.length === 0) {
    container.innerHTML = `<p style="color:var(--gray-400);padding:8px 0;font-size:12px;">No sales data available for this date range.</p>`;
    return;
  }

  const fillClasses = ['fill-cat-0', 'fill-cat-1', 'fill-cat-2', 'fill-cat-3', 'fill-cat-4'];

  container.innerHTML = `
    <div class="breakdown-list">
      ${sortedCats.map((c, i) => {
        const pct = Math.round((c.total / totalRev) * 100) || 0;
        const fillClass = fillClasses[i % fillClasses.length];
        return `
          <div class="breakdown-row">
            <div class="breakdown-row-header">
              <span class="breakdown-name">${c.name} (${c.count} items)</span>
              <span class="breakdown-meta"><strong>${formatPKR(c.total)}</strong> · ${pct}%</span>
            </div>
            <div class="breakdown-bar-track">
              <div class="breakdown-bar-fill ${fillClass}" style="width:${pct}%"></div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}
