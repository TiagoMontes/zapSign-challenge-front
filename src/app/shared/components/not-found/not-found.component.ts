import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SharedModule } from '../../shared.module';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [SharedModule],
  template: `
    <div class="not-found-container">
      <div class="not-found-content">
        <mat-icon class="not-found-icon">error_outline</mat-icon>
        <h1>404 - Page Not Found</h1>
        <p class="not-found-message">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div class="not-found-actions">
          <button mat-raised-button color="primary" (click)="goHome()">
            <mat-icon>home</mat-icon>
            Go to Dashboard
          </button>
          <button mat-button (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
            Go Back
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .not-found-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
      padding: 24px;
    }

    .not-found-content {
      text-align: center;
      max-width: 400px;
    }

    .not-found-icon {
      font-size: 72px;
      width: 72px;
      height: 72px;
      color: var(--text-secondary);
      margin-bottom: 16px;
    }

    h1 {
      font-size: 32px;
      font-weight: 300;
      margin-bottom: 16px;
      color: var(--text-primary);
    }

    .not-found-message {
      font-size: 16px;
      color: var(--text-secondary);
      margin-bottom: 32px;
      line-height: 1.5;
    }

    .not-found-actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
      align-items: center;

      @media (min-width: 480px) {
        flex-direction: row;
        justify-content: center;
      }
    }

    button {
      min-width: 140px;
    }
  `]
})
export class NotFoundComponent {
  constructor(private router: Router) {}

  goHome(): void {
    this.router.navigate(['/dashboard']);
  }

  goBack(): void {
    window.history.back();
  }
}