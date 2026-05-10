import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { CustomerApiService } from '../../../services/customer-api.service';
import { CartDto, AddressDto } from '../../../models';

@Component({
  selector: 'app-customer-cart',
  standalone: false,
  templateUrl: './customer-cart.component.html'
})
export class CustomerCartComponent implements OnInit {
  private readonly api = inject(CustomerApiService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  cart = signal<CartDto | null>(null);
  addresses = signal<AddressDto[]>([]);
  loading = signal(false);
  message = signal('');

  ngOnInit(): void {
    this.loadDetails();
  }

  loadDetails(): void {
    this.loading.set(true);
    this.api.getCustomerDetails()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: details => {
          this.cart.set(details?.cart ?? null);
          this.addresses.set(details?.addresses ?? []);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }

  removeItem(productId: string): void {
    this.api.removeCartItem(productId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadDetails());
  }

  goToCheckout(): void {
    this.router.navigate(['/customer/checkout']);
  }
}
