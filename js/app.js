// handle page routing
function navigateTo(pageId) {
  const pages = {
    dashboard: initDashboard,
    pos:       initPOS,
    orders:    initOrders,
    menu:      initMenu,
    tables:    initTables,
    analytics: initAnalytics,
    settings:  initSettings,
  };

  if (!pages[pageId]) return;

  // hide all screens
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  // show selected screen
  const section = document.getElementById('page-' + pageId);
  if (section) section.classList.add('active');

  // update active link in sidebar
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.page === pageId);
  });

  // set tab title
  const titles = {
    dashboard: 'Dashboard',
    pos:       'New Order (POS)',
    orders:    'Orders',
    menu:      'Menu Management',
    tables:    'Tables',
    analytics: 'Analytics',
    settings:  'Settings',
  };
  document.title = (titles[pageId] || pageId) + ' — Restaurant POS';

  pages[pageId]();

  // close mobile menu
  if (window.innerWidth <= 768) {
    document.getElementById('sidebar').classList.remove('open');
  }
}

let _toastTimer = null;

// show popup toast message
function showToast(message, duration = 2500) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
}

// open modal dialog
function openModal(modalId) {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.add('open');

  document.querySelectorAll('.modal').forEach(m => (m.style.display = 'none'));
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'block';
}

// close modal dialog
function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}

// format price to PKR currency
function formatPKR(amount) {
  const settings = Storage.get('rms_settings') || {};
  const symbol   = settings.currency || 'PKR';
  return symbol + ' ' + Number(amount).toLocaleString('en-PK');
}

// date formatter
function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-PK', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

// time formatter
function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-PK', {
    hour: '2-digit', minute: '2-digit'
  });
}

// combined date and time formatter
function formatDateTime(iso) {
  return formatDate(iso) + ', ' + formatTime(iso);
}

// generate random id for new entries
function generateId(prefix = '') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

// click outside modal to close
document.getElementById('modal-overlay').addEventListener('click', function (e) {
  if (e.target === this) closeModal();
});

// sidebar click navigation
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => navigateTo(link.dataset.page));
});

// hamburger button toggle
document.getElementById('mobile-menu-btn').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

// initialize app data and show dashboard
initData();
navigateTo('dashboard');
