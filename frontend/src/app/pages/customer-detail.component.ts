import { Component, OnInit, inject } from '@angular/core';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { CustomerService, Customer } from '../services/customer.service';
import { AuthService } from '../services/auth.service';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [RouterModule, DatePipe, FormsModule],
  template: `
    <div class="max-w-2xl mx-auto">
      @if (customer) {
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
              <span class="text-gray-500">Created</span>
              <span class="font-medium text-gray-800">{{ customer.createdAt | date:'medium' }}</span>
            </div>
            <div class="flex justify-between py-2">
              <span class="text-gray-500">Updated</span>
              <span class="font-medium text-gray-800">{{ customer.updatedAt | date:'medium' }}</span>
            </div>
          </div>

          @if (isStaff) {
            <div class="mt-8 pt-6 border-t">
              <h2 class="text-lg font-semibold text-gray-800 mb-3">Change Status</h2>
              <div class="flex gap-2">
                <button (click)="changeStatus('ACTIVE')" [disabled]="customer.status === 'ACTIVE'"
                  class="px-4 py-2 rounded-lg text-sm font-medium transition"
                  [class.bg-green-100]="customer.status === 'ACTIVE'"
                  [class.text-green-700]="customer.status === 'ACTIVE'"
                  [class.bg-green-600]="customer.status !== 'ACTIVE'"
                  [class.text-white]="customer.status !== 'ACTIVE'"
                  [class.hover:bg-green-700]="customer.status !== 'ACTIVE'">
                  Active
                </button>
                <button (click)="changeStatus('SUSPENDED')" [disabled]="customer.status === 'SUSPENDED'"
                  class="px-4 py-2 rounded-lg text-sm font-medium transition"
                  [class.bg-yellow-100]="customer.status === 'SUSPENDED'"
                  [class.text-yellow-700]="customer.status === 'SUSPENDED'"
                  [class.bg-yellow-600]="customer.status !== 'SUSPENDED'"
                  [class.text-white]="customer.status !== 'SUSPENDED'"
                  [class.hover:bg-yellow-700]="customer.status !== 'SUSPENDED'">
                  Suspend
                </button>
                <button (click)="changeStatus('CLOSED')" [disabled]="customer.status === 'CLOSED'"
                  class="px-4 py-2 rounded-lg text-sm font-medium transition"
                  [class.bg-red-100]="customer.status === 'CLOSED'"
                  [class.text-red-700]="customer.status === 'CLOSED'"
                  [class.bg-red-600]="customer.status !== 'CLOSED'"
                  [class.text-white]="customer.status !== 'CLOSED'"
                  [class.hover:bg-red-700]="customer.status !== 'CLOSED'">
                  Close
                </button>
              </div>
              @if (statusError) {
                <p class="text-red-600 text-sm mt-2">{{ statusError }}</p>
              }
            </div>

            <div class="pt-6 border-t">
              <h2 class="text-lg font-semibold text-gray-800 mb-3">Link User</h2>
              <div class="flex gap-2">
                <input type="number" [(ngModel)]="linkUserId" placeholder="User ID"
                  class="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                <button (click)="linkUser()" [disabled]="!linkUserId || linking"
                  class="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                  {{ linking ? 'Linking...' : 'Link User' }}
                </button>
              </div>
              @if (linkError) {
                <p class="text-red-600 text-sm mt-2">{{ linkError }}</p>
              }
              @if (linkSuccess) {
                <p class="text-green-600 text-sm mt-2">{{ linkSuccess }}</p>
              }
            </div>
          }

          <div class="flex gap-3 mt-8 pt-6 border-t">
            <a [routerLink]="['/customers', customer.id, 'edit']"
              class="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2 rounded-lg transition text-sm">
              Edit
            </a>
            <a routerLink="/customers"
              class="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-5 py-2 rounded-lg transition text-sm">
              Back
            </a>
          </div>
        </div>
      } @else {
        <div class="text-center py-12 text-gray-500">Loading...</div>
      }
    </div>
  `,
})
export class CustomerDetailComponent implements OnInit {
  customer?: Customer;
  isStaff = false;
  auth = inject(AuthService);

  linkUserId?: number;
  linking = false;
  linkError = '';
  linkSuccess = '';
  statusError = '';

  constructor(
    private service: CustomerService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit() {
    this.isStaff = this.auth.role() === 'ADMIN' || this.auth.role() === 'EMPLOYEE';
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.service.get(Number(id)).subscribe({
        next: (c) => (this.customer = c),
        error: () => this.router.navigate(['/customers']),
      });
    }
  }

  changeStatus(status: string) {
    if (!this.customer) return;
    this.statusError = '';
    this.service.updateStatus(this.customer.id, status).subscribe({
      next: (c) => { this.customer = c; },
      error: (err) => { this.statusError = err.error?.error || 'Failed to update status.'; },
    });
  }

  linkUser() {
    if (!this.customer || !this.linkUserId) return;
    this.linking = true;
    this.linkError = '';
    this.linkSuccess = '';
    this.service.linkUser(this.customer.id, this.linkUserId).subscribe({
      next: () => {
        this.linkSuccess = 'User linked successfully.';
        this.linking = false;
        this.linkUserId = undefined;
      },
      error: (err) => {
        this.linkError = err.error?.error || 'Failed to link user.';
        this.linking = false;
      },
    });
  }
}
