import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiResponse, isOk } from '../models/api-response';
import { ApiPrefixes } from '../constants/api';
import {
  AccountDto, AdminCreateAccountRequest, UpdateAccountRequest,
  RoleDto, AdminCreateRoleRequest, UpdateRoleRequest,
  ShopDto, CreateShopRequest, UpdateShopRequest,
  ProductDto, AdminCreateProductRequest, UpdateProductRequest,
  OrderDto, OrderDetailDto
} from '../models/dtos';

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly base = ApiPrefixes.admin;

  // ── Accounts ──

  getAccounts(tenantType?: string, tenantId?: string): Observable<AccountDto[]> {
    const params: Record<string, string> = {};
    if (tenantType) params['TenantType'] = tenantType;
    if (tenantId) params['TenantId'] = tenantId;
    return this.http.get<ApiResponse<AccountDto[]>>(`${this.base}/accounts`, { params })
      .pipe(map(r => isOk(r) ? r.data : []));
  }

  createAccount(req: AdminCreateAccountRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.base}/accounts`, req);
  }

  updateAccount(accountId: string, req: UpdateAccountRequest): Observable<ApiResponse<unknown>> {
    return this.http.put<ApiResponse<unknown>>(`${this.base}/accounts/${accountId}`, req);
  }

  deleteAccount(accountId: string, version: string): Observable<ApiResponse<unknown>> {
    return this.http.delete<ApiResponse<unknown>>(`${this.base}/accounts/${accountId}`, { body: { version } });
  }

  // ── Roles ──

  getRoles(tenantType?: string, tenantId?: string): Observable<RoleDto[]> {
    const params: Record<string, string> = {};
    if (tenantType) params['TenantType'] = tenantType;
    if (tenantId) params['TenantId'] = tenantId;
    return this.http.get<ApiResponse<RoleDto[]>>(`${this.base}/roles`, { params })
      .pipe(map(r => isOk(r) ? r.data : []));
  }

  createRole(req: AdminCreateRoleRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.base}/roles`, req);
  }

  updateRole(roleId: string, req: UpdateRoleRequest): Observable<ApiResponse<unknown>> {
    return this.http.put<ApiResponse<unknown>>(`${this.base}/roles/${roleId}`, req);
  }

  deleteRole(roleId: string, version: string): Observable<ApiResponse<unknown>> {
    return this.http.delete<ApiResponse<unknown>>(`${this.base}/roles/${roleId}`, { body: { version } });
  }

  // ── Shops ──

  getShops(): Observable<ShopDto[]> {
    return this.http.get<ApiResponse<ShopDto[]>>(`${this.base}/shops`)
      .pipe(map(r => isOk(r) ? r.data : []));
  }

  getShop(shopId: string): Observable<ShopDto | null> {
    return this.http.get<ApiResponse<ShopDto>>(`${this.base}/shops/${shopId}`)
      .pipe(map(r => isOk(r) ? r.data : null));
  }

  createShop(req: CreateShopRequest): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.base}/shops`, req);
  }

  updateShop(shopId: string, req: UpdateShopRequest): Observable<ApiResponse<unknown>> {
    return this.http.put<ApiResponse<unknown>>(`${this.base}/shops/${shopId}`, req);
  }

  deleteShop(shopId: string): Observable<ApiResponse<unknown>> {
    return this.http.delete<ApiResponse<unknown>>(`${this.base}/shops/${shopId}`);
  }

  // ── Products ──

  getProducts(shopId?: string): Observable<ProductDto[]> {
    const params: Record<string, string> = {};
    if (shopId) params['ShopId'] = shopId;
    return this.http.get<ApiResponse<ProductDto[]>>(`${this.base}/products`, { params })
      .pipe(map(r => isOk(r) ? r.data : []));
  }

  getProduct(productId: string): Observable<ProductDto | null> {
    return this.http.get<ApiResponse<ProductDto>>(`${this.base}/products/${productId}`)
      .pipe(map(r => isOk(r) ? r.data : null));
  }

  createProduct(req: AdminCreateProductRequest): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.base}/products`, req);
  }

  updateProduct(productId: string, req: UpdateProductRequest): Observable<ApiResponse<unknown>> {
    return this.http.put<ApiResponse<unknown>>(`${this.base}/products/${productId}`, req);
  }

  deleteProduct(productId: string): Observable<ApiResponse<unknown>> {
    return this.http.delete<ApiResponse<unknown>>(`${this.base}/products/${productId}`);
  }

  // ── Orders ──

  getOrders(shopId?: string, customerId?: string): Observable<OrderDto[]> {
    const params: Record<string, string> = {};
    if (shopId) params['ShopId'] = shopId;
    if (customerId) params['CustomerId'] = customerId;
    return this.http.get<ApiResponse<OrderDto[]>>(`${this.base}/orders`, { params })
      .pipe(map(r => isOk(r) ? r.data : []));
  }

  getOrder(orderId: string): Observable<OrderDetailDto | null> {
    return this.http.get<ApiResponse<OrderDetailDto>>(`${this.base}/orders/${orderId}`)
      .pipe(map(r => isOk(r) ? r.data : null));
  }

  cancelOrder(orderId: string): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.base}/orders/${orderId}/cancel`, {});
  }
}
