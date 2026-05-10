import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CustomerApiService } from '../../../services/customer-api.service';
import { OrderDto } from '../../../models';

@Component({
  selector: 'app-customer-orders',
  standalone: false,
  templateUrl: './customer-orders.component.html'
})
export class CustomerOrdersComponent implements OnInit {
  private readonly api = inject(CustomerApiService);
  private readonly destroyRef = inject(DestroyRef);

  orders = signal<OrderDto[]>([]);
  loading = signal(false);
  message = signal('');

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.api.getOrders()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: orders => { this.orders.set(orders); this.loading.set(false); },
        error: () => this.loading.set(false)
      });
  }

  cancelOrder(orderId: string): void {
    this.api.cancelOrder(orderId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => { this.message.set('Order cancelled'); this.loadOrders(); },
        error: () => this.message.set('Failed to cancel order')
      });
  }
}
