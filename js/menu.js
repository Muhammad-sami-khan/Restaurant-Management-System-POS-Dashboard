let menuSearch    = '';
let menuCategory  = 'All';
let editingMenuId = null;

// open menu page
function initMenu() {
  menuSearch    = '';
  menuCategory  = 'All';
  editingMenuId = null;

  const searchEl = document.getElementById('menu-search');
  if (searchEl) searchEl.value = '';

  renderMenuCategories();
  renderMenuItems();
}

// search field text update
function menuSearchHandler(value) {
  menuSearch = value.toLowerCase().trim();
  renderMenuItems();
}

// load tab options for categories
function renderMenuCategories() {
  const menu       = Storage.get('rms_menu') || [];
  const categories = ['All', ...new Set(menu.map(item => item.category))];
  const container  = document.getElementById('menu-categories');
  if (!container) return;

  container.innerHTML = categories.map(cat => `
    <button class="cat-tab ${cat === menuCategory ? 'active' : ''}"
            onclick="setMenuCategory('${cat}', this)">
      ${cat}
    </button>
  `).join('');
}

// set filter category and reload
function setMenuCategory(cat, btn) {
  menuCategory = cat;
  document.querySelectorAll('#menu-categories .cat-tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderMenuItems();
}

// draw list of items with edit/delete buttons
function renderMenuItems() {
  const menu = Storage.get('rms_menu') || [];
  let filtered = menu;

  if (menuCategory !== 'All') {
    filtered = filtered.filter(item => item.category === menuCategory);
  }
  if (menuSearch) {
    filtered = filtered.filter(item =>
      item.name.toLowerCase().includes(menuSearch) ||
      item.category.toLowerCase().includes(menuSearch) ||
      (item.description || '').toLowerCase().includes(menuSearch)
    );
  }

  const grid = document.getElementById('menu-items-grid');
  if (!grid) return;

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><p>No items found.</p></div>`;
    return;
  }

  grid.innerHTML = filtered.map(item => {
    const imgHTML = item.image
      ? `<img src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.style.display='none'" />`
      : '';

    return `
      <div class="menu-item-card ${!item.available ? 'unavailable' : ''}">
        <div class="mic-photo">
          ${imgHTML}
          <span class="mic-avail-badge ${item.available ? 'available' : 'unavailable'}">
            ${item.available ? '● Available' : '○ Unavailable'}
          </span>
        </div>
        <div class="mic-body">
          <span class="mic-category">${item.category}</span>
          <div class="mic-name">${item.name}</div>
          <div class="mic-description">${item.description || 'No description.'}</div>
          <div class="mic-footer">
            <span class="mic-price">${formatPKR(item.price)}</span>
            <div class="mic-actions">
              <button class="btn-icon" title="Edit" onclick="openMenuModal('${item.id}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/>
                </svg>
              </button>
              <button class="btn-icon" title="${item.available ? 'Mark unavailable' : 'Mark available'}"
                      onclick="toggleAvailability('${item.id}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
              <button class="btn-icon" title="Delete" style="color:var(--danger)"
                      onclick="deleteMenuItem('${item.id}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// open form dialog to add/edit menu
function openMenuModal(itemId) {
  editingMenuId = itemId || null;
  const form = document.getElementById('menu-form');
  if (form) form.reset();

  document.getElementById('menu-modal-title').textContent = itemId ? 'Edit Menu Item' : 'Add Menu Item';

  // Populate category datalist with existing unique categories
  const menu = Storage.get('rms_menu') || [];
  const datalist = document.getElementById('menu-categories-datalist');
  if (datalist) {
    const uniqueCats = [...new Set(menu.map(i => i.category))];
    datalist.innerHTML = uniqueCats.map(cat => `<option value="${cat}"></option>`).join('');
  }

  if (itemId) {
    const item = menu.find(m => m.id === itemId);
    if (!item) return;

    document.getElementById('menu-form-name').value        = item.name;
    document.getElementById('menu-form-category').value   = item.category;
    document.getElementById('menu-form-price').value      = item.price;
    document.getElementById('menu-form-description').value = item.description || '';
    document.getElementById('menu-form-image').value      = item.image || '';
    document.getElementById('menu-form-available').checked = item.available;
  } else {
    document.getElementById('menu-form-available').checked = true;
  }

  openModal('modal-menu-form');
}

// save button event handler
function saveMenuItem(e) {
  e.preventDefault();

  const name        = document.getElementById('menu-form-name').value.trim();
  const category    = document.getElementById('menu-form-category').value.trim();
  const priceRaw    = parseFloat(document.getElementById('menu-form-price').value);
  const description = document.getElementById('menu-form-description').value.trim();
  const image       = document.getElementById('menu-form-image').value.trim();
  const available   = document.getElementById('menu-form-available').checked;

  if (!name || !category) { showToast('Name and category are required.'); return; }
  if (isNaN(priceRaw) || priceRaw <= 0) { showToast('Enter a valid price.'); return; }

  const price = Math.round(priceRaw);

  if (editingMenuId) {
    Storage.updateById('rms_menu', editingMenuId, { name, category, price, description, image, available });
    showToast(`"${name}" updated.`);
  } else {
    const menu = Storage.get('rms_menu') || [];
    menu.push({ id: generateId('m'), name, category, price, description, image, available });
    Storage.set('rms_menu', menu);
    showToast(`"${name}" added to menu.`);
  }

  closeModal();
  renderMenuCategories();
  renderMenuItems();
}

// enable/disable menu item availability
function toggleAvailability(itemId) {
  const menu = Storage.get('rms_menu') || [];
  const item = menu.find(m => m.id === itemId);
  if (!item) return;
  Storage.updateById('rms_menu', itemId, { available: !item.available });
  showToast(`"${item.name}" is now ${item.available ? 'unavailable' : 'available'}.`);
  renderMenuItems();
}

// delete item from list
function deleteMenuItem(itemId) {
  const menu = Storage.get('rms_menu') || [];
  const item = menu.find(m => m.id === itemId);
  if (!item) return;
  if (!confirm(`Delete "${item.name}"?`)) return;
  Storage.removeById('rms_menu', itemId);
  showToast(`"${item.name}" deleted.`);
  renderMenuCategories();
  renderMenuItems();
}
