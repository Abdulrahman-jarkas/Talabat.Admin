import { ChangeDetectorRef, Component, inject, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { AdminApiService } from '../../services/admin-api.service';
import { ShopApiService } from '../../services/shop-api.service';
import { TenantType } from '../../constants/tenant-type';
import { OrderDto, OrderDetailDto, ShopDto } from '../../models/dtos';

@Component({
  selector: 'app-orders-management',
  standalone: false,
  templateUrl: './orders-management.component.html'
})
export class OrdersManagementComponent implements OnInit {
  private readonly adminApi = inject(AdminApiService);
  private readonly shopApi = inject(ShopApiService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);

  tenantContext!: TenantType;

  orders: OrderDto[] = [];
  shops: ShopDto[] = [];
  loading = false;
  error: string | null = null;
  successMsg: string | null = null;

  filterShopId = '';
  selectedOrder: OrderDetailDto | null = null;

  get isAdmin(): boolean { return this.tenantContext === TenantType.System; }
  get isShop(): boolean { return this.tenantContext === TenantType.Shop; }

  ngOnInit(): void {
    this.tenantContext = this.route.snapshot.data['tenantContext'] as TenantType;
    this.load();
    if (this.isAdmin) {
      this.adminApi.getShops()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({ next: data => { this.shops = data; this.cdr.detectChanges(); } });
    }
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.selectedOrder = null;
    const shopId = this.isAdmin && this.filterShopId ? this.filterShopId : undefined;
    const obs = this.isAdmin ? this.adminApi.getOrders(shopId) : this.shopApi.getOrders();
    obs.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: data => { this.orders = data; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load orders'; this.loading = false; this.cdr.detectChanges(); }
    });
  }

  viewOrder(order: OrderDto): void {
    const obs = this.isAdmin ? this.adminApi.getOrder(order.orderId) : this.shopApi.getOrder(order.orderId);
    obs.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: data => { this.selectedOrder = data; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load order details'; this.cdr.detectChanges(); }
    });
  }

  closeDetail(): void {
    this.selectedOrder = null;
  }

  shipOrder(orderId: string): void {
    this.clearMessages();
    this.shopApi.shipOrder(orderId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: r => { if (isOk(r)) { this.successMsg = 'Order shipped'; this.load(); } else this.error = r.errors?.join(', ') || 'Ship failed'; this.cdr.detectChanges(); },
        error: (e: any) => { this.error = e.error?.errors?.join(', ') || 'Ship failed'; this.cdr.detectChanges(); }
      });
  }

  deliverOrder(orderId: string): void {
    this.clearMessages();
    this.shopApi.deliverOrder(orderId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: r => { if (isOk(r)) { this.successMsg = 'Order delivered'; this.load(); } else this.error = r.errors?.join(', ') || 'Deliver failed'; this.cdr.detectChanges(); },
        error: (e: any) => { this.error = e.error?.errors?.join(', ') || 'Deliver failed'; this.cdr.detectChanges(); }
      });
  }

  cancelOrder(orderId: string): void {
    if (!confirm('Cancel this order?')) return;
    this.clearMessages();
    const obs = this.isAdmin ? this.adminApi.cancelOrder(orderId) : this.shopApi.cancelOrder(orderId);
    obs.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: r => { if (isOk(r)) { this.successMsg = 'Order cancelled'; this.load(); } else this.error = r.errors?.join(', ') || 'Cancel failed'; this.cdr.detectChanges(); },
      error: (e: any) => { this.error = e.error?.errors?.join(', ') || 'Cancel failed'; this.cdr.detectChanges(); }
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Placed': return 'bg-warning text-dark';
      case 'Shipped': return 'bg-info text-dark';
      case 'Delivered': return 'bg-success';
      case 'Cancelled': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  private clearMessages(): void {
    this.error = null;
    this.successMsg = null;
  }
}

function isOk(r: { isSuccess?: boolean; success?: boolean }): boolean {
  return r.isSuccess === true || r.success === true;
}
