// ============================================
// Permissions Constants
// ============================================

// --- Accounts ---
export const ACCOUNTS_PERMISSIONS = {
  ADD_ACCOUNT: "accounts.add",
  UPDATE_ACCOUNT: "accounts.update",
  REMOVE_ACCOUNT: "accounts.remove",
  VIEW_ACCOUNTS: "accounts.view",
  ADD_ROLE: "accounts.roles.add",
  EDIT_ROLE: "accounts.roles.edit",
  REMOVE_ROLE: "accounts.roles.remove",
  VIEW_ROLES: "accounts.roles.view",
} as const;

// --- Products ---
export const PRODUCTS_PERMISSIONS = {
  CREATE: "products.create",
  READ: "products.read",
  UPDATE: "products.update",
  DELETE: "products.delete",
} as const;

// --- Shops ---
export const SHOPS_PERMISSIONS = {
  CREATE: "shops.create",
  READ: "shops.read",
  UPDATE: "shops.update",
  DELETE: "shops.delete",
  LIST: "shops.list",
} as const;

// --- Orders ---
export const ORDERS_PERMISSIONS = {
  CREATE: "orders.create",
  READ: "orders.read",
  UPDATE: "orders.update",
  CANCEL: "orders.cancel",
  SHIP: "orders.ship",
  DELIVER: "orders.deliver",
} as const;

// --- Checkout Sessions ---
export const CHECKOUT_PERMISSIONS = {
  CREATE: "checkout.create",
  READ: "checkout.read",
  CANCEL: "checkout.cancel",
  CHECKOUT: "checkout.checkout",
} as const;

// --- Analytics ---
export const ANALYTICS_PERMISSIONS = {
  READ: "analytics.read",
  EXPORT: "analytics.export",
} as const;

// ============================================
// System Permissions (Admin - full access)
// ============================================
export const SYSTEM_PERMISSIONS: string[] = [
  ...Object.values(ACCOUNTS_PERMISSIONS),
  ...Object.values(PRODUCTS_PERMISSIONS),
  ...Object.values(SHOPS_PERMISSIONS),
  ...Object.values(ORDERS_PERMISSIONS),
  ...Object.values(CHECKOUT_PERMISSIONS),
  ...Object.values(ANALYTICS_PERMISSIONS),
];

// ============================================
// Shop Permissions
// ============================================
export const SHOP_PERMISSIONS: string[] = [
  // Accounts
  ACCOUNTS_PERMISSIONS.VIEW_ACCOUNTS,
  ACCOUNTS_PERMISSIONS.VIEW_ROLES,
  // Products
  PRODUCTS_PERMISSIONS.CREATE,
  PRODUCTS_PERMISSIONS.READ,
  PRODUCTS_PERMISSIONS.UPDATE,
  PRODUCTS_PERMISSIONS.DELETE,
  // Shops
  SHOPS_PERMISSIONS.READ,
  SHOPS_PERMISSIONS.UPDATE,
  // Orders
  ORDERS_PERMISSIONS.READ,
  ORDERS_PERMISSIONS.UPDATE,
  ORDERS_PERMISSIONS.SHIP,
  ORDERS_PERMISSIONS.DELIVER,
  // Checkout
  CHECKOUT_PERMISSIONS.READ,
  // Analytics
  ANALYTICS_PERMISSIONS.READ,
  ANALYTICS_PERMISSIONS.EXPORT,
];

// ============================================
// Customer Permissions
// ============================================
export const CUSTOMER_PERMISSIONS: string[] = [
  // Products
  PRODUCTS_PERMISSIONS.READ,
  // Shops
  SHOPS_PERMISSIONS.READ,
  // Orders
  ORDERS_PERMISSIONS.CREATE,
  ORDERS_PERMISSIONS.READ,
  ORDERS_PERMISSIONS.CANCEL,
  // Checkout
  CHECKOUT_PERMISSIONS.CREATE,
  CHECKOUT_PERMISSIONS.READ,
  CHECKOUT_PERMISSIONS.CANCEL,
  CHECKOUT_PERMISSIONS.CHECKOUT,
];
