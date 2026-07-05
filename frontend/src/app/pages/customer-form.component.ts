import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CustomerService, CustomerRequest } from '../services/customer.service';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [FormsModule, RouterModule],
  template: `
    <div class="max-w-2xl mx-auto">
      <div class="bg-white rounded-2xl shadow-lg p-8">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">{{ isEdit ? 'Edit Customer' : 'New Customer' }}</h1>

        @if (error) {
          <div class="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">{{ error }}</div>
        }

        <form (ngSubmit)="onSubmit()" #form="ngForm" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" name="fullName" [(ngModel)]="data.fullName" required
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              placeholder="John Doe" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" name="email" [(ngModel)]="data.email" required
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              placeholder="john@example.com" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="text" name="phone" [(ngModel)]="data.phone"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              placeholder="+1 555-0000" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea name="address" [(ngModel)]="data.address" rows="3"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              placeholder="123 Main St, City"></textarea>
          </div>

          <div class="flex gap-3">
            <button type="submit" [disabled]="form.invalid || loading"
              class="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium px-6 py-2.5 rounded-lg transition">
              {{ loading ? 'Saving...' : 'Save' }}
            </button>
            <a routerLink="/customers"
              class="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-2.5 rounded-lg transition">
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class CustomerFormComponent implements OnInit {
  data: CustomerRequest = { fullName: '', email: '', phone: '', address: '' };
  error = '';
  loading = false;
  isEdit = false;
  editId?: number;

  constructor(
    private readonly service: CustomerService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.editId = Number(id);
      this.service.get(this.editId).subscribe({
        next: (c) => {
          this.data = { fullName: c.fullName, email: c.email, phone: c.phone, address: c.address };
        },
        error: () => this.router.navigate(['/customers']),
      });
    }
  }

  onSubmit() {
    this.error = '';
    this.loading = true;

    const action = this.isEdit && this.editId
      ? this.service.update(this.editId, this.data)
      : this.service.create(this.data);

    action.subscribe({
      next: () => this.router.navigate(['/customers']),
      error: (err) => {
        this.error = err.error?.error || 'Failed to save customer.';
        this.loading = false;
      },
    });
  }
}
