import { Component, Input } from '@angular/core';
import { SharedModule } from '../../shared.module';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [SharedModule],
  template: `
    <div class="loading-container" [class.centered]="centered">
      <mat-spinner
        [diameter]="diameter"
        [color]="color"
        [strokeWidth]="strokeWidth">
      </mat-spinner>
      <p *ngIf="message" class="loading-message">{{ message }}</p>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;

      &.centered {
        justify-content: center;
        min-height: 200px;
      }
    }

    .loading-message {
      margin: 0;
      color: var(--text-secondary);
      font-size: 14px;
      text-align: center;
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() diameter: number = 40;
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() strokeWidth: number = 4;
  @Input() message: string = '';
  @Input() centered: boolean = false;
}