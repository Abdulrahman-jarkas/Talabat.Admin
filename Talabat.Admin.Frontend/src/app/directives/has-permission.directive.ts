import { Directive, Input, TemplateRef, ViewContainerRef, inject, effect } from '@angular/core';
import { PermissionService } from '../services/permission.service';

/**
 * Structural directive that shows/hides elements based on user permissions.
 *
 * Usage:
 *   <button *hasPermission="'accounts.add'">Add Account</button>
 *   <div *hasPermission="['accounts.view', 'accounts.update']">...</div>
 */
@Directive({
  selector: '[hasPermission]',
  standalone: false
})
export class HasPermissionDirective {
  private readonly templateRef = inject(TemplateRef<any>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly permService = inject(PermissionService);

  private requiredPermissions: string[] = [];
  private isRendered = false;

  @Input()
  set hasPermission(value: string | string[]) {
    this.requiredPermissions = Array.isArray(value) ? value : [value];
    this.update();
  }

  constructor() {
    effect(() => {
      // Read the signal so the effect re-runs when permissions change.
      this.permService.permissions();
      this.update();
    });
  }

  private update() {
    const perms = this.permService.permissions();
    const hasAll = this.requiredPermissions.length > 0
      && this.requiredPermissions.every(p => perms.includes(p));

    if (hasAll && !this.isRendered) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.isRendered = true;
    } else if (!hasAll && this.isRendered) {
      this.viewContainer.clear();
      this.isRendered = false;
    }
  }
}
