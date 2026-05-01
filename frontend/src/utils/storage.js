// Centralized localStorage management for data persistence

const STORAGE_KEYS = {
  INVENTORY: 'biztrack_inventory',
  TRANSACTIONS: 'biztrack_transactions',
  SALES: 'biztrack_sales',
  EXPENSES: 'biztrack_expenses',
  EMPLOYEES: 'biztrack_employees',
  SUMMARY: 'biztrack_summary',
  SETTINGS: 'biztrack_settings'
};

// Generic storage functions
export const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
    return false;
  }
};

export const loadFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error loading from localStorage (${key}):`, error);
    return defaultValue;
  }
};

export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
    return false;
  }
};

export const clearAllStorage = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};

// Specific data management functions
export const InventoryStorage = {
  save: (inventory) => saveToStorage(STORAGE_KEYS.INVENTORY, inventory),
  load: () => loadFromStorage(STORAGE_KEYS.INVENTORY, []),
  add: (item) => {
    const inventory = InventoryStorage.load();
    const newItem = { ...item, id: Date.now() };
    inventory.push(newItem);
    InventoryStorage.save(inventory);
    return newItem;
  },
  update: (id, updates) => {
    const inventory = InventoryStorage.load();
    const index = inventory.findIndex(item => item.id === id);
    if (index !== -1) {
      inventory[index] = { ...inventory[index], ...updates };
      InventoryStorage.save(inventory);
      return inventory[index];
    }
    return null;
  },
  delete: (id) => {
    const inventory = InventoryStorage.load();
    const filtered = inventory.filter(item => item.id !== id);
    InventoryStorage.save(filtered);
    return filtered;
  },
  findByName: (name) => {
    const inventory = InventoryStorage.load();
    return inventory.find(item => 
      item.name.toLowerCase() === name.toLowerCase()
    );
  },
  deductStock: (itemName, quantity) => {
    const inventory = InventoryStorage.load();
    const item = inventory.find(i => 
      i.name.toLowerCase() === itemName.toLowerCase()
    );
    
    if (item) {
      item.quantity = Math.max(0, item.quantity - quantity);
      item.lastRestocked = new Date().toISOString().split('T')[0];
      InventoryStorage.save(inventory);
      return { success: true, item };
    }
    
    return { success: false, message: 'Item not found in inventory' };
  }
};

export const SalesStorage = {
  save: (sales) => saveToStorage(STORAGE_KEYS.SALES, sales),
  load: () => loadFromStorage(STORAGE_KEYS.SALES, []),
  add: (sale) => {
    const sales = SalesStorage.load();
    const newSale = { ...sale, id: Date.now(), created_at: new Date().toISOString() };
    sales.unshift(newSale);
    SalesStorage.save(sales);
    
    // Auto-deduct from inventory
    if (sale.item_name && sale.quantity) {
      InventoryStorage.deductStock(sale.item_name, sale.quantity);
    }
    
    return newSale;
  }
};

export const TransactionsStorage = {
  save: (transactions) => saveToStorage(STORAGE_KEYS.TRANSACTIONS, transactions),
  load: () => loadFromStorage(STORAGE_KEYS.TRANSACTIONS, []),
  add: (transaction) => {
    const transactions = TransactionsStorage.load();
    const newTransaction = { ...transaction, id: Date.now(), created_at: new Date().toISOString() };
    transactions.unshift(newTransaction);
    TransactionsStorage.save(transactions);
    return newTransaction;
  }
};

export const ExpensesStorage = {
  save: (expenses) => saveToStorage(STORAGE_KEYS.EXPENSES, expenses),
  load: () => loadFromStorage(STORAGE_KEYS.EXPENSES, []),
  add: (expense) => {
    const expenses = ExpensesStorage.load();
    const newExpense = { ...expense, id: Date.now(), created_at: new Date().toISOString() };
    expenses.unshift(newExpense);
    ExpensesStorage.save(expenses);
    return newExpense;
  }
};

export const SummaryStorage = {
  save: (summary) => saveToStorage(STORAGE_KEYS.SUMMARY, summary),
  load: () => loadFromStorage(STORAGE_KEYS.SUMMARY, {
    today: { revenue: 0, transactions: 0, avgTransaction: 0 },
    total: { revenue: 0, transactions: 0 },
    growth: { revenue: 0, transactions: 0 },
    recent_transactions: []
  }),
  update: (updates) => {
    const summary = SummaryStorage.load();
    const updated = { ...summary, ...updates };
    SummaryStorage.save(updated);
    return updated;
  }
};

export const EmployeesStorage = {
  save: (employees) => saveToStorage(STORAGE_KEYS.EMPLOYEES, employees),
  load: () => loadFromStorage(STORAGE_KEYS.EMPLOYEES, []),
  add: (employee) => {
    const employees = EmployeesStorage.load();
    const newEmployee = { ...employee, id: Date.now() };
    employees.push(newEmployee);
    EmployeesStorage.save(employees);
    return newEmployee;
  },
  update: (id, updates) => {
    const employees = EmployeesStorage.load();
    const index = employees.findIndex(emp => emp.id === id);
    if (index !== -1) {
      employees[index] = { ...employees[index], ...updates };
      EmployeesStorage.save(employees);
      return employees[index];
    }
    return null;
  },
  delete: (id) => {
    const employees = EmployeesStorage.load();
    const filtered = employees.filter(emp => emp.id !== id);
    EmployeesStorage.save(filtered);
    return filtered;
  }
};

export const SettingsStorage = {
  save: (settings) => saveToStorage(STORAGE_KEYS.SETTINGS, settings),
  load: () => loadFromStorage(STORAGE_KEYS.SETTINGS, {
    theme: 'dark',
    businessName: '',
    businessLogo: '',
    currency: 'KES',
    notifications: true
  }),
  update: (updates) => {
    const settings = SettingsStorage.load();
    const updated = { ...settings, ...updates };
    SettingsStorage.save(updated);
    return updated;
  }
};

// Backup and restore
export const BackupStorage = {
  exportAll: () => {
    const backup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      data: {
        inventory: InventoryStorage.load(),
        sales: SalesStorage.load(),
        transactions: TransactionsStorage.load(),
        expenses: ExpensesStorage.load(),
        employees: EmployeesStorage.load(),
        summary: SummaryStorage.load(),
        settings: SettingsStorage.load()
      }
    };
    return backup;
  },
  
  importAll: (backup) => {
    try {
      if (!backup.data) throw new Error('Invalid backup format');
      
      if (backup.data.inventory) InventoryStorage.save(backup.data.inventory);
      if (backup.data.sales) SalesStorage.save(backup.data.sales);
      if (backup.data.transactions) TransactionsStorage.save(backup.data.transactions);
      if (backup.data.expenses) ExpensesStorage.save(backup.data.expenses);
      if (backup.data.employees) EmployeesStorage.save(backup.data.employees);
      if (backup.data.summary) SummaryStorage.save(backup.data.summary);
      if (backup.data.settings) SettingsStorage.save(backup.data.settings);
      
      return { success: true };
    } catch (error) {
      console.error('Error importing backup:', error);
      return { success: false, error: error.message };
    }
  }
};

export default {
  STORAGE_KEYS,
  InventoryStorage,
  SalesStorage,
  TransactionsStorage,
  ExpensesStorage,
  SummaryStorage,
  EmployeesStorage,
  SettingsStorage,
  BackupStorage,
  clearAllStorage
};
