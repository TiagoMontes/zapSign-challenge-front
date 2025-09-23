import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  ToastData,
  ToastType,
} from '../components/toast-notification/toast-notification.component';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<ToastData[]>([]);
  public toasts$ = this.toastsSubject.asObservable();

  private defaultDurations: { [key in ToastType]: number } = {
    success: 4000,
    info: 5000,
    warning: 6000,
    error: 0, // Don't auto-dismiss errors
  };

  show(toast: Partial<ToastData> & { type: ToastType; title: string }): void {
    const newToast: ToastData = {
      id: this.generateId(),
      duration: this.defaultDurations[toast.type],
      dismissible: true,
      ...toast,
    };

    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, newToast]);
  }

  success(title: string, message?: string, options?: Partial<ToastData>): void {
    this.show({
      type: 'success',
      title,
      message,
      ...options,
    });
  }

  error(title: string, message?: string, options?: Partial<ToastData>): void {
    this.show({
      type: 'error',
      title,
      message,
      ...options,
    });
  }

  warning(title: string, message?: string, options?: Partial<ToastData>): void {
    this.show({
      type: 'warning',
      title,
      message,
      ...options,
    });
  }

  info(title: string, message?: string, options?: Partial<ToastData>): void {
    this.show({
      type: 'info',
      title,
      message,
      ...options,
    });
  }

  remove(id: string): void {
    const currentToasts = this.toastsSubject.value;
    const filteredToasts = currentToasts.filter((toast) => toast.id !== id);
    this.toastsSubject.next(filteredToasts);
  }

  clear(): void {
    this.toastsSubject.next([]);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
}
