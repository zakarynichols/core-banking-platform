import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  search(query: string) {
    return this.http.get<User[]>('/api/users/search', { params: { q: query } });
  }
}
