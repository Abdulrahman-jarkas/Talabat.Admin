import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { TenantType } from '../../constants/tenant-type';

@Component({
  selector: 'app-nav-menu',
  standalone: false,
  templateUrl: './nav-menu.component.html',
  styleUrl: './nav-menu.component.css'
})
export class NavMenuComponent {
  private auth = inject(AuthService);

  public username = this.auth.username;
  public authenticated = this.auth.isAuthenticated;
  public anonymous = this.auth.isAnonymous;
  public logoutUrl = this.auth.logoutUrl;
  public tenantType = this.auth.accountTenantType;

  public isAdmin = computed(() => this.tenantType() === TenantType.System);
  public isShop = computed(() => this.tenantType() === TenantType.Shop);
  public isCustomer = computed(() => this.tenantType() === TenantType.Customer);

  isExpanded = false;

  collapse() {
    this.isExpanded = false;
  }

  toggle() {
    this.isExpanded = !this.isExpanded;
  }
}
