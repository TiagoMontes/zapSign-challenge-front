import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PageHeaderAction {
  label: string;
  icon?: string;
  action: () => void;
  type?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-header.component.html',
  styles: [],
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() actions: PageHeaderAction[] = [];
  @Input() showBackButton = false;
  @Input() backLabel = 'Back';

  @Output() back = new EventEmitter<void>();

  onBack(): void {
    this.back.emit();
  }

  executeAction(action: PageHeaderAction): void {
    if (!action.disabled) {
      action.action();
    }
  }

  getActionClasses(action: PageHeaderAction): string {
    const baseClasses =
      'inline-flex items-center px-4 py-2 border font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

    switch (action.type) {
      case 'primary':
        return `${baseClasses} border-transparent text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500`;
      case 'danger':
        return `${baseClasses} border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500`;
      case 'secondary':
      default:
        return `${baseClasses} border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500`;
    }
  }

  getIconPath(iconName?: string): string | null {
    if (!iconName) return null;

    const icons: { [key: string]: string } = {
      plus: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
      edit: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
      delete:
        'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
      download: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4',
      upload: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12',
      share:
        'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z',
      settings:
        'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
      refresh:
        'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
    };

    return icons[iconName] || null;
  }
}
