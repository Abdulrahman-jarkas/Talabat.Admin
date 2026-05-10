import { ChangeDetectorRef, Component, inject, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AccountSwitchService, MyAccountDto } from '../../services/account-switch.service';
import { TenantType } from '../../constants/tenant-type';

@Component({
  selector: 'app-my-account',
  standalone: false,
  templateUrl: './my-account.component.html'
})
export class MyAccountComponent implements OnInit {
  private readonly switchService = inject(AccountSwitchService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  accounts: MyAccountDto[] = [];
  loading = false;
  switchingId: string | null = null;
  error: string | null = null;
  successMsg: string | null = null;

  currentAccountId = this.auth.accountId;

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.loading = true;
    this.error = null;
    this.switchService.getMyAccounts()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => { this.accounts = data; this.loading = false; this.cdr.detectChanges(); },
        error: () => { this.error = 'Failed to load accounts'; this.loading = false; this.cdr.detectChanges(); }
      });
  }

  switchAccount(account: MyAccountDto): void {
    if (account.id === this.currentAccountId()) return;
    this.switchingId = account.id;
    this.error = null;
    this.successMsg = null;

    this.switchService.switchAccount(account.id, account.version)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.successMsg = `Switched to "${account.name}"`;
          this.switchingId = null;
          this.auth.refreshSession();
          this.cdr.detectChanges();
          // Navigate to the correct tenant area after switch
          this.navigateToTenantHome(account.tenantType);
        },
        error: (e) => {
          this.error = e.error?.message || 'Failed to switch account';
          this.switchingId = null;
          this.cdr.detectChanges();
        }
      });
  }

  getTenantIcon(tenantType: string): string {
    switch (tenantType) {
      case TenantType.System: return '🛡️';
      case TenantType.Shop: return '🏪';
      case TenantType.Customer: return '👤';
      default: return '📋';
    }
  }

  isActive(account: MyAccountDto): boolean {
    return account.id === this.currentAccountId();
  }

  isSwitching(account: MyAccountDto): boolean {
    return this.switchingId === account.id;
  }

  private navigateToTenantHome(tenantType: string): void {
    switch (tenantType) {
      case TenantType.System:
        this.router.navigate(['/admin']);
        break;
      case TenantType.Shop:
        this.router.navigate(['/shop']);
        break;
      case TenantType.Customer:
        this.router.navigate(['/customer']);
        break;
    }
  }
}
