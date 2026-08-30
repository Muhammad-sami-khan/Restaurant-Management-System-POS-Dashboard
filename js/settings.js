// load page
function initSettings() {
  loadSettings();
}

// load form inputs from storage settings values
function loadSettings() {
  const settings = Storage.get('rms_settings') || {
    restaurantName: 'Smart Restaurant',
    address: 'Main Boulevard, Gulberg III, Lahore',
    phone: '0300-1234567',
    taxRate: 10,
    currency: 'PKR',
  };

  const nameEl     = document.getElementById('settings-name');
  const addressEl  = document.getElementById('settings-address');
  const phoneEl    = document.getElementById('settings-phone');
  const taxEl      = document.getElementById('settings-tax');
  const currencyEl = document.getElementById('settings-currency');

  if (nameEl)     nameEl.value     = settings.restaurantName || '';
  if (addressEl)  addressEl.value  = settings.address || '';
  if (phoneEl)    phoneEl.value    = settings.phone || '';
  if (taxEl)      taxEl.value      = settings.taxRate !== undefined ? settings.taxRate : 10;
  if (currencyEl) currencyEl.value = settings.currency || 'PKR';
}

// save button form submit
function saveSettings(e) {
  if (e && e.preventDefault) e.preventDefault();

  const name     = document.getElementById('settings-name')?.value.trim() || 'Smart Restaurant';
  const address  = document.getElementById('settings-address')?.value.trim() || '';
  const phone    = document.getElementById('settings-phone')?.value.trim() || '';
  const taxRate  = parseFloat(document.getElementById('settings-tax')?.value) || 0;
  const currency = document.getElementById('settings-currency')?.value.trim() || 'PKR';

  const newSettings = {
    restaurantName: name,
    address,
    phone,
    taxRate: Math.max(0, taxRate),
    currency
  };

  Storage.set('rms_settings', newSettings);

  const sidebarBrand = document.getElementById('sidebar-restaurant-name');
  if (sidebarBrand) {
    sidebarBrand.textContent = name;
  }

  showToast('Settings saved successfully!');
}

// reset defaults button action
function resetAllData() {
  const confirmed = confirm(
    'WARNING: Are you sure you want to reset all data?\n\n' +
    'This will restore default sample menu items, tables, orders, and settings. All your current custom entries will be replaced.'
  );

  if (!confirmed) return;

  Storage.clearAll();
  initData();
  loadSettings();

  const settings = Storage.get('rms_settings') || {};
  const sidebarBrand = document.getElementById('sidebar-restaurant-name');
  if (sidebarBrand && settings.restaurantName) {
    sidebarBrand.textContent = settings.restaurantName;
  }

  showToast('All data has been reset to defaults.');
}
