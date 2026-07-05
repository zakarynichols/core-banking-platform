import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CustomerService, Customer } from '../services/customer.service';
import { AuthService } from '../services/auth.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [RouterModule, DatePipe],
  template: `
    <div class="max-w-2xl mx-auto">
      @if (loading) {
        <div class="text-center py-12 text-gray-500">Loading...</div>
      } @else if (error) {
        <div class="bg-white rounded-2xl shadow-lg p-8 text-center">
          <p class="text-gray-600 mb-4">{{ error }}</p>
          @if (auth.role() === 'CUSTOMER') {
            <p class="text-sm text-gray-500">Ask a bank employee to create a customer profile and link it to your account.</p>
          }
        </div>
      } @else if (customer) {
        <div class="bg-white rounded-2xl shadow-lg p-8">
          <div class="flex items-center justify-between mb-6">
            <h1 class="text-2xl font-bold text-gray-800">{{ customer.fullName }}</h1>
            <span class="inline-block px-3 py-1 rounded-full text-sm font-medium"
              [class.bg-green-100]="customer.status === 'ACTIVE'"
              [class.text-green-700]="customer.status === 'ACTIVE'"
              [class.bg-yellow-100]="customer.status === 'SUSPENDED'"
              [class.text-yellow-700]="customer.status === 'SUSPENDED'"
              [class.bg-red-100]="customer.status === 'CLOSED'"
              [class.text-red-700]="customer.status === 'CLOSED'">
              {{ customer.status }}
            </span>
          </div>

          <div class="space-y-4">
            <div class="flex justify-between py-2 border-b">
              <span class="text-gray-500">Email</span>
              <span class="font-medium text-gray-800">{{ customer.email }}</span>
            </div>
            <div class="flex justify-between py-2 border-b">
              <span class="text-gray-500">Phone</span>
              <span class="font-medium text-gray-800">{{ customer.phone || '—' }}</span>
            </div>
            <div class="flex justify-between py-2 border-b">
              <span class="text-gray-500">Address</span>
              <span class="font-medium text-gray-800">{{ customer.address || '—' }}</span>
            </div>
            <div class="flex justify-between py-2 border-b">
              <span class="text-gray-500">Status</span>
              <span class="font-medium text-gray-800">{{ customer.status }}</span>
            </div>
            <div class="flex justify-between py-2">
              <span class="text-gray-500">Customer ID</span>
              <span class="font-medium text-gray-800">{{ customer.id }}</span>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class MyProfileComponent implements OnInit {
  customer?: Customer;
  loading = true;
  error = '';
  auth = inject(AuthService);

  constructor(private readonly service: CustomerService) {}

  ngOnInit() {
    this.service.myProfile().subscribe({
      next: (c) => { this.customer = c; this.loading = false; },
      error: () => {
        this.error = 'No customer profile linked to your account.';
        this.loading = false;
      },
    });
  }
}
