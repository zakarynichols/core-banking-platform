import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

export interface AuthResponse {
  token: string;
  username: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'jwt_token';
  readonly username = signal(this.getUsername());
  readonly role = signal(this.getRole());

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {}

  login(credentials: { username: string; password: string }) {
    return this.http.post<AuthResponse>('/api/auth/login', credentials).pipe(
      tap((res) => this.setSession(res)),
    );
  }

  register(data: { username: string; email: string; password: string; fullName: string }) {
    return this.http.post<AuthResponse>('/api/auth/register', data).pipe(
      tap((res) => this.setSession(res)),
    );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this.username.set('');
    this.role.set('');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private setSession(res: AuthResponse) {
    localStorage.setItem(this.tokenKey, res.token);
    this.username.set(res.username);
    this.role.set(res.role);
  }

  private getUsername(): string {
    const token = this.getToken();
    if (!token) return '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || '';
    } catch {
      return '';
    }
  }

  private getRole(): string {
    const token = this.getToken();
    if (!token) return '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || '';
    } catch {
      return '';
    }
  }
}
