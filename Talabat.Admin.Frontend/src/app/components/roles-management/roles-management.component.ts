import { ChangeDetectorRef, Component, inject, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { AdminApiService } from '../../services/admin-api.service';
import { ShopApiService } from '../../services/shop-api.service';
import { TenantType } from '../../constants/tenant-type';
import { SYSTEM_PERMISSIONS, SHOP_PERMISSIONS } from '../../constants/permissions';
import { RoleDto, AdminCreateRoleRequest, ShopCreateRoleRequest, UpdateRoleRequest, ShopDto } from '../../models/dtos';

@Component({
  selector: 'app-roles-management',
  standalone: false,
  templateUrl: './roles-management.component.html'
})
export class RolesManagementComponent implements OnInit {
  private readonly adminApi = inject(AdminApiService);
  private readonly shopApi = inject(ShopApiService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);

  tenantContext!: TenantType;

  roles: RoleDto[] = [];
  shops: ShopDto[] = [];
  loading = false;
  error: string | null = null;
  successMsg: string | null = null;

  showForm = false;
  editingRoleId: string | null = null;
  formName = '';
  formTenantType: TenantType = TenantType.System;
  formTenantId = '';
  formPermissions: string[] = [];
  formVersion = '';

  get isAdmin(): boolean { return this.tenantContext === TenantType.System; }

  get editingShopName(): string {
    return this.shops.find(s => s.id === this.formTenantId)?.name ?? this.formTenantId;
  }

  get availablePermissions(): string[] {
    if (!this.isAdmin) return SHOP_PERMISSIONS;
    return this.formTenantType === TenantType.Shop ? SHOP_PERMISSIONS : SYSTEM_PERMISSIONS;
  }

  ngOnInit(): void {
    this.tenantContext = this.route.snapshot.data['tenantContext'] as TenantType;
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    const obs = this.isAdmin ? this.adminApi.getRoles() : this.shopApi.getRoles();
    obs.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: data => { this.roles = data; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load roles'; this.loading = false; this.cdr.detectChanges(); }
    });
  }

  onTenantTypeChange(): void {
    this.formPermissions = this.formPermissions.filter(p => this.availablePermissions.includes(p));
    this.formTenantId = '';
    if (this.formTenantType === TenantType.Shop) {
      this.loadShops();
    }
  }

  loadShops(): void {
    this.adminApi.getShops()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => { this.shops = data; this.cdr.detectChanges(); },
        error: () => { this.error = 'Failed to load shops'; this.cdr.detectChanges(); }
      });
  }

  openCreate(): void {
    this.editingRoleId = null;
    this.formName = '';
    this.formTenantType = this.isAdmin ? TenantType.System : TenantType.Shop;
    this.formTenantId = '';
    this.formPermissions = [];
    this.showForm = true;
    this.clearMessages();
  }

  openEdit(r: RoleDto): void {
    this.editingRoleId = r.id;
    this.formName = r.name;
    this.formVersion = r.version;
    this.formTenantType = r.tenantType as TenantType;
    this.formTenantId = r.tenantId || '';
    this.formPermissions = [...r.permissions];
    this.showForm = true;
    this.clearMessages();
    if (r.tenantType === TenantType.Shop && this.isAdmin) {
      this.loadShops();
    }
  }

  cancelForm(): void {
    this.showForm = false;
  }

  togglePermission(perm: string): void {
    const idx = this.formPermissions.indexOf(perm);
    if (idx >= 0) this.formPermissions.splice(idx, 1);
    else this.formPermissions.push(perm);
  }

  save(): void {
    this.clearMessages();
    if (this.editingRoleId) {
      const req: UpdateRoleRequest = { name: this.formName, permissions: this.formPermissions, version: this.formVersion };
      const obs = this.isAdmin
        ? this.adminApi.updateRole(this.editingRoleId, req)
        : this.shopApi.updateRole(this.editingRoleId, req);
      obs.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: r => { if (isOk(r)) { this.successMsg = 'Role updated'; this.showForm = false; this.load(); } else this.error = r.errors?.join(', ') || 'Update failed'; this.cdr.detectChanges(); },
        error: e => { this.error = e.error?.errors?.join(', ') || 'Update failed'; this.cdr.detectChanges(); }
      });
    } else {
      if (this.isAdmin) {
        const req: AdminCreateRoleRequest = {
          name: this.formName,
          permissions: this.formPermissions,
          tenantType: this.formTenantType,
          tenantId: this.formTenantType === TenantType.Shop ? this.formTenantId : undefined
        };
        this.adminApi.createRole(req).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: r => { if (isOk(r)) { this.successMsg = 'Role created'; this.showForm = false; this.load(); } else this.error = r.errors?.join(', ') || 'Create failed'; this.cdr.detectChanges(); },
          error: e => { this.error = e.error?.errors?.join(', ') || 'Create failed'; this.cdr.detectChanges(); }
        });
      } else {
        const req: ShopCreateRoleRequest = {
          name: this.formName,
          permissions: this.formPermissions
        };
        this.shopApi.createRole(req).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: r => { if (isOk(r)) { this.successMsg = 'Role created'; this.showForm = false; this.load(); } else this.error = r.errors?.join(', ') || 'Create failed'; this.cdr.detectChanges(); },
          error: e => { this.error = e.error?.errors?.join(', ') || 'Create failed'; this.cdr.detectChanges(); }
        });
      }
    }
  }

  deleteRole(r: RoleDto): void {
    if (!confirm(`Delete role "${r.name}"?`)) return;
    this.clearMessages();
    const obs = this.isAdmin
      ? this.adminApi.deleteRole(r.id, r.version)
      : this.shopApi.deleteRole(r.id, r.version);
    obs.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: res => { if (isOk(res)) { this.successMsg = 'Role deleted'; this.load(); } else this.error = res.errors?.join(', ') || 'Delete failed'; this.cdr.detectChanges(); },
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
