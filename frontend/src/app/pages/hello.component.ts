import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-hello',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './hello.component.html',
})
export class HelloComponent implements OnInit {
  data: Record<string, string> | null = null;
  loading = true;
  now = new Date();

  constructor(
    private http: HttpClient,
    public auth: AuthService,
  ) {}

  ngOnInit() {
    this.fetch();
  }

  fetch() {
    this.loading = true;
    this.now = new Date();
    this.http.get<Record<string, string>>('/api/hello').subscribe({
      next: (res) => {
        this.data = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.data = null;
      },
    });
  }
}
