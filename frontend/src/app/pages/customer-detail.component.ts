import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { CustomerService, Customer } from '../services/customer.service';
import { UserService, User } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, switchMap, takeUntil } from 'rxjs';

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

              @if (selectedUser) {
                <div class="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3 mb-3">
                  <div>
                    <p class="font-medium text-indigo-800">{{ selectedUser.fullName }}</p>
                    <p class="text-sm text-indigo-600">{{ selectedUser.username }} · {{ selectedUser.email }}</p>
                  </div>
                  <button (click)="clearSelection()" class="text-indigo-500 hover:text-indigo-700 text-sm font-medium">
                    Change
                  </button>
                </div>
                <button (click)="linkUser()" [disabled]="linking"
                  class="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                  {{ linking ? 'Linking...' : 'Confirm Link' }}
                </button>
              } @else {
                <div class="relative">
                  <input
                    type="text"
                    [(ngModel)]="searchQuery"
                    (input)="onSearchInput()"
                    placeholder="Search by username, email, or name..."
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />

                  @if (searchResults.length > 0) {
                    <ul class="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      @for (user of searchResults; track user.id) {
                        <li (click)="selectUser(user)"
                          class="px-3 py-2 hover:bg-indigo-50 cursor-pointer text-sm border-b border-gray-100 last:border-0">
                          <span class="font-medium text-gray-800">{{ user.fullName }}</span>
                          <span class="text-gray-500 ml-2">&#64;{{ user.username }}</span>
                          <span class="text-gray-400 text-xs ml-2">{{ user.email }}</span>
                        </li>
                      }
                    </ul>
                  }
                  @if (searchError) {
                    <p class="text-red-600 text-xs mt-1">{{ searchError }}</p>
                  }
                </div>
              }

              @if (linkError) {
                <p class="text-red-600 text-sm mt-3">{{ linkError }}</p>
              }
              @if (linkSuccess) {
                <p class="text-green-600 text-sm mt-3">{{ linkSuccess }}</p>
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
export class CustomerDetailComponent implements OnInit, OnDestroy {
  customer?: Customer;
  isStaff = false;
  auth = inject(AuthService);
  userService = inject(UserService);

  linking = false;
  linkError = '';
  linkSuccess = '';
  statusError = '';

  searchQuery = '';
  searchResults: User[] = [];
  selectedUser: User | null = null;
  searchError = '';
  private readonly searchSubject = new Subject<string>();
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly service: CustomerService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {
    this.searchSubject
      .pipe(
        debounceTime(300),
        switchMap((q) => {
          if (!q) return [];
          this.searchError = '';
          return this.userService.search(q);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (users) => (this.searchResults = users),
        error: () => { this.searchError = 'Search failed.'; this.searchResults = []; },
      });
  }

  ngOnInit() {
    this.isStaff = this.auth.role() === 'ADMIN' || this.auth.role() === 'EMPLOYEE';
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.service.get(Number(id)).subscribe({
        next: (c) => {
          this.customer = c;
          if (c.linkedUsers && c.linkedUsers.length > 0) {
            this.selectedUser = c.linkedUsers[0];
          }
        },
        error: () => this.router.navigate(['/customers']),
      });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  changeStatus(status: string) {
    if (!this.customer) return;
    this.statusError = '';
    this.service.updateStatus(this.customer.id, status).subscribe({
      next: (c) => { this.customer = c; },
      error: (err) => { this.statusError = err.error?.error || 'Failed to update status.'; },
    });
  }

  onSearchInput() {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      return;
    }
    this.searchSubject.next(this.searchQuery.trim());
  }

  selectUser(user: User) {
    this.selectedUser = user;
    this.searchQuery = '';
    this.searchResults = [];
    this.linkError = '';
    this.linkSuccess = '';
  }

  clearSelection() {
    this.selectedUser = null;
  }

  linkUser() {
    if (!this.customer || !this.selectedUser) return;
    this.linking = true;
    this.linkError = '';
    this.linkSuccess = '';
    this.service.linkUser(this.customer.id, this.selectedUser.id).subscribe({
      next: (customer) => {
        this.customer = customer;
        if (customer.linkedUsers && customer.linkedUsers.length > 0) {
          this.selectedUser = customer.linkedUsers[0];
        }
        this.linkSuccess = 'User linked successfully.';
        this.linking = false;
      },
      error: (err) => {
        this.linkError = err.error?.error || 'Failed to link user.';
        this.linking = false;
      },
    });
  }
}
