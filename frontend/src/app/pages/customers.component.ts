import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CustomerService, Customer } from '../services/customer.service';
import { AuthService } from '../services/auth.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [RouterModule, DatePipe],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-800">Customers</h1>
        @if (isStaff) {
          <a routerLink="/customers/new"
            class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
            + New Customer
          </a>
        }
      </div>

      <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
        @if (loading) {
          <div class="text-center py-12 text-gray-500">Loading...</div>
        } @else if (customers.length === 0) {
          <div class="text-center py-12 text-gray-500">No customers yet.</div>
        } @else {
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
                <th class="text-left px-6 py-3">Name</th>
                <th class="text-left px-6 py-3">Email</th>
                <th class="text-left px-6 py-3">Phone</th>
                <th class="text-left px-6 py-3">Status</th>
                <th class="text-left px-6 py-3">Created</th>
                <th class="text-right px-6 py-3"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @for (c of customers; track c.id) {
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 font-medium text-gray-800">{{ c.fullName }}</td>
                  <td class="px-6 py-4 text-gray-600">{{ c.email }}</td>
                  <td class="px-6 py-4 text-gray-600">{{ c.phone || '—' }}</td>
                  <td class="px-6 py-4">
                    <span class="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                      [class.bg-green-100]="c.status === 'ACTIVE'"
                      [class.text-green-700]="c.status === 'ACTIVE'"
                      [class.bg-yellow-100]="c.status === 'SUSPENDED'"
                      [class.text-yellow-700]="c.status === 'SUSPENDED'"
                      [class.bg-red-100]="c.status === 'CLOSED'"
                      [class.text-red-700]="c.status === 'CLOSED'">
                      {{ c.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-gray-500">{{ c.createdAt | date:'mediumDate' }}</td>
                  <td class="px-6 py-4 text-right">
                    <a [routerLink]="['/customers', c.id]"
                      class="text-indigo-600 hover:text-indigo-800 font-medium text-sm">
                      View
                    </a>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </div>
  `,
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  loading = true;
  isStaff = false;
  auth = inject(AuthService);

  constructor(private readonly service: CustomerService) {}

  ngOnInit() {
    this.isStaff = this.auth.role() === 'ADMIN' || this.auth.role() === 'EMPLOYEE';
    this.service.list().subscribe({
      next: (res) => { this.customers = res; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }
}
