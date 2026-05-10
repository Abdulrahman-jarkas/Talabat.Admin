import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PermissionService } from '../services/permission.service';
import { map, take } from 'rxjs';

/**
 * Factory that creates a route guard requiring specific permissions.
 * Usage in routes: canActivate: [permissionGuard('accounts.view')]
 */
export function permissionGuard(...requiredPermissions: string[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const permService = inject(PermissionService);
    const router = inject(Router);

    if (!auth.isAuthenticated()) {
      return router.createUrlTree(['/']);
    }

    return permService.loadPermissions().pipe(
      take(1),
      map(perms => {
        const hasAll = requiredPermissions.every(p => perms.includes(p));
        return hasAll ? true : router.createUrlTree(['/']);
      })
    );
  };
}
