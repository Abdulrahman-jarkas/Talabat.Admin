import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { CustomerApiService } from '../../../services/customer-api.service';
import { CheckoutSessionResponse, CheckoutResponse, AddressDto } from '../../../models';

@Component({
  selector: 'app-checkout',
  standalone: false,
  templateUrl: './checkout.component.html'
})
export class CheckoutComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly api = inject(CustomerApiService);
  private readonly destroyRef = inject(DestroyRef);

  session = signal<CheckoutSessionResponse | null>(null);
  addresses = signal<AddressDto[]>([]);
  selectedAddressId = signal('');
  loading = signal(false);
  checkingOut = signal(false);
  paymentResult = signal<CheckoutResponse | null>(null);
  error = signal('');

  ngOnInit(): void {
    this.loadActiveSession();
    this.loadAddresses();
  }

  private loadActiveSession(): void {
    this.loading.set(true);
    this.api.getActiveCheckoutSession()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (s) => {
          if (s) {
            this.session.set(s);
            this.loading.set(false);
          } else {
            this.createSession();
          }
        },
        error: () => this.createSession()
      });
  }

  private createSession(): void {
    this.api.createCheckoutSession()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (s) => {
          this.session.set(s);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Failed to create checkout session');
          this.loading.set(false);
        }
      });
  }

  private loadAddresses(): void {
    this.api.getCustomerDetails()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (details) => {
          this.addresses.set(details?.addresses ?? []);
        }
      });
  }

  checkout(): void {
    const session = this.session();
    if (!session || !this.selectedAddressId()) return;
    this.checkingOut.set(true);
    this.error.set('');
    this.api.checkout({ addressId: this.selectedAddressId() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.paymentResult.set(result);
          this.checkingOut.set(false);
        },
        error: () => {
          this.error.set('Checkout failed');
          this.checkingOut.set(false);
        }
      });
  }

  backToCart(): void {
    this.router.navigate(['/customer/cart']);
  }
}
