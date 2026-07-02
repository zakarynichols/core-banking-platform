import { Component, inject } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth.service';
import { filter, first } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './app.component.html',
})
export class AppComponent {
  // Prevents navbar flash — app only renders after the first lazy route chunk loads
  ready = false;
  private readonly router = inject(Router);
  constructor(public auth: AuthService) {
    // Wait for NavigationEnd (fires after lazy route loads + guards/resolvers run)
    // before showing any content. The loading spinner in index.html fills the gap.
    if (this.router.navigated) {
      this.ready = true;
    } else {
      this.router.events.pipe(
        filter(e => e instanceof NavigationEnd),
        first(),
      ).subscribe(() => {
        this.ready = true;
      });
    }
  }
}
