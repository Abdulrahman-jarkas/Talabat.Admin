import { Injectable, Signal, computed, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private readonly auth = inject(AuthService);

  /** Permissions from the active account, read directly from session claims. */
  public permissions: Signal<string[]> = this.auth.permissions;

  /** Returns true if the user has the given permission. */
  public has = (permission: string): boolean =>
    this.permissions().includes(permission);

  /** Returns a computed signal for a specific permission. */
  public hasSignal(permission: string): Signal<boolean> {
    return computed(() => this.permissions().includes(permission));
  }

  /** Returns a computed signal that checks multiple permissions (all required). */
  public hasAllSignal(...permissions: string[]): Signal<boolean> {
    return computed(() => permissions.every(p => this.permissions().includes(p)));
  }

  /** Returns a computed signal that checks multiple permissions (any required). */
  public hasAnySignal(...permissions: string[]): Signal<boolean> {
    return computed(() => permissions.some(p => this.permissions().includes(p)));
  }

  /** Returns the permissions as an observable (for guards). */
  public loadPermissions(): Observable<string[]> {
    return of(this.permissions());
  }
}
