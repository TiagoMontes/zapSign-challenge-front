import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signer-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './signer-status.component.html',
  styleUrls: ['./signer-status.component.scss']
})
export class SignerStatusComponent {
  @Input() status: string = '';
  @Input() showIcon: boolean = true;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  /**
   * Get status badge classes based on status value
   */
  getStatusClasses(): string {
    const baseClasses = 'inline-flex items-center rounded-full font-medium';
    const sizeClasses = this.getSizeClasses();
    const colorClasses = this.getColorClasses();

    return `${baseClasses} ${sizeClasses} ${colorClasses}`;
  }

  /**
   * Get size-specific classes
   */
  private getSizeClasses(): string {
    switch (this.size) {
      case 'sm':
        return 'px-2 py-0.5 text-xs';
      case 'lg':
        return 'px-3 py-1 text-sm';
      case 'md':
      default:
        return 'px-2.5 py-0.5 text-xs';
    }
  }

  /**
   * Get color classes based on status
   */
  private getColorClasses(): string {
    switch (this.status) {
      case 'signed':
        return 'bg-green-100 text-green-800';
      case 'new':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      case 'invited':
        return 'bg-blue-100 text-blue-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Get status icon SVG path
   */
  getStatusIcon(): string {
    switch (this.status) {
      case 'signed':
        return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'; // Check circle
      case 'new':
      case 'pending':
        return 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'; // Clock
      case 'declined':
        return 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'; // X circle
      case 'invited':
        return 'M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'; // Mail
      case 'error':
        return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.186-.833-2.956 0L5.857 16.5c-.77.833.192 2.5 1.732 2.5z'; // Warning
      case 'expired':
        return 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'; // Exclamation circle
      default:
        return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'; // Information circle
    }
  }

  /**
   * Get user-friendly status label
   */
  getStatusLabel(): string {
    switch (this.status) {
      case 'new':
        return 'Pendente';
      case 'signed':
        return 'Assinado';
      case 'declined':
        return 'Recusado';
      case 'invited':
        return 'Convidado';
      case 'error':
        return 'Erro';
      case 'expired':
        return 'Expirado';
      case 'pending':
        return 'Pendente';
      default:
        return this.status.charAt(0).toUpperCase() + this.status.slice(1);
    }
  }

  /**
   * Get icon size classes
   */
  getIconSizeClasses(): string {
    switch (this.size) {
      case 'sm':
        return 'w-3 h-3';
      case 'lg':
        return 'w-5 h-5';
      case 'md':
      default:
        return 'w-4 h-4';
    }
  }
}