import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CustomerApiService } from '../../../services/customer-api.service';
import { AddressDto } from '../../../models';

@Component({
  selector: 'app-customer-profile',
  standalone: false,
  templateUrl: './customer-profile.component.html'
})
export class CustomerProfileComponent implements OnInit {
  private readonly api = inject(CustomerApiService);
  private readonly destroyRef = inject(DestroyRef);

  addresses = signal<AddressDto[]>([]);
  loading = signal(false);
  message = signal('');
  errorMsg = signal('');

  newAddress = signal('');

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading.set(true);
    this.api.getCustomerDetails()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: details => {
          this.addresses.set(details?.addresses ?? []);
          this.loading.set(false);
        },
        error: () => {
          this.errorMsg.set('Failed to load profile');
          this.loading.set(false);
        }
      });
  }

  addAddress(): void {
    const address = this.newAddress().trim();
    if (!address) return;
    this.clearMessages();
    this.api.addAddress(address)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.message.set('Address added');
          this.newAddress.set('');
          this.loadProfile();
        },
        error: () => this.errorMsg.set('Failed to add address')
      });
  }

  removeAddress(addressId: string): void {
    this.clearMessages();
    this.api.removeAddress(addressId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.message.set('Address removed');
          this.loadProfile();
        },
        error: () => this.errorMsg.set('Failed to remove address')
      });
  }

  private clearMessages(): void {
    this.message.set('');
    this.errorMsg.set('');
  }
}
