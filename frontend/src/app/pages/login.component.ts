import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  credentials = { username: '', password: '' };
  error = '';
  loading = false;

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  onSubmit() {
    this.error = '';
    this.loading = true;
    this.auth.login(this.credentials).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.error = err.error?.error || 'Login failed. Please try again.';
        this.loading = false;
      },
    });
  }
}
