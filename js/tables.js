// load tables page
function initTables() {
  renderTableSummary();
  renderTables();
}

// compute summaries for available, occupied, reserved
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

// draw table cards in grid
function renderTables() {
  const tables = Storage.get('rms_tables') || [];
  const grid   = document.getElementById('tables-grid');
  if (!grid) return;

  if (tables.length === 0) {
    grid.innerHTML = `<div class="empty-state"><p>No tables found.</p></div>`;
    return;
  }

  grid.innerHTML = tables.map(table => `
    <div class="table-card status-${table.status}">
      <div class="table-number">${table.name}</div>
      <div class="table-seats">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        ${table.seats} seats
      </div>
      <div class="table-status-text">${table.status}</div>
      <button class="table-action-btn" onclick="cycleTableStatus('${table.id}')">
        Change Status
      </button>
    </div>
  `).join('');
}

// click status cycle (available -> occupied -> reserved -> available)
function cycleTableStatus(tableId) {
  const tables = Storage.get('rms_tables') || [];
  const table  = tables.find(t => t.id === tableId);
  if (!table) return;

  const cycle  = { available: 'occupied', occupied: 'reserved', reserved: 'available' };
  const next   = cycle[table.status] || 'available';

  Storage.updateById('rms_tables', tableId, { status: next });
  showToast(`${table.name}: ${table.status} → ${next}`);

  renderTableSummary();
  renderTables();
}

// helper to set text
function setTxt(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}
