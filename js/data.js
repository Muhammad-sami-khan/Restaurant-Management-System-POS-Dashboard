// default items for menu
const SEED_MENU = [
  {
    id: 'm1', name: 'Zinger Burger', category: 'Burgers', price: 450,
    description: 'Crispy chicken fillet with lettuce & mayo',
    available: true,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=480&h=320&fit=crop&q=85'
  },
  {
    id: 'm2', name: 'Beef Burger', category: 'Burgers', price: 550,
    description: 'Juicy beef patty with cheddar & pickles',
    available: true,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=480&h=320&fit=crop&q=85'
  },
  {
    id: 'm3', name: 'Double Smash Burger', category: 'Burgers', price: 750,
    description: 'Two smashed beef patties with special sauce',
    available: true,
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=480&h=320&fit=crop&q=85'
  },
  {
    id: 'm4', name: 'Chicken Club Burger', category: 'Burgers', price: 500,
    description: 'Grilled chicken with fresh veggies & mustard',
    available: true,
    image: 'https://images.unsplash.com/photo-1520072959219-c782350c94bc?w=480&h=320&fit=crop&q=85'
  },
  {
    id: 'm5', name: 'Margherita Pizza', category: 'Pizza', price: 900,
    description: 'Classic tomato base with mozzarella cheese',
    available: true,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=480&h=320&fit=crop&q=85'
  },
  {
    id: 'm6', name: 'BBQ Chicken Pizza', category: 'Pizza', price: 1100,
    description: 'Smoky BBQ chicken with onions & green peppers',
    available: true,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=480&h=320&fit=crop&q=85'
  },
  {
    id: 'm7', name: 'Pepperoni Pizza', category: 'Pizza', price: 1200,
    description: 'Generously loaded with pepperoni slices',
    available: true,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=480&h=320&fit=crop&q=85'
  },
  {
    id: 'm8', name: 'Veggie Supreme Pizza', category: 'Pizza', price: 850,
    description: 'Fresh garden vegetables on rich tomato sauce',
    available: true,
    image: 'https://images.unsplash.com/photo-1511689660979-10d2b1afd49d?w=480&h=320&fit=crop&q=85'
  },
  {
    id: 'm9', name: 'Coca-Cola', category: 'Drinks', price: 150,
    description: 'Chilled 330 ml can, ice cold',
    available: true,
    image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=480&h=320&fit=crop&q=85'
  },
  {
    id: 'm10', name: 'Fresh Orange Juice', category: 'Drinks', price: 250,
    description: 'Freshly squeezed orange juice, served chilled',
    available: true,
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=480&h=320&fit=crop&q=85'
  },
  {
    id: 'm11', name: 'Mint Lemonade', category: 'Drinks', price: 200,
    description: 'Refreshing mint & lemon with soda water',
    available: true,
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=480&h=320&fit=crop&q=85'
  },
  {
    id: 'm12', name: 'Chocolate Milkshake', category: 'Drinks', price: 350,
    description: 'Thick creamy chocolate shake, large serving',
    available: true,
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=480&h=320&fit=crop&q=85'
  },
  {
    id: 'm13', name: 'Chocolate Brownie', category: 'Desserts', price: 300,
    description: 'Warm brownie served with vanilla ice cream',
    available: true,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=480&h=320&fit=crop&q=85'
  },
  {
    id: 'm14', name: 'Vanilla Ice Cream', category: 'Desserts', price: 200,
    description: '2 scoops of premium vanilla ice cream',
    available: true,
    image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=480&h=320&fit=crop&q=85'
  },
  {
    id: 'm15', name: 'NY Cheesecake', category: 'Desserts', price: 400,
    description: 'Classic baked cheesecake with berry compote',
    available: true,
    image: 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=480&h=320&fit=crop&q=85'
  },
  {
    id: 'm16', name: 'Fruit Tart', category: 'Desserts', price: 350,
    description: 'Fresh seasonal fruits on a custard tart base',
    available: true,
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=480&h=320&fit=crop&q=85'
  },
];

// default tables list
const SEED_TABLES = [
  { id: 't1', name: 'Table 1', seats: 2, status: 'available' },
  { id: 't2', name: 'Table 2', seats: 2, status: 'occupied' },
  { id: 't3', name: 'Table 3', seats: 4, status: 'available' },
  { id: 't4', name: 'Table 4', seats: 4, status: 'reserved' },
  { id: 't5', name: 'Table 5', seats: 4, status: 'available' },
  { id: 't6', name: 'Table 6', seats: 6, status: 'occupied' },
  { id: 't7', name: 'Table 7', seats: 6, status: 'available' },
  { id: 't8', name: 'Table 8', seats: 4, status: 'reserved' },
  { id: 't9', name: 'Table 9', seats: 2, status: 'available' },
  { id: 't10', name: 'Table 10', seats: 8, status: 'occupied' },
  { id: 't11', name: 'Table 11', seats: 4, status: 'available' },
  { id: 't12', name: 'Table 12', seats: 6, status: 'available' },
];

