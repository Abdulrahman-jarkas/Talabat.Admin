import { HttpClient } from '@angular/common/http';
import { Injectable, Signal, WritableSignal, computed, inject, signal } from '@angular/core';
import { catchError, of, tap } from 'rxjs';

const ANONYMOUS: Session = null;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);

  private _session: WritableSignal<Session> = signal(ANONYMOUS);
  public session: Signal<Session> = this._session.asReadonly();

  constructor() {
    this.refreshSession();
  }

  public refreshSession(): void {
    this.http.get<Session>('/bff/user').pipe(
      catchError(() => of(ANONYMOUS)),
      tap(session => console.log('Session refreshed:', session))
    ).subscribe(session => this._session.set(session));
  }

  // Derived signals using computed that automatically update.
  public isAuthenticated = computed(() => this.session() !== null);
  public isAnonymous = computed(() => this.session() === null);

  public username = computed(() => {
    const session = this.session();
    return session ? session.find(c => c.type === 'name')?.value || null : null;
  });

  public email = computed(() => {
    const session = this.session();
    return session ? session.find(c => c.type === 'email')?.value || null : null;
  });

  public logoutUrl = computed(() => {
    const session = this.session();
    return session ? session.find(c => c.type === 'bff:logout_url')?.value || null : null;
  });

  public sub = computed(() => {
    const session = this.session();
    return session ? session.find(c => c.type === 'sub')?.value || null : null;
  });

  public accountId = computed(() => {
    const session = this.session();
    return session ? session.find(c => c.type === 'account_id')?.value || null : null;
  });

  public accountVersion = computed(() => {
    const session = this.session();
    return session ? session.find(c => c.type === 'account_version')?.value || null : null;
  });

  public hasAccount = computed(() => this.accountId() !== null);

  public accountName = computed(() => {
    const session = this.session();
    return session ? session.find(c => c.type === 'account_name')?.value || null : null;
  });

  public accountTenantType = computed(() => {
    const session = this.session();
    return session ? session.find(c => c.type === 'account_tenant_type')?.value || null : null;
  });

  public accountTenantId = computed(() => {
    const session = this.session();
    return session ? session.find(c => c.type === 'account_tenant_id')?.value || null : null;
  });

  public permissions = computed(() => {
    const session = this.session();
    if (!session) return [];
    return session.filter(c => c.type === 'permission').map(c => c.value);
  });

  public roles = computed(() => {
    const session = this.session();
    if (!session) return [];
    return session.filter(c => c.type === 'role').map(c => c.value);
  });

  }

  export interface Claim {
  type: string;
  value: string;
}

export type Session = Claim[] | null;
