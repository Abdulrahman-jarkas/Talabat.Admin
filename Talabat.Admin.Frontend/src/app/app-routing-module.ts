import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyAccountComponent } from './components/my-account/my-account.component';
import { AccountsManagementComponent } from './components/accounts-management/accounts-management.component';
import { RolesManagementComponent } from './components/roles-management/roles-management.component';
import { ShopsManagementComponent } from './components/shops-management/shops-management.component';
import { ProductsManagementComponent } from './components/products-management/products-management.component';
import { OrdersManagementComponent } from './components/orders-management/orders-management.component';
import { CustomerShopsComponent } from './components/customer/customer-shops/customer-shops.component';
import { CustomerCartComponent } from './components/customer/customer-cart/customer-cart.component';
import { CheckoutComponent } from './components/customer/checkout/checkout.component';
import { CustomerOrdersComponent } from './components/customer/customer-orders/customer-orders.component';
import { CustomerProfileComponent } from './components/customer/customer-profile/customer-profile.component';
import { LoginComponent } from './components/login/login.component';
import { authGuard } from './guards/auth.guard';
import { permissionGuard } from './guards/permission.guard';
import { tenantGuard } from './guards/tenant.guard';
import { TenantType } from './constants/tenant-type';
import { ACCOUNTS_PERMISSIONS, SHOPS_PERMISSIONS, PRODUCTS_PERMISSIONS, ORDERS_PERMISSIONS } from './constants/permissions';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'my-account', component: MyAccountComponent, canActivate: [authGuard] },

  // Admin area
  {
    path: 'admin',
    canActivate: [authGuard, tenantGuard(TenantType.System)],
    children: [
      { path: '', redirectTo: 'accounts', pathMatch: 'full' },
      { path: 'accounts', component: AccountsManagementComponent, canActivate: [permissionGuard(ACCOUNTS_PERMISSIONS.VIEW_ACCOUNTS)], data: { tenantContext: TenantType.System } },
      { path: 'roles', component: RolesManagementComponent, canActivate: [permissionGuard(ACCOUNTS_PERMISSIONS.VIEW_ROLES)], data: { tenantContext: TenantType.System } },
      { path: 'shops', component: ShopsManagementComponent, canActivate: [permissionGuard(SHOPS_PERMISSIONS.LIST)] },
      { path: 'products', component: ProductsManagementComponent, canActivate: [permissionGuard(PRODUCTS_PERMISSIONS.READ)], data: { tenantContext: TenantType.System } },
      { path: 'orders', component: OrdersManagementComponent, canActivate: [permissionGuard(ORDERS_PERMISSIONS.READ)], data: { tenantContext: TenantType.System } },
    ]
  },

  // Shop area
  {
    path: 'shop',
    canActivate: [authGuard, tenantGuard(TenantType.Shop)],
    children: [
      { path: '', redirectTo: 'products', pathMatch: 'full' },
      { path: 'accounts', component: AccountsManagementComponent, canActivate: [permissionGuard(ACCOUNTS_PERMISSIONS.VIEW_ACCOUNTS)], data: { tenantContext: TenantType.Shop } },
      { path: 'roles', component: RolesManagementComponent, canActivate: [permissionGuard(ACCOUNTS_PERMISSIONS.VIEW_ROLES)], data: { tenantContext: TenantType.Shop } },
      { path: 'products', component: ProductsManagementComponent, canActivate: [permissionGuard(PRODUCTS_PERMISSIONS.READ)], data: { tenantContext: TenantType.Shop } },
      { path: 'orders', component: OrdersManagementComponent, canActivate: [permissionGuard(ORDERS_PERMISSIONS.READ)], data: { tenantContext: TenantType.Shop } },
    ]
  },

  // Customer area
  {
    path: 'customer',
    canActivate: [authGuard, tenantGuard(TenantType.Customer)],
    children: [
      { path: '', redirectTo: 'shops', pathMatch: 'full' },
      { path: 'shops', component: CustomerShopsComponent },
      { path: 'cart', component: CustomerCartComponent },
      { path: 'checkout', component: CheckoutComponent },
      { path: 'orders', component: CustomerOrdersComponent },
      { path: 'profile', component: CustomerProfileComponent },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
