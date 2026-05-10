import { ChangeDetectorRef, Component, inject, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { AdminApiService } from '../../services/admin-api.service';
import { ShopApiService } from '../../services/shop-api.service';
import { TenantType } from '../../constants/tenant-type';
import { ProductDto, AdminCreateProductRequest, ShopCreateProductRequest, UpdateProductRequest, ShopDto } from '../../models/dtos';

@Component({
  selector: 'app-products-management',
  standalone: false,
  templateUrl: './products-management.component.html'
})
export class ProductsManagementComponent implements OnInit {
  private readonly adminApi = inject(AdminApiService);
  private readonly shopApi = inject(ShopApiService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);

  tenantContext!: TenantType;

  products: ProductDto[] = [];
  shops: ShopDto[] = [];
  loading = false;
  error: string | null = null;
  successMsg: string | null = null;

  filterShopId = '';

  showForm = false;
  editingProductId: string | null = null;
  formShopId = '';
  formTitle = '';
  formBasePrice = 0;
  formQuantity = 0;

  get isAdmin(): boolean { return this.tenantContext === TenantType.System; }

  ngOnInit(): void {
    this.tenantContext = this.route.snapshot.data['tenantContext'] as TenantType;
    this.load();
    if (this.isAdmin) {
      this.adminApi.getShops()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({ next: data => { this.shops = data; this.cdr.detectChanges(); } });
    }
  }

  load(): void {
    this.loading = true;
    this.error = null;
    const shopId = this.isAdmin && this.filterShopId ? this.filterShopId : undefined;
    const obs = this.isAdmin ? this.adminApi.getProducts(shopId) : this.shopApi.getProducts();
    obs.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: data => { this.products = data; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load products'; this.loading = false; this.cdr.detectChanges(); }
    });
  }

  openCreate(): void {
    this.editingProductId = null;
    this.formShopId = this.filterShopId || '';
    this.formTitle = '';
    this.formBasePrice = 0;
    this.formQuantity = 0;
    this.showForm = true;
    this.clearMessages();
  }

  openEdit(p: ProductDto): void {
    this.editingProductId = p.id;
    this.formShopId = p.shopId;
    this.formTitle = p.title;
    this.formBasePrice = p.basePrice;
    this.formQuantity = p.quantity;
    this.showForm = true;
    this.clearMessages();
  }

  cancelForm(): void {
    this.showForm = false;
  }

  save(): void {
    this.clearMessages();
    if (this.editingProductId) {
      const req: UpdateProductRequest = { title: this.formTitle, basePrice: this.formBasePrice, quantity: this.formQuantity };
      const obs = this.isAdmin
        ? this.adminApi.updateProduct(this.editingProductId, req)
        : this.shopApi.updateProduct(this.editingProductId, req);
      obs.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: r => { if (isOk(r)) { this.successMsg = 'Product updated'; this.showForm = false; this.load(); } else this.error = r.errors?.join(', ') || 'Update failed'; this.cdr.detectChanges(); },
        error: (e: any) => { this.error = e.error?.errors?.join(', ') || 'Update failed'; this.cdr.detectChanges(); }
      });
    } else {
      if (this.isAdmin) {
        const req: AdminCreateProductRequest = { shopId: this.formShopId, title: this.formTitle, basePrice: this.formBasePrice, quantity: this.formQuantity };
        this.adminApi.createProduct(req).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: r => { if (isOk(r)) { this.successMsg = 'Product created'; this.showForm = false; this.load(); } else this.error = r.errors?.join(', ') || 'Create failed'; this.cdr.detectChanges(); },
          error: (e: any) => { this.error = e.error?.errors?.join(', ') || 'Create failed'; this.cdr.detectChanges(); }
        });
      } else {
        const req: ShopCreateProductRequest = { title: this.formTitle, basePrice: this.formBasePrice, quantity: this.formQuantity };
        this.shopApi.createProduct(req).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: r => { if (isOk(r)) { this.successMsg = 'Product created'; this.showForm = false; this.load(); } else this.error = r.errors?.join(', ') || 'Create failed'; this.cdr.detectChanges(); },
          error: (e: any) => { this.error = e.error?.errors?.join(', ') || 'Create failed'; this.cdr.detectChanges(); }
        });
      }
    }
  }

  deleteProduct(p: ProductDto): void {
    if (!confirm(`Delete product "${p.title}"?`)) return;
    this.clearMessages();
    const obs = this.isAdmin
      ? this.adminApi.deleteProduct(p.id)
      : this.shopApi.deleteProduct(p.id);
    obs.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: r => { if (isOk(r)) { this.successMsg = 'Product deleted'; this.load(); } else this.error = r.errors?.join(', ') || 'Delete failed'; this.cdr.detectChanges(); },
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
