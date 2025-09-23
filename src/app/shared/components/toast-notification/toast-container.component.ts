import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ToastNotificationComponent, ToastData } from './toast-notification.component';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, ToastNotificationComponent],
  template: `
    <!-- Toast Container - Fixed position at top right -->
    <div
      aria-live="assertive"
      class="fixed inset-0 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end z-50"
    >
      <div class="w-full flex flex-col items-center space-y-4 sm:items-end">
        <!-- Toast Notifications -->
        <app-toast-notification
          *ngFor="let toast of toasts"
          [toast]="toast"
          (dismiss)="onDismiss($event)"
        >
        </app-toast-notification>
      </div>
    </div>
  `,
  styles: [],
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  toasts: ToastData[] = [];
  private destroy$ = new Subject<void>();

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.toastService.toasts$.pipe(takeUntil(this.destroy$)).subscribe((toasts) => {
      this.toasts = toasts;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onDismiss(toastId: string) {
    this.toastService.remove(toastId);
  }
}
