import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiResponse, isOk } from '../models/api-response';

export interface MyAccountDto {
  id: string;
  name: string;
  tenantType: string;
  tenantId: string | null;
  version: string;
  roles: { roleId: string; roleName: string | null; permissions: string[] }[];
}

@Injectable({ providedIn: 'root' })
export class AccountSwitchService {
  private readonly http = inject(HttpClient);

  getMyAccounts(): Observable<MyAccountDto[]> {
    return this.http.get<ApiResponse<MyAccountDto[]>>('/talabat-api/accounts/me')
      .pipe(map(r => isOk(r) ? r.data ?? [] : []));
  }

  switchAccount(accountId: string, accountVersion: string): Observable<unknown> {
    return this.http.post('/bff/switch-account', { accountId, accountVersion });
  }
}
