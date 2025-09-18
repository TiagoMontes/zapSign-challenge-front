import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    handler: () => void;
  };
}

@Component({
  selector: 'app-toast-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-notification.component.html',
  styles: []
})
export class ToastNotificationComponent implements OnInit, OnDestroy {
  @Input() toast!: ToastData;
  @Output() dismiss = new EventEmitter<string>();

  private timeoutId?: number;
  isVisible = false;

  ngOnInit() {
    // Trigger entrance animation
    setTimeout(() => {
      this.isVisible = true;
    }, 10);

    // Auto-dismiss if duration is set
    if (this.toast.duration && this.toast.duration > 0) {
      this.timeoutId = window.setTimeout(() => {
        this.onDismiss();
      }, this.toast.duration);
    }
  }

  ngOnDestroy() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  onDismiss() {
    this.isVisible = false;
    // Wait for exit animation before emitting dismiss
    setTimeout(() => {
      this.dismiss.emit(this.toast.id);
    }, 300);
  }

  onActionClick() {
    if (this.toast.action?.handler) {
      this.toast.action.handler();
    }
    this.onDismiss();
  }

  getToastClasses(): string {
    const baseClasses = 'max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden transform transition-all duration-300 ease-in-out';
    const visibilityClasses = this.isVisible
      ? 'translate-x-0 opacity-100'
      : 'translate-x-full opacity-0';

    return `${baseClasses} ${visibilityClasses}`;
  }

  getIconPath(): string {
    const icons: { [key in ToastType]: string } = {
      'success': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      'error': 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
      'warning': 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z',
      'info': 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    };
    return icons[this.toast.type];
  }

  getIconColorClasses(): string {
    const colors: { [key in ToastType]: string } = {
      'success': 'text-green-400',
      'error': 'text-red-400',
      'warning': 'text-yellow-400',
      'info': 'text-blue-400'
    };
    return colors[this.toast.type];
  }

  getBorderColorClasses(): string {
    const colors: { [key in ToastType]: string } = {
      'success': 'border-l-green-400',
      'error': 'border-l-red-400',
      'warning': 'border-l-yellow-400',
      'info': 'border-l-blue-400'
    };
    return `border-l-4 ${colors[this.toast.type]}`;
  }
}