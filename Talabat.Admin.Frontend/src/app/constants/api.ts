const API_BASE = '/talabat-api';

export const ApiPrefixes = {
  admin: `${API_BASE}/admin`,
  shop: `${API_BASE}/shop`,
  customer: API_BASE,
} as const;
