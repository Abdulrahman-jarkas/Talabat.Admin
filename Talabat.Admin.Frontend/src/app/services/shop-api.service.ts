import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiResponse, isOk } from '../models/api-response';
import { ApiPrefixes } from '../constants/api';
import {
  AccountDto, ShopCreateAccountRequest, UpdateAccountRequest,
  RoleDto, ShopCreateRoleRequest, UpdateRoleRequest,
  ShopDto, UpdateShopRequest,
  ProductDto, ShopCreateProductRequest, UpdateProductRequest,
  OrderDto, OrderDetailDto
} from '../models/dtos';

@Injectable({ providedIn: 'root' })
export class ShopApiService {
  private readonly http = inject(HttpClient);
  private readonly base = ApiPrefixes.shop;

  // ── Accounts ──

  getAccounts(): Observable<AccountDto[]> {
    return this.http.get<ApiResponse<AccountDto[]>>(`${this.base}/accounts`)
      .pipe(map(r => isOk(r) ? r.data : []));
  }

  createAccount(req: ShopCreateAccountRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.base}/accounts`, req);
  }

  updateAccount(accountId: string, req: UpdateAccountRequest): Observable<ApiResponse<unknown>> {
    return this.http.put<ApiResponse<unknown>>(`${this.base}/accounts/${accountId}`, req);
  }

  deleteAccount(accountId: string, version: string): Observable<ApiResponse<unknown>> {
    return this.http.delete<ApiResponse<unknown>>(`${this.base}/accounts/${accountId}`, { body: { version } });
  }

  // ── Roles ──

  getRoles(): Observable<RoleDto[]> {
    return this.http.get<ApiResponse<RoleDto[]>>(`${this.base}/roles`)
      .pipe(map(r => isOk(r) ? r.data : []));
  }

  createRole(req: ShopCreateRoleRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.base}/roles`, req);
  }

  updateRole(roleId: string, req: UpdateRoleRequest): Observable<ApiResponse<unknown>> {
    return this.http.put<ApiResponse<unknown>>(`${this.base}/roles/${roleId}`, req);
  }

  deleteRole(roleId: string, version: string): Observable<ApiResponse<unknown>> {
    return this.http.delete<ApiResponse<unknown>>(`${this.base}/roles/${roleId}`, { body: { version } });
  }

  // ── Shop (own) ──

  getMyShop(): Observable<ShopDto | null> {
    return this.http.get<ApiResponse<ShopDto>>(`${this.base}`)
      .pipe(map(r => isOk(r) ? r.data : null));
  }

  updateMyShop(req: UpdateShopRequest): Observable<ApiResponse<unknown>> {
    return this.http.put<ApiResponse<unknown>>(`${this.base}`, req);
  }

  // ── Products ──

  getProducts(): Observable<ProductDto[]> {
    return this.http.get<ApiResponse<ProductDto[]>>(`${this.base}/products`)
      .pipe(map(r => isOk(r) ? r.data : []));
  }

  getProduct(productId: string): Observable<ProductDto | null> {
    return this.http.get<ApiResponse<ProductDto>>(`${this.base}/products/${productId}`)
      .pipe(map(r => isOk(r) ? r.data : null));
  }

  createProduct(req: ShopCreateProductRequest): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.base}/products`, req);
  }

  updateProduct(productId: string, req: UpdateProductRequest): Observable<ApiResponse<unknown>> {
    return this.http.put<ApiResponse<unknown>>(`${this.base}/products/${productId}`, req);
  }

  deleteProduct(productId: string): Observable<ApiResponse<unknown>> {
    return this.http.delete<ApiResponse<unknown>>(`${this.base}/products/${productId}`);
  }

  // ── Orders ──

  getOrders(): Observable<OrderDto[]> {
    return this.http.get<ApiResponse<OrderDto[]>>(`${this.base}/orders`)
      .pipe(map(r => isOk(r) ? r.data : []));
  }

  getOrder(orderId: string): Observable<OrderDetailDto | null> {
    return this.http.get<ApiResponse<OrderDetailDto>>(`${this.base}/orders/${orderId}`)
      .pipe(map(r => isOk(r) ? r.data : null));
  }

  cancelOrder(orderId: string): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.base}/orders/${orderId}/cancel`, {});
  }

  shipOrder(orderId: string): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.base}/orders/${orderId}/ship`, {});
  }

  deliverOrder(orderId: string): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.base}/orders/${orderId}/deliver`, {});
  }
}
