import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AccountService, AccountRequest } from '../services/account.service';
import { CustomerService } from '../services/customer.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-account-form',
  standalone: true,
  imports: [FormsModule, RouterModule],
  template: `
    <div class="max-w-2xl mx-auto">
      <div class="bg-white rounded-2xl shadow-lg p-8">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">Open Account</h1>

        @if (loadingProfile) {
          <div class="text-center py-6 text-gray-500">Loading...</div>
        } @else {
          @if (error) {
            <div class="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">{{ error }}</div>
          }

          <form (ngSubmit)="onSubmit()" #form="ngForm" class="space-y-5">
            @if (isStaff) {
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Customer ID</label>
                <input type="number" name="customerId" [(ngModel)]="data.customerId" required min="1"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  placeholder="Enter customer ID" />
              </div>
            } @else {
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                <input type="text"
                  [value]="customerName"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  disabled />
              </div>
            }

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
              <select name="accountType" [(ngModel)]="data.accountType" required
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white">
                <option value="" disabled>Select type</option>
                <option value="CHECKING">Checking</option>
                <option value="SAVINGS">Savings</option>
              </select>
            </div>

            <div class="flex gap-3">
              <button type="submit" [disabled]="form.invalid || loading"
                class="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium px-6 py-2.5 rounded-lg transition">
                {{ loading ? 'Opening...' : 'Open Account' }}
              </button>
              <a routerLink="/accounts"
                class="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-2.5 rounded-lg transition">
                Cancel
              </a>
            </div>
          </form>
        }
      </div>
    </div>
  `,
})
export class AccountFormComponent implements OnInit {
  data: AccountRequest = { customerId: 0, accountType: '' };
  error = '';
  loading = false;
  loadingProfile = false;
  isStaff = false;
  customerName = '';

  private readonly auth = inject(AuthService);

  constructor(
    private readonly service: AccountService,
    private readonly customerService: CustomerService,
    private readonly router: Router,
  ) {}

  ngOnInit() {
    this.isStaff = this.auth.role() === 'ADMIN' || this.auth.role() === 'EMPLOYEE';

    if (!this.isStaff) {
      this.loadingProfile = true;
      this.customerService.myProfile().subscribe({
        next: (c) => {
          this.data.customerId = c.id;
          this.customerName = c.fullName + ' (' + c.email + ')';
          this.loadingProfile = false;
        },
        error: () => {
          this.error = 'No customer profile found. Please contact staff to link your account.';
          this.loadingProfile = false;
        },
      });
    }
  }

  onSubmit() {
    this.error = '';
    this.loading = true;

    this.service.create(this.data).subscribe({
      next: (account) => this.router.navigate(['/accounts', account.id]),
      error: (err) => {
        this.error = err.error?.error || 'Failed to open account.';
        this.loading = false;
      },
    });
  }
}
