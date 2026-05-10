export const TenantType = {
  System: 'System',
  Shop: 'Shop',
  Customer: 'Customer',
} as const;

export type TenantType = (typeof TenantType)[keyof typeof TenantType];
