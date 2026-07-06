import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Account {
  id: number;
  accountNumber: string;
  customerId: number;
  primaryCustomerName: string;
  accountType: string;
  status: string;
  balance: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  holderIds: number[];
  holderNames: Record<number, string>;
}

export interface AccountRequest {
  customerId: number;
  accountType: string;
  additionalHolderIds?: number[];
}

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly http = inject(HttpClient);

  list() {
    return this.http.get<Account[]>('/api/accounts');
  }

  get(id: number) {
    return this.http.get<Account>(`/api/accounts/${id}`);
  }

  getBalance(id: number) {
    return this.http.get<{ accountNumber: string; balance: number; currency: string }>(
      `/api/accounts/${id}/balance`,
    );
  }

  create(data: AccountRequest) {
    return this.http.post<Account>('/api/accounts', data);
  }

  updateStatus(id: number, status: string) {
    return this.http.patch<Account>(`/api/accounts/${id}/status`, { status });
  }
}