// default settings values
const SEED_SETTINGS = {
  restaurantName: 'Smart Restaurant',
  address: 'Main Boulevard, Gulberg III, Lahore',
  phone: '0300-1234567',
  taxRate: 10,
  currency: 'PKR',
};

// create fake orders for charts
function generateSeedOrders() {
  const now = new Date();

  const sampleOrders = [
    { items: [{ menuId: 'm1', name: 'Zinger Burger', price: 450, qty: 2 }, { menuId: 'm9', name: 'Coca-Cola', price: 150, qty: 2 }], table: 't3', status: 'delivered', daysAgo: 0 },
    { items: [{ menuId: 'm6', name: 'BBQ Chicken Pizza', price: 1100, qty: 1 }, { menuId: 'm11', name: 'Mint Lemonade', price: 200, qty: 2 }], table: 't6', status: 'delivered', daysAgo: 0 },
    { items: [{ menuId: 'm3', name: 'Double Smash Burger', price: 750, qty: 1 }, { menuId: 'm13', name: 'Chocolate Brownie', price: 300, qty: 1 }], table: 't2', status: 'preparing', daysAgo: 0 },
    { items: [{ menuId: 'm7', name: 'Pepperoni Pizza', price: 1200, qty: 1 }, { menuId: 'm12', name: 'Chocolate Milkshake', price: 350, qty: 1 }], table: 't10', status: 'ready', daysAgo: 1 },
    { items: [{ menuId: 'm2', name: 'Beef Burger', price: 550, qty: 2 }, { menuId: 'm10', name: 'Fresh Orange Juice', price: 250, qty: 2 }], table: 't5', status: 'delivered', daysAgo: 1 },
    { items: [{ menuId: 'm5', name: 'Margherita Pizza', price: 900, qty: 1 }, { menuId: 'm14', name: 'Vanilla Ice Cream', price: 200, qty: 2 }], table: 't7', status: 'delivered', daysAgo: 2 },
    { items: [{ menuId: 'm4', name: 'Chicken Club Burger', price: 500, qty: 3 }], table: 't1', status: 'delivered', daysAgo: 2 },
    { items: [{ menuId: 'm8', name: 'Veggie Supreme Pizza', price: 850, qty: 1 }, { menuId: 'm15', name: 'NY Cheesecake', price: 400, qty: 1 }], table: 't9', status: 'delivered', daysAgo: 3 },
    { items: [{ menuId: 'm1', name: 'Zinger Burger', price: 450, qty: 1 }, { menuId: 'm16', name: 'Fruit Tart', price: 350, qty: 1 }], table: 't3', status: 'delivered', daysAgo: 4 },
    { items: [{ menuId: 'm6', name: 'BBQ Chicken Pizza', price: 1100, qty: 2 }, { menuId: 'm9', name: 'Coca-Cola', price: 150, qty: 3 }], table: 't11', status: 'delivered', daysAgo: 5 },
    { items: [{ menuId: 'm3', name: 'Double Smash Burger', price: 750, qty: 2 }, { menuId: 'm11', name: 'Mint Lemonade', price: 200, qty: 2 }], table: 't6', status: 'pending', daysAgo: 0 },
    { items: [{ menuId: 'm7', name: 'Pepperoni Pizza', price: 1200, qty: 1 }, { menuId: 'm14', name: 'Vanilla Ice Cream', price: 200, qty: 1 }], table: 't4', status: 'delivered', daysAgo: 6 },
  ];

  return sampleOrders.map((order, i) => {
    const subtotal = order.items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const tax = Math.round(subtotal * 0.10);
    const total = subtotal + tax;

    const date = new Date(now);
    date.setDate(date.getDate() - order.daysAgo);
    date.setHours(10 + Math.floor(Math.random() * 11), Math.floor(Math.random() * 60), 0, 0);

    return {
      id: `ORD-${String(i + 1).padStart(3, '0')}`,
      tableId: order.table,
      tableName: `Table ${order.table.replace('t', '')}`,
      items: order.items,
      subtotal, tax, discount: 0, total,
      status: order.status,
      createdAt: date.toISOString(),
      note: '',
    };
  }); 
}

// load data on page load
function initData() {
  const currentSettings = Storage.get('rms_settings');
  if (currentSettings && (currentSettings.restaurantName === 'RMS Restaurant' || currentSettings.restaurantName.includes('RMS'))) {
    Storage.clearAll();
  }

  if (!Storage.get('rms_menu')) Storage.set('rms_menu', SEED_MENU);
  if (!Storage.get('rms_tables')) Storage.set('rms_tables', SEED_TABLES);
  if (!Storage.get('rms_orders')) Storage.set('rms_orders', generateSeedOrders());
  if (!Storage.get('rms_settings')) Storage.set('rms_settings', SEED_SETTINGS);
}
