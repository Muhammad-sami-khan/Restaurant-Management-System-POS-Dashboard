let analyticsRange = 'weekly';

// start analytics page
function initAnalytics() {
  analyticsRange = 'weekly';

  document.querySelectorAll('.analytics-range-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.range === 'weekly');
  });

  renderAnalyticsSummary();
  renderAnalyticsCharts();
  renderTopItems();
}

// set weekly or monthly view
function setAnalyticsRange(btn, range) {
  analyticsRange = range;
  document.querySelectorAll('.analytics-range-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderAnalyticsCharts();
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
  const PL = 44;
  const PB = 26;
  const PT = 16;
  const PR = 8;

  const chartW = W - PL - PR;
  const chartH = H - PB - PT;

  const vals = data.map(d => d[valueKey]);
  const maxVal = Math.max(...vals, 1);

  const barW = Math.max(8, Math.floor(chartW / data.length) - 5);
  const step = chartW / data.length;

  const guides = [0, 0.5, 1].map(ratio => {
    const val = Math.round(maxVal * ratio);
    const y = PT + chartH - Math.round(ratio * chartH);
    const lbl = unit === 'PKR'
      ? (val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val)
      : val;
    return `
      <text x="${PL - 6}" y="${y + 4}" text-anchor="end" font-size="10" fill="#94a3b8">${lbl}</text>
      <line x1="${PL}" y1="${y}" x2="${PL + chartW}" y2="${y}" stroke="#e2e8f0" stroke-dasharray="3"/>
    `;
  }).join('');

  const bars = data.map((d, i) => {
    const val = d[valueKey];
    const barH = Math.max(val > 0 ? 2 : 0, Math.round((val / maxVal) * chartH));
    const x = PL + i * step + (step - barW) / 2;
    const y = PT + chartH - barH;

    const lbl = unit === 'PKR'
      ? (val >= 1000 ? (val / 1000).toFixed(1) + 'k' : (val > 0 ? val : ''))
      : (val > 0 ? val : '');

    return `
      <rect x="${x}" y="${y}" width="${barW}" height="${barH}" fill="#2563eb" rx="2" opacity="0.8"/>
      ${lbl ? `<text x="${x + barW / 2}" y="${y - 4}" text-anchor="middle" font-size="9" fill="#64748b">${lbl}</text>` : ''}
      <text x="${x + barW / 2}" y="${H - 8}" text-anchor="middle" font-size="${data.length > 15 ? '9' : '10'}" fill="#94a3b8">${d.label}</text>
    `;
  }).join('');

  container.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block;overflow:visible">
      ${guides}
      ${bars}
      <line x1="${PL}" y1="${PT}" x2="${PL}" y2="${PT + chartH}" stroke="#cbd5e1" stroke-width="1"/>
      <line x1="${PL}" y1="${PT + chartH}" x2="${PL + chartW}" y2="${PT + chartH}" stroke="#cbd5e1" stroke-width="1"/>
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
    container.innerHTML = `<p style="color:var(--gray-400);padding:16px;font-size:13px">No data yet. Deliver some orders first!</p>`;
    return;
  }

  container.innerHTML = top.map((item, i) => `
    <div class="top-item">
      <div class="top-item-rank">${i + 1}</div>
      <div class="top-item-info">
        <div class="top-item-name">${item.name}</div>
        <div class="top-item-bar-wrap">
          <div class="top-item-bar" style="width:${Math.round((item.qty / maxQty) * 100)}%"></div>
        </div>
      </div>
      <div class="top-item-stats">
        <span>${item.qty} sold</span>
        <span class="top-item-revenue">${formatPKR(item.revenue)}</span>
      </div>
    </div>
  `).join('');
}

// update element helper
function setEl(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}
