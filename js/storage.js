// localstorage helper methods
const Storage = {
  // get item by key
  get(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.error(err);
      return null;
    }
  },

  // save item
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(err);
    }
  },

  // find item by id and update it
  updateById(key, id, changes) {
    const items = this.get(key) || [];
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...changes };
      this.set(key, items);
      return items[index];
    }
    return null;
  },

  // delete item by id
  removeById(key, id) {
    const items = this.get(key) || [];
    this.set(key, items.filter(item => item.id !== id));
  },

  // clear all storage keys
  clearAll() {
    ['rms_menu', 'rms_orders', 'rms_tables', 'rms_settings'].forEach(key => {
      localStorage.removeItem(key);
    });
  }
};
