export interface AccountDto {
  id: string;
  userId: string;
  name: string;
  email: string;
  tenantId: string | null;
  tenantType: string;
  version: string;
  assignments: AssignmentDto[];
}

export interface AssignmentDto {
  roleId: string;
  roleName: string | null;
  assignedBy: string;
  assignedAt: string;
}

export interface AdminCreateAccountRequest {
  userId: string;
  tenantType: string;
  tenantId?: string;
  roleIds: string[];
}

export interface ShopCreateAccountRequest {
  userId: string;
  roleIds: string[];
}

export interface UpdateAccountRequest {
  roleIds: string[];
  version: string;
}

export interface RoleDto {
  id: string;
  name: string;
  permissions: string[];
  tenantId: string | null;
  tenantType: string;
  createdBy: string;
  createdAt: string;
  modifiedBy: string | null;
  modifiedAt: string | null;
  version: string;
}

export interface AdminCreateRoleRequest {
  name: string;
  permissions: string[];
  tenantType: string;
  tenantId?: string;
}

export interface ShopCreateRoleRequest {
  name: string;
  permissions: string[];
}

export interface UpdateRoleRequest {
  name: string;
  permissions: string[];
  version: string;
}

export interface ShopDto {
  id: string;
  name: string;
  description: string;
}

export interface CreateShopRequest {
  name: string;
  description?: string;
}

export interface UpdateShopRequest {
  name: string;
  description?: string;
}

export interface ProductDto {
  id: string;
  title: string;
  shopId: string;
  basePrice: number;
  quantity: number;
}

export interface AdminCreateProductRequest {
  shopId: string;
  title: string;
  basePrice: number;
  quantity: number;
}

export interface ShopCreateProductRequest {
  title: string;
  basePrice: number;
  quantity: number;
}

export interface UpdateProductRequest {
  title: string;
  basePrice: number;
  quantity: number;
}

export interface OrderDto {
  orderId: string;
  customerId: string;
  shopId: string;
  status: string;
  paymentStatus: string;
}

export interface OrderDetailDto {
  orderId: string;
  customerId: string;
  shopId: string;
  checkoutSessionId: string;
  addressId: string;
  status: string;
  paymentStatus: string;
  paymentId: string;
  items: OrderItemDto[];
}

export interface OrderItemDto {
  productId: string;
  quantity: number;
}

export interface CartDto {
  shopId: string;
  items: CartItemDto[];
}

export interface CartItemDto {
  productId: string;
  quantity: number;
}

export interface AddressDto {
  id: string;
  address: string;
}

export interface CustomerDetailsResponse {
  cart: CartDto | null;
  addresses: AddressDto[];
}

export interface CheckoutSessionItemDto {
  productId: string;
  quantity: number;
  price: number;
}

export interface CheckoutSessionResponse {
  id: string;
  customerId: string;
  shopId: string;
  addressId: string;
  items: CheckoutSessionItemDto[];
  totalPrice: number;
}

export interface CheckoutRequest {
  addressId: string;
}

export interface CheckoutResponse {
  paymentId: string;
  paymentUrl: string;
}
