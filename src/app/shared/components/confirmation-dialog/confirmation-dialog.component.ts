import { Component, Inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ConfirmationDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'error' | 'danger';
}

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation-dialog.component.html',
  styles: []
})
export class ConfirmationDialogComponent {
  @Output() confirm = new EventEmitter<boolean>();
  @Output() cancel = new EventEmitter<void>();

  constructor(
    @Inject('data') public data: ConfirmationDialogData
  ) {
    // Set default type if not provided
    this.data.type = this.data.type || 'info';
  }

  onConfirm(): void {
    this.confirm.emit(true);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  getIconPath(): string {
    switch (this.data.type) {
      case 'warning':
        return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z';
      case 'error':
      case 'danger':
        return 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z';
      default:
        return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  }

  getIconColorClasses(): string {
    switch (this.data.type) {
      case 'warning':
        return 'text-yellow-500';
      case 'error':
      case 'danger':
        return 'text-red-500';
      default:
        return 'text-blue-500';
    }
  }

  getConfirmButtonClasses(): string {
    const baseClasses = 'px-4 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors';
    switch (this.data.type) {
      case 'warning':
        return `${baseClasses} bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500`;
      case 'error':
      case 'danger':
        return `${baseClasses} bg-red-600 text-white hover:bg-red-700 focus:ring-red-500`;
      default:
        return `${baseClasses} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500`;
    }
  }
}