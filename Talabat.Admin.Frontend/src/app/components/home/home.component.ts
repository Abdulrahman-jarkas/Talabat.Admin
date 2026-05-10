import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  private auth = inject(AuthService);

  public authenticated = this.auth.isAuthenticated;
  public username = this.auth.username;
  public email = this.auth.email;
  public sub = this.auth.sub;
  public accountId = this.auth.accountId;
  public accountVersion = this.auth.accountVersion;
  public accountName = this.auth.accountName;
  public accountTenantType = this.auth.accountTenantType;
  public accountTenantId = this.auth.accountTenantId;
  public hasAccount = this.auth.hasAccount;
  public roles = this.auth.roles;
  public permissions = this.auth.permissions;
  public session = this.auth.session;
}
