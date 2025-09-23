import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  showSuccess(message: string, duration: number = 3000): void {
    this.snackBar.open(message, 'Fechar', {
      duration,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  showError(message: string, duration: number = 5000): void {
    this.snackBar.open(message, 'Fechar', {
      duration,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  showInfo(message: string, duration: number = 3000): void {
    this.snackBar.open(message, 'Fechar', {
      duration,
      panelClass: ['info-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  showWarning(message: string, duration: number = 4000): void {
    this.snackBar.open(message, 'Fechar', {
      duration,
      panelClass: ['warning-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
}
