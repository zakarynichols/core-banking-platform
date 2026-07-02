import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Customer {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerRequest {
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
}

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private http = inject(HttpClient);

  list() {
    return this.http.get<Customer[]>('/api/customers');
  }

  get(id: number) {
    return this.http.get<Customer>(`/api/customers/${id}`);
  }

  myProfile() {
    return this.http.get<Customer>('/api/customers/me');
  }

  create(data: CustomerRequest) {
    return this.http.post<Customer>('/api/customers', data);
  }

  update(id: number, data: CustomerRequest) {
    return this.http.put<Customer>(`/api/customers/${id}`, data);
  }

  updateStatus(id: number, status: string) {
    return this.http.patch<Customer>(`/api/customers/${id}/status`, { status });
  }

  linkUser(customerId: number, userId: number) {
    return this.http.put<Customer>(`/api/customers/${customerId}/link/${userId}`, {});
  }
}
