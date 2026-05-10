import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { NavMenuComponent } from './components/nav-menu/nav-menu.component';
import { AccountsManagementComponent } from './components/accounts-management/accounts-management.component';
import { RolesManagementComponent } from './components/roles-management/roles-management.component';
import { MyAccountComponent } from './components/my-account/my-account.component';
import { ShopsManagementComponent } from './components/shops-management/shops-management.component';
import { ProductsManagementComponent } from './components/products-management/products-management.component';
import { OrdersManagementComponent } from './components/orders-management/orders-management.component';
import { CustomerShopsComponent } from './components/customer/customer-shops/customer-shops.component';
import { CustomerCartComponent } from './components/customer/customer-cart/customer-cart.component';
import { CheckoutComponent } from './components/customer/checkout/checkout.component';
import { CustomerOrdersComponent } from './components/customer/customer-orders/customer-orders.component';
import { CustomerProfileComponent } from './components/customer/customer-profile/customer-profile.component';
import { LoginComponent } from './components/login/login.component';
import { HasPermissionDirective } from './directives/has-permission.directive';
import { csrfHeaderInterceptor } from './interceptors/csrf-header.interceptor';

@NgModule({
  declarations: [
    App,
    NavMenuComponent,
    AccountsManagementComponent,
    RolesManagementComponent,
    MyAccountComponent,
    ShopsManagementComponent,
    ProductsManagementComponent,
    OrdersManagementComponent,
    CustomerShopsComponent,
    CustomerCartComponent,
    CheckoutComponent,
    CustomerOrdersComponent,
    CustomerProfileComponent,
    LoginComponent,
    HasPermissionDirective
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(
      withFetch(),
      withInterceptors([csrfHeaderInterceptor])
    ),
  ],
  bootstrap: [App]
})
export class AppModule { }
