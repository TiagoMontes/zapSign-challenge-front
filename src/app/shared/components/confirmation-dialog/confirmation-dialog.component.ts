import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SharedModule } from '../../shared.module';

export interface ConfirmationDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'error';
}

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [SharedModule],
  template: `
    <div class="confirmation-dialog">
      <h2 mat-dialog-title class="dialog-title">
        <mat-icon [class]="'icon-' + data.type">{{ getIcon() }}</mat-icon>
        {{ data.title }}
      </h2>

      <mat-dialog-content class="dialog-content">
        <p>{{ data.message }}</p>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button
          mat-button
          type="button"
          (click)="onCancel()">
          {{ data.cancelText || 'Cancel' }}
        </button>
        <button
          mat-raised-button
          [color]="getButtonColor()"
          type="button"
          (click)="onConfirm()">
          {{ data.confirmText || 'Confirm' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirmation-dialog {
      min-width: 300px;
      max-width: 500px;
    }

    .dialog-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 16px 0;
    }

    .dialog-content {
      margin-bottom: 16px;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin: 0;
      padding: 0;
    }

    .icon-info {
      color: var(--info-color);
    }

    .icon-warning {
      color: var(--accent-color);
    }

    .icon-error {
      color: var(--warn-color);
    }
  `]
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData
  ) {
    // Set default type if not provided
    this.data.type = this.data.type || 'info';
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  getIcon(): string {
    switch (this.data.type) {
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'info';
    }
  }

  getButtonColor(): 'primary' | 'accent' | 'warn' {
    switch (this.data.type) {
      case 'warning':
        return 'accent';
      case 'error':
        return 'warn';
      default:
        return 'primary';
    }
  }
}