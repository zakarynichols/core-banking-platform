import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AccountService, Account } from '../services/account.service';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [RouterModule, DatePipe, DecimalPipe],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-800">Accounts</h1>
        <a routerLink="/accounts/new"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          + Open Account
        </a>
      </div>

      <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
        @if (loading) {
          <div class="text-center py-12 text-gray-500">Loading...</div>
        } @else if (accounts.length === 0) {
          <div class="text-center py-12 text-gray-500">No accounts yet.</div>
        } @else {
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
                <th class="text-left px-6 py-3">Account Number</th>
                <th class="text-left px-6 py-3">Type</th>
                <th class="text-left px-6 py-3">Status</th>
                <th class="text-right px-6 py-3">Balance</th>
                <th class="text-left px-6 py-3">Currency</th>
                <th class="text-left px-6 py-3">Created</th>
                <th class="text-right px-6 py-3"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @for (a of accounts; track a.id) {
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 font-mono font-medium text-gray-800">{{ a.accountNumber }}</td>
                  <td class="px-6 py-4 text-gray-600">{{ a.accountType }}</td>
                  <td class="px-6 py-4">
                    <span class="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                      [class.bg-green-100]="a.status === 'OPEN'"
                      [class.text-green-700]="a.status === 'OPEN'"
                      [class.bg-blue-100]="a.status === 'FROZEN'"
                      [class.text-blue-700]="a.status === 'FROZEN'"
                      [class.bg-red-100]="a.status === 'CLOSED'"
                      [class.text-red-700]="a.status === 'CLOSED'">
                      {{ a.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right font-medium tabular-nums"
                    [class.text-gray-800]="a.balance >= 0"
                    [class.text-red-600]="a.balance < 0">
                    {{ a.balance | number:'1.2-2' }}
                  </td>
                  <td class="px-6 py-4 text-gray-600">{{ a.currency }}</td>
                  <td class="px-6 py-4 text-gray-500">{{ a.createdAt | date:'mediumDate' }}</td>
                  <td class="px-6 py-4 text-right">
                    <a [routerLink]="['/accounts', a.id]"
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
export class AccountsComponent implements OnInit {
  accounts: Account[] = [];
  loading = true;

  constructor(private readonly service: AccountService) {}

  ngOnInit() {
    this.service.list().subscribe({
      next: (res) => { this.accounts = res; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }
}
