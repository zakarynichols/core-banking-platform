import { Component, OnInit, inject } from '@angular/core';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AccountService, Account } from '../services/account.service';
import { AuthService } from '../services/auth.service';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-account-detail',
  standalone: true,
  imports: [RouterModule, DatePipe, DecimalPipe],
  template: `
    <div class="max-w-2xl mx-auto">
      @if (account) {
        <div class="bg-white rounded-2xl shadow-lg p-8">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h1 class="text-2xl font-bold text-gray-800">{{ account.accountNumber }}</h1>
              <p class="text-sm text-gray-500 mt-1">{{ account.accountType }}</p>
            </div>
            <span class="inline-block px-3 py-1 rounded-full text-sm font-medium"
              [class.bg-green-100]="account.status === 'OPEN'"
              [class.text-green-700]="account.status === 'OPEN'"
              [class.bg-blue-100]="account.status === 'FROZEN'"
              [class.text-blue-700]="account.status === 'FROZEN'"
              [class.bg-red-100]="account.status === 'CLOSED'"
              [class.text-red-700]="account.status === 'CLOSED'">
              {{ account.status }}
            </span>
          </div>

          <div class="bg-gray-50 rounded-xl p-6 mb-6 text-center">
            <p class="text-sm text-gray-500 mb-1">Current Balance</p>
            <p class="text-4xl font-bold tabular-nums"
              [class.text-gray-800]="account.balance >= 0"
              [class.text-red-600]="account.balance < 0">
              {{ account.balance | number:'1.2-2' }} {{ account.currency }}
            </p>
          </div>

          <div class="space-y-4">
            <div class="flex justify-between py-2 border-b">
              <span class="text-gray-500">Primary Owner</span>
              <a [routerLink]="['/customers', account.customerId]"
                class="font-medium text-indigo-600 hover:text-indigo-800">
                {{ account.primaryCustomerName }}
              </a>
            </div>
            @if (account.holderIds && account.holderIds.length > 1) {
              <div class="flex justify-between py-2 border-b">
                <span class="text-gray-500">Joint Holders</span>
                <span class="font-medium text-gray-800">
                  @for (hid of account.holderIds; track hid) {
                    @if (hid !== account.customerId) {
                      <a [routerLink]="['/customers', hid]"
                        class="text-indigo-600 hover:text-indigo-800">{{ account.holderNames[hid] }}</a>
                      @if (!$last) { <span class="text-gray-400">, </span> }
                    }
                  }
                </span>
              </div>
            }
            <div class="flex justify-between py-2 border-b">
              <span class="text-gray-500">Account Type</span>
              <span class="font-medium text-gray-800">{{ account.accountType }}</span>
            </div>
            <div class="flex justify-between py-2 border-b">
              <span class="text-gray-500">Currency</span>
              <span class="font-medium text-gray-800">{{ account.currency }}</span>
            </div>
            <div class="flex justify-between py-2 border-b">
              <span class="text-gray-500">Created</span>
              <span class="font-medium text-gray-800">{{ account.createdAt | date:'medium' }}</span>
            </div>
            <div class="flex justify-between py-2">
              <span class="text-gray-500">Updated</span>
              <span class="font-medium text-gray-800">{{ account.updatedAt | date:'medium' }}</span>
            </div>
          </div>

          @if (isStaff) {
            <div class="mt-8 pt-6 border-t">
              <h2 class="text-lg font-semibold text-gray-800 mb-3">Change Status</h2>
              <div class="flex gap-2">
                <button (click)="changeStatus('OPEN')" [disabled]="account.status === 'OPEN'"
                  class="px-4 py-2 rounded-lg text-sm font-medium transition"
                  [class.bg-green-100]="account.status === 'OPEN'"
                  [class.text-green-700]="account.status === 'OPEN'"
                  [class.bg-green-600]="account.status !== 'OPEN'"
                  [class.text-white]="account.status !== 'OPEN'"
                  [class.hover:bg-green-700]="account.status !== 'OPEN'">
                  Open
                </button>
                <button (click)="changeStatus('FROZEN')" [disabled]="account.status === 'FROZEN'"
                  class="px-4 py-2 rounded-lg text-sm font-medium transition"
                  [class.bg-blue-100]="account.status === 'FROZEN'"
                  [class.text-blue-700]="account.status === 'FROZEN'"
                  [class.bg-blue-600]="account.status !== 'FROZEN'"
                  [class.text-white]="account.status !== 'FROZEN'"
                  [class.hover:bg-blue-700]="account.status !== 'FROZEN'">
                  Freeze
                </button>
                <button (click)="changeStatus('CLOSED')" [disabled]="account.status === 'CLOSED'"
                  class="px-4 py-2 rounded-lg text-sm font-medium transition"
                  [class.bg-red-100]="account.status === 'CLOSED'"
                  [class.text-red-700]="account.status === 'CLOSED'"
                  [class.bg-red-600]="account.status !== 'CLOSED'"
                  [class.text-white]="account.status !== 'CLOSED'"
                  [class.hover:bg-red-700]="account.status !== 'CLOSED'">
                  Close
                </button>
              </div>
              @if (statusError) {
                <p class="text-red-600 text-sm mt-2">{{ statusError }}</p>
              }
            </div>
          }

          <div class="flex gap-3 mt-8 pt-6 border-t">
            <a routerLink="/accounts"
              class="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-5 py-2 rounded-lg transition text-sm">
              Back to Accounts
            </a>
          </div>
        </div>
      } @else {
        <div class="text-center py-12 text-gray-500">Loading...</div>
      }
    </div>
  `,
})
export class AccountDetailComponent implements OnInit {
  account?: Account;
  isStaff = false;
  statusError = '';
  auth = inject(AuthService);

  constructor(
    private readonly service: AccountService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit() {
    this.isStaff = this.auth.role() === 'ADMIN' || this.auth.role() === 'EMPLOYEE';
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.service.get(Number(id)).subscribe({
        next: (a) => { this.account = a; },
        error: () => this.router.navigate(['/accounts']),
      });
    }
  }

  changeStatus(status: string) {
    if (!this.account) return;
    this.statusError = '';
    this.service.updateStatus(this.account.id, status).subscribe({
      next: (a) => { this.account = a; },
      error: (err) => { this.statusError = err.error?.error || 'Failed to update status.'; },
    });
  }
}
