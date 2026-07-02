import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  data = { username: '', email: '', password: '', fullName: '' };
  error = '';
  loading = false;

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  onSubmit() {
    this.error = '';
    this.loading = true;
    this.auth.register(this.data).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.error = err.error?.error || 'Registration failed. Please try again.';
        this.loading = false;
      },
    });
  }
}
