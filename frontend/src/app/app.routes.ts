import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login.component').then((c) => c.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register.component').then((c) => c.RegisterComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard.component').then((c) => c.DashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'hello',
    loadComponent: () => import('./pages/hello.component').then((c) => c.HelloComponent),
  },
  {
    path: 'customers',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/customers.component').then((c) => c.CustomersComponent),
      },
      {
        path: 'me',
        loadComponent: () => import('./pages/my-profile.component').then((c) => c.MyProfileComponent),
      },
      {
        path: 'new',
        loadComponent: () => import('./pages/customer-form.component').then((c) => c.CustomerFormComponent),
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/customer-detail.component').then((c) => c.CustomerDetailComponent),
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./pages/customer-form.component').then((c) => c.CustomerFormComponent),
      },
    ],
  },
  { path: '**', redirectTo: '/dashboard' },
];
