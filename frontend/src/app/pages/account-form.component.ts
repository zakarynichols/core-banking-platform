import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AccountService, AccountRequest } from '../services/account.service';
import { CustomerService, Customer } from '../services/customer.service';
import { AuthService } from '../services/auth.service';
import { Subject, debounceTime, switchMap, takeUntil } from 'rxjs';

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
                <label class="block text-sm font-medium text-gray-700 mb-1">Primary Customer</label>
                @if (primaryCustomer) {
                  <div class="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3">
                    <div>
                      <p class="font-medium text-indigo-800">{{ primaryCustomer.fullName }}</p>
                      <p class="text-sm text-indigo-600">{{ primaryCustomer.email }}</p>
                    </div>
                    <button type="button" (click)="clearPrimary()" class="text-indigo-500 hover:text-indigo-700 text-sm font-medium">Change</button>
                  </div>
                } @else {
                  <div class="relative">
                    <input type="text" [(ngModel)]="primarySearchQuery" (input)="onPrimarySearch()" name="primarySearch"
                      placeholder="Search by name or email..."
                      class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                    @if (primaryResults.length > 0) {
                      <ul class="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        @for (c of primaryResults; track c.id) {
                          <li (click)="selectPrimary(c)"
                            class="px-3 py-2 hover:bg-indigo-50 cursor-pointer text-sm border-b border-gray-100 last:border-0">
                            <span class="font-medium text-gray-800">{{ c.fullName }}</span>
                            <span class="text-gray-500 ml-2">{{ c.email }}</span>
                          </li>
                        }
                      </ul>
                    }
                  </div>
                }
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Joint Holders</label>
                @if (jointHolders.length > 0) {
                  <div class="space-y-2 mb-3">
                    @for (h of jointHolders; track h.id) {
                      <div class="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                        <div>
                          <p class="font-medium text-gray-800">{{ h.fullName }}</p>
                          <p class="text-sm text-gray-500">{{ h.email }}</p>
                        </div>
                        <button type="button" (click)="removeJoint(h)"
                          class="text-red-500 hover:text-red-700 text-sm font-medium">Remove</button>
                      </div>
                    }
                  </div>
                }
                <button type="button" (click)="showJointSearch = true"
                  class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                  + Add Joint Holder
                </button>
                @if (showJointSearch) {
                  <div class="relative mt-2">
                    <input type="text" [(ngModel)]="jointSearchQuery" (input)="onJointSearch()" name="jointSearch"
                      placeholder="Search by name or email..."
                      class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                    @if (jointResults.length > 0) {
                      <ul class="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        @for (c of jointResults; track c.id) {
                          <li (click)="selectJoint(c)"
                            class="px-3 py-2 hover:bg-indigo-50 cursor-pointer text-sm border-b border-gray-100 last:border-0">
                            <span class="font-medium text-gray-800">{{ c.fullName }}</span>
                            <span class="text-gray-500 ml-2">{{ c.email }}</span>
                          </li>
                        }
                      </ul>
                    }
                  </div>
                }
              </div>
            } @else {
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                <input type="text" [value]="customerName"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed" disabled />
              </div>
            }

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
              <select name="accountType" [(ngModel)]="data.accountType" required
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition bg-white">
                <option value="" disabled>Select type</option>
                <option value="CHECKING">Checking</option>
                <option value="SAVINGS">Savings</option>
              </select>
            </div>

            <div class="flex gap-3">
              <button type="submit" [disabled]="form.invalid || loading || !primaryCustomer"
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
export class AccountFormComponent implements OnInit, OnDestroy {
  data: AccountRequest = { customerId: 0, accountType: '' };
  error = '';
  loading = false;
  loadingProfile = false;
  isStaff = false;
  customerName = '';

  primaryCustomer: Customer | null = null;
  primarySearchQuery = '';
  primaryResults: Customer[] = [];
  private readonly primarySearch = new Subject<string>();

  jointHolders: Customer[] = [];
  showJointSearch = false;
  jointSearchQuery = '';
  jointResults: Customer[] = [];
  private readonly jointSearch = new Subject<string>();

  private readonly destroy$ = new Subject<void>();

  private readonly auth = inject(AuthService);

  constructor(
    private readonly service: AccountService,
    private readonly customerService: CustomerService,
    private readonly router: Router,
  ) {
    this.primarySearch.pipe(debounceTime(300), switchMap(q => q ? this.customerService.search(q) : []), takeUntil(this.destroy$))
      .subscribe({ next: r => this.primaryResults = r });
    this.jointSearch.pipe(debounceTime(300), switchMap(q => q ? this.customerService.search(q) : []), takeUntil(this.destroy$))
      .subscribe({ next: r => this.jointResults = r });
  }

  ngOnInit() {
    this.isStaff = this.auth.role() === 'ADMIN' || this.auth.role() === 'EMPLOYEE';
    if (!this.isStaff) {
      this.loadingProfile = true;
      this.customerService.myProfile().subscribe({
        next: (c) => {
          this.primaryCustomer = c;
          this.data.customerId = c.id;
          this.customerName = c.fullName + ' (' + c.email + ')';
          this.loadingProfile = false;
        },
        error: () => { this.loadingProfile = false; },
      });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onPrimarySearch() {
    if (this.primarySearchQuery.trim()) this.primarySearch.next(this.primarySearchQuery.trim());
    else this.primaryResults = [];
  }

  selectPrimary(c: Customer) {
    this.primaryCustomer = c;
    this.data.customerId = c.id;
    this.primarySearchQuery = '';
    this.primaryResults = [];
  }

  clearPrimary() {
    this.primaryCustomer = null;
    this.data.customerId = 0;
  }

  onJointSearch() {
    if (this.jointSearchQuery.trim()) this.jointSearch.next(this.jointSearchQuery.trim());
    else this.jointResults = [];
  }

  selectJoint(c: Customer) {
    if (!this.jointHolders.find(h => h.id === c.id) && c.id !== this.primaryCustomer?.id) {
      this.jointHolders.push(c);
    }
    this.jointSearchQuery = '';
    this.jointResults = [];
    this.showJointSearch = false;
  }

  removeJoint(c: Customer) {
    this.jointHolders = this.jointHolders.filter(h => h.id !== c.id);
  }

  onSubmit() {
    this.error = '';
    this.loading = true;

    this.data.additionalHolderIds = this.jointHolders.map(h => h.id);

    this.service.create(this.data).subscribe({
      next: (account) => this.router.navigate(['/accounts', account.id]),
      error: (err) => {
        this.error = err.error?.error || 'Failed to open account.';
        this.loading = false;
      },
    });
  }
}
