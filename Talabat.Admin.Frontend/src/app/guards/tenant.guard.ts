import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TenantType } from '../constants/tenant-type';

/**
 * Factory that creates a route guard requiring a specific tenant type.
 * Usage: canActivate: [tenantGuard(TenantType.Customer)]
 * Pass multiple to allow any of them: tenantGuard(TenantType.System, TenantType.Shop)
 */
export function tenantGuard(...allowedTypes: TenantType[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isAuthenticated()) {
      return router.createUrlTree(['/']);
    }

    const current = auth.accountTenantType();
    if (current && allowedTypes.includes(current as TenantType)) {
      return true;
    }

    return router.createUrlTree(['/']);
  };
}
