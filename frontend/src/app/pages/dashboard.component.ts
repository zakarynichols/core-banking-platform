import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  helloResult: unknown = null;
  securedResult: unknown = null;

  constructor(
    public auth: AuthService,
    private http: HttpClient, 
  ) {}

  testHello() {
    this.http.get('/api/hello').subscribe((res) => (this.helloResult = res));
  }

  testSecured() {
    this.http.get('/api/secured').subscribe((res) => (this.securedResult = res));
  }
}
