import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CustomerApiService } from '../../../services/customer-api.service';
import { ShopDto, ProductDto } from '../../../models';

@Component({
  selector: 'app-customer-shops',
  standalone: false,
  templateUrl: './customer-shops.component.html'
})
export class CustomerShopsComponent implements OnInit {
  private readonly api = inject(CustomerApiService);
  private readonly destroyRef = inject(DestroyRef);

  shops = signal<ShopDto[]>([]);
  selectedShop = signal<ShopDto | null>(null);
  products = signal<ProductDto[]>([]);
  loading = signal(false);
  message = signal('');

  ngOnInit(): void {
    this.loadShops();
  }

  loadShops(): void {
    this.loading.set(true);
    this.api.getShops()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: shops => { this.shops.set(shops); this.loading.set(false); },
        error: () => this.loading.set(false)
      });
  }

  selectShop(shop: ShopDto): void {
    this.selectedShop.set(shop);
    this.loading.set(true);
    this.api.getProducts(shop.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: products => { this.products.set(products); this.loading.set(false); },
        error: () => this.loading.set(false)
      });
  }

  addToCart(product: ProductDto): void {
    this.api.addCartItem(product.id, 1)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.message.set(`Added "${product.title}" to cart`),
        error: () => this.message.set('Failed to add to cart')
      });
    setTimeout(() => this.message.set(''), 3000);
  }

  backToShops(): void {
    this.selectedShop.set(null);
    this.products.set([]);
  }
}
