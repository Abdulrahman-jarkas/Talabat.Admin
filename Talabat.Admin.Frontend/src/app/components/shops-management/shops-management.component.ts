import { ChangeDetectorRef, Component, inject, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminApiService } from '../../services/admin-api.service';
import { ShopDto, CreateShopRequest, UpdateShopRequest } from '../../models/dtos';

@Component({
  selector: 'app-shops-management',
  standalone: false,
  templateUrl: './shops-management.component.html'
})
export class ShopsManagementComponent implements OnInit {
  private readonly adminApi = inject(AdminApiService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  shops: ShopDto[] = [];
  loading = false;
  error: string | null = null;
  successMsg: string | null = null;

  showForm = false;
  editingShopId: string | null = null;
  formName = '';
  formDescription = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.adminApi.getShops()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => { this.shops = data; this.loading = false; this.cdr.detectChanges(); },
        error: () => { this.error = 'Failed to load shops'; this.loading = false; this.cdr.detectChanges(); }
      });
  }

  openCreate(): void {
    this.editingShopId = null;
    this.formName = '';
    this.formDescription = '';
    this.showForm = true;
    this.clearMessages();
  }

  openEdit(shop: ShopDto): void {
    this.editingShopId = shop.id;
    this.formName = shop.name;
    this.formDescription = shop.description || '';
    this.showForm = true;
    this.clearMessages();
  }

  cancelForm(): void {
    this.showForm = false;
  }

  save(): void {
    this.clearMessages();
    if (this.editingShopId) {
      const req: UpdateShopRequest = { name: this.formName, description: this.formDescription };
      this.adminApi.updateShop(this.editingShopId, req)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: r => { if (isOk(r)) { this.successMsg = 'Shop updated'; this.showForm = false; this.load(); } else this.error = r.errors?.join(', ') || 'Update failed'; this.cdr.detectChanges(); },
          error: (e: any) => { this.error = e.error?.errors?.join(', ') || 'Update failed'; this.cdr.detectChanges(); }
        });
    } else {
      const req: CreateShopRequest = { name: this.formName, description: this.formDescription };
      this.adminApi.createShop(req)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: r => { if (isOk(r)) { this.successMsg = 'Shop created'; this.showForm = false; this.load(); } else this.error = r.errors?.join(', ') || 'Create failed'; this.cdr.detectChanges(); },
          error: (e: any) => { this.error = e.error?.errors?.join(', ') || 'Create failed'; this.cdr.detectChanges(); }
        });
    }
  }

  deleteShop(shop: ShopDto): void {
    if (!confirm(`Delete shop "${shop.name}"?`)) return;
    this.clearMessages();
    this.adminApi.deleteShop(shop.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: r => { if (isOk(r)) { this.successMsg = 'Shop deleted'; this.load(); } else this.error = r.errors?.join(', ') || 'Delete failed'; this.cdr.detectChanges(); },
        error: (e: any) => { this.error = e.error?.errors?.join(', ') || 'Delete failed'; this.cdr.detectChanges(); }
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
