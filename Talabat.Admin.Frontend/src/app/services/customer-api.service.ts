import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiResponse, isOk } from '../models/api-response';
import { ApiPrefixes } from '../constants/api';
import {
  ShopDto, ProductDto, OrderDto, OrderDetailDto,
  CustomerDetailsResponse, CheckoutSessionResponse, CheckoutRequest, CheckoutResponse
} from '../models/dtos';

@Injectable({ providedIn: 'root' })
export class CustomerApiService {
  private readonly http = inject(HttpClient);
  private readonly base = ApiPrefixes.customer;

  // ── Shops ──

  getShops(): Observable<ShopDto[]> {
    return this.http.get<ApiResponse<ShopDto[]>>(`${this.base}/shops`)
      .pipe(map(r => isOk(r) ? r.data : []));
  }

  getShop(shopId: string): Observable<ShopDto | null> {
    return this.http.get<ApiResponse<ShopDto>>(`${this.base}/shops/${shopId}`)
      .pipe(map(r => isOk(r) ? r.data : null));
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

  // ── Customer Details / Cart ──

  getCustomerDetails(): Observable<CustomerDetailsResponse | null> {
    return this.http.get<ApiResponse<CustomerDetailsResponse>>(`${this.base}/customer/details`)
      .pipe(map(r => isOk(r) ? r.data : null));
  }

  addCartItem(productId: string, quantity: number): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.base}/cart/items`, { productId, quantity });
  }

  removeCartItem(productId: string): Observable<ApiResponse<unknown>> {
    return this.http.delete<ApiResponse<unknown>>(`${this.base}/cart/items`, { body: { productId } });
  }

  // ── Addresses ──

  addAddress(address: string): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.base}/customer/addresses`, { address });
  }

  removeAddress(addressId: string): Observable<ApiResponse<unknown>> {
    return this.http.delete<ApiResponse<unknown>>(`${this.base}/customer/addresses/${addressId}`);
  }

  // ── Checkout ──

  getActiveCheckoutSession(): Observable<CheckoutSessionResponse | null> {
    return this.http.get<ApiResponse<CheckoutSessionResponse>>(`${this.base}/checkout-sessions/active`)
      .pipe(map(r => isOk(r) ? r.data : null));
  }

  createCheckoutSession(): Observable<CheckoutSessionResponse | null> {
    return this.http.post<ApiResponse<CheckoutSessionResponse>>(`${this.base}/checkout-sessions`, {})
      .pipe(map(r => isOk(r) ? r.data : null));
  }

  checkout(request: CheckoutRequest): Observable<CheckoutResponse | null> {
    return this.http.post<ApiResponse<CheckoutResponse>>(`${this.base}/checkout-sessions/checkout`, request)
      .pipe(map(r => isOk(r) ? r.data : null));
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
}
