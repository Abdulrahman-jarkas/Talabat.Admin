import { ChangeDetectorRef, Component, inject, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { AdminApiService } from '../../services/admin-api.service';
import { ShopApiService } from '../../services/shop-api.service';
import { TenantType } from '../../constants/tenant-type';
import {
  AccountDto, RoleDto, AdminCreateAccountRequest, ShopCreateAccountRequest, UpdateAccountRequest, ShopDto
} from '../../models/dtos';

@Component({
  selector: 'app-accounts-management',
  standalone: false,
  templateUrl: './accounts-management.component.html'
})
export class AccountsManagementComponent implements OnInit {
  private readonly adminApi = inject(AdminApiService);
  private readonly shopApi = inject(ShopApiService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);

  tenantContext!: TenantType;

  accounts: AccountDto[] = [];
  roles: RoleDto[] = [];
  shops: ShopDto[] = [];
  loading = false;
  error: string | null = null;
  successMsg: string | null = null;

  showForm = false;
  editingAccountId: string | null = null;
  formName = '';
  formUserId = '';
  formTenantType: TenantType = TenantType.System;
  formTenantId = '';
  formRoleIds: string[] = [];
  formVersion = '';

  get isAdmin(): boolean { return this.tenantContext === TenantType.System; }

  get editingShopName(): string {
    return this.shops.find(s => s.id === this.formTenantId)?.name ?? this.formTenantId;
  }

  ngOnInit(): void {
    this.tenantContext = this.route.snapshot.data['tenantContext'] as TenantType;
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    const obs = this.isAdmin ? this.adminApi.getAccounts() : this.shopApi.getAccounts();
    obs.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: data => { this.accounts = data; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load accounts'; this.loading = false; this.cdr.detectChanges(); }
    });
  }

  onTenantTypeChange(): void {
    this.formTenantId = '';
    this.formRoleIds = [];
    this.roles = [];
    if (this.formTenantType === TenantType.Shop) {
      this.loadShops();
    } else {
      this.loadRolesForTenantType();
    }
  }

  onShopChange(): void {
    this.formRoleIds = [];
    this.loadRolesForTenantType();
  }

  loadShops(): void {
    this.adminApi.getShops()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => { this.shops = data; this.cdr.detectChanges(); },
        error: () => { this.error = 'Failed to load shops'; this.cdr.detectChanges(); }
      });
  }

  loadRolesForTenantType(): void {
    const tenantId = this.formTenantType === TenantType.Shop && this.formTenantId ? this.formTenantId : undefined;
    const obs = this.isAdmin
      ? this.adminApi.getRoles(this.formTenantType, tenantId)
      : this.shopApi.getRoles();
    obs.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: data => { this.roles = data; this.cdr.detectChanges(); },
      error: () => { this.roles = []; this.cdr.detectChanges(); }
    });
  }

  openCreate(): void {
    this.editingAccountId = null;
    this.formName = '';
    this.formUserId = '';
    this.formTenantType = this.isAdmin ? TenantType.System : TenantType.Shop;
    this.formTenantId = '';
    this.formRoleIds = [];
    this.roles = [];
    this.showForm = true;
    this.clearMessages();
    this.loadRolesForTenantType();
  }

  openEdit(a: AccountDto): void {
    this.editingAccountId = a.id;
    this.formName = a.name;
    this.formVersion = a.version;
    this.formTenantType = a.tenantType as TenantType;
    this.formTenantId = a.tenantId || '';
    this.formRoleIds = a.assignments.map(r => r.roleId);
    this.showForm = true;
    this.clearMessages();
    this.loadRolesForTenantType();
    if (a.tenantType === TenantType.Shop && this.isAdmin) {
      this.loadShops();
    }
  }

  cancelForm(): void {
    this.showForm = false;
  }

  toggleRole(roleId: string): void {
    const idx = this.formRoleIds.indexOf(roleId);
    if (idx >= 0) this.formRoleIds.splice(idx, 1);
    else this.formRoleIds.push(roleId);
  }

  save(): void {
    this.clearMessages();
    if (this.editingAccountId) {
      const req: UpdateAccountRequest = { roleIds: this.formRoleIds, version: this.formVersion };
      const obs = this.isAdmin
        ? this.adminApi.updateAccount(this.editingAccountId, req)
        : this.shopApi.updateAccount(this.editingAccountId, req);
      obs.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: r => { if (isOk(r)) { this.successMsg = 'Account updated'; this.showForm = false; this.load(); } else this.error = r.errors?.join(', ') || 'Update failed'; this.cdr.detectChanges(); },
        error: e => { this.error = e.error?.errors?.join(', ') || 'Update failed'; this.cdr.detectChanges(); }
      });
    } else {
      if (this.isAdmin) {
        const req: AdminCreateAccountRequest = {
          userId: this.formUserId,
          tenantType: this.formTenantType,
          tenantId: this.formTenantType === TenantType.Shop ? this.formTenantId : undefined,
          roleIds: this.formRoleIds
        };
        this.adminApi.createAccount(req).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: r => { if (isOk(r)) { this.successMsg = 'Account created'; this.showForm = false; this.load(); } else this.error = r.errors?.join(', ') || 'Create failed'; this.cdr.detectChanges(); },
          error: e => { this.error = e.error?.errors?.join(', ') || 'Create failed'; this.cdr.detectChanges(); }
        });
      } else {
        const req: ShopCreateAccountRequest = {
          userId: this.formUserId,
          roleIds: this.formRoleIds
        };
        this.shopApi.createAccount(req).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: r => { if (isOk(r)) { this.successMsg = 'Account created'; this.showForm = false; this.load(); } else this.error = r.errors?.join(', ') || 'Create failed'; this.cdr.detectChanges(); },
          error: e => { this.error = e.error?.errors?.join(', ') || 'Create failed'; this.cdr.detectChanges(); }
        });
      }
    }
  }

  deleteAccount(a: AccountDto): void {
    if (!confirm(`Delete account "${a.name}"?`)) return;
    this.clearMessages();
    const obs = this.isAdmin
      ? this.adminApi.deleteAccount(a.id, a.version)
      : this.shopApi.deleteAccount(a.id, a.version);
    obs.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: r => { if (isOk(r)) { this.successMsg = 'Account deleted'; this.load(); } else this.error = r.errors?.join(', ') || 'Delete failed'; this.cdr.detectChanges(); },
      error: e => { this.error = e.error?.errors?.join(', ') || 'Delete failed'; this.cdr.detectChanges(); }
    });
  }

  private clearMessages(): void {
    this.error = null;
    this.successMsg = null;
  }
}

function isOk(r: { isSuccess?: boolean; success?: boolean }): boolean {
  return r.isSuccess === true || r.success === true;
}
