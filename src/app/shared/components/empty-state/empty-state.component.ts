import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empty-state.component.html',
  styles: [],
})
export class EmptyStateComponent {
  @Input() icon: 'document' | 'users' | 'folder' | 'search' | 'inbox' | 'chart' = 'document';
  @Input() title = 'No data found';
  @Input() description = 'Get started by creating a new item.';
  @Input() actionText = '';
  @Input() secondaryActionText = '';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  @Output() action = new EventEmitter<void>();
  @Output() secondaryAction = new EventEmitter<void>();

  onAction(): void {
    this.action.emit();
  }

  onSecondaryAction(): void {
    this.secondaryAction.emit();
  }

  getIconPath(): string {
    const icons = {
      document:
        'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      users:
        'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      folder: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
      search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
      inbox:
        'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0l-3.5-3.5M4 13l3.5-3.5M9 12l2 2 4-4',
      chart:
        'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    };
    return icons[this.icon];
  }

  getContainerClasses(): string {
    const sizeClasses = {
      sm: 'py-8',
      md: 'py-12',
      lg: 'py-16',
    };
    return `flex flex-col items-center justify-center text-center ${sizeClasses[this.size]}`;
  }

  getIconClasses(): string {
    const sizeClasses = {
      sm: 'w-12 h-12',
      md: 'w-16 h-16',
      lg: 'w-20 h-20',
    };
    return `${sizeClasses[this.size]} text-gray-400 mb-4`;
  }

  getTitleClasses(): string {
    const sizeClasses = {
      sm: 'text-lg',
      md: 'text-xl',
      lg: 'text-2xl',
    };
    return `${sizeClasses[this.size]} font-semibold text-gray-900 mb-2`;
  }

  getDescriptionClasses(): string {
    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    };
    return `${sizeClasses[this.size]} text-gray-500 mb-6 max-w-md`;
  }
}
