import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeStatus =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'completed'
  | 'cancelled'
  | 'draft'
  | 'published'
  | 'signed'
  | 'unsigned'
  | 'expired'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

export type BadgeSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.component.html',
  styles: [],
})
export class StatusBadgeComponent {
  @Input() status: BadgeStatus = 'inactive';
  @Input() size: BadgeSize = 'md';
  @Input() label: string = '';
  @Input() showIcon: boolean = true;
  @Input() rounded: boolean = true;

  get displayLabel(): string {
    return this.label || this.getDefaultLabel();
  }

  getDefaultLabel(): string {
    const labels: { [key in BadgeStatus]: string } = {
      active: 'Ativo',
      inactive: 'Inativo',
      pending: 'Pendente',
      completed: 'Concluído',
      cancelled: 'Cancelado',
      draft: 'Rascunho',
      published: 'Publicado',
      signed: 'Assinado',
      unsigned: 'Não Assinado',
      expired: 'Expirado',
      success: 'Sucesso',
      warning: 'Aviso',
      error: 'Erro',
      info: 'Informação',
    };
    return labels[this.status];
  }

  getBadgeClasses(): string {
    const baseClasses = 'inline-flex items-center font-medium';

    // Size classes
    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-0.5 text-xs',
      lg: 'px-3 py-1 text-sm',
    };

    // Shape classes
    const shapeClasses = this.rounded ? 'rounded-full' : 'rounded';

    // Color classes
    const colorClasses = this.getColorClasses();

    return `${baseClasses} ${sizeClasses[this.size]} ${shapeClasses} ${colorClasses}`;
  }

  getColorClasses(): string {
    const colorMap: { [key in BadgeStatus]: string } = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      draft: 'bg-gray-100 text-gray-800',
      published: 'bg-blue-100 text-blue-800',
      signed: 'bg-green-100 text-green-800',
      unsigned: 'bg-yellow-100 text-yellow-800',
      expired: 'bg-red-100 text-red-800',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      info: 'bg-blue-100 text-blue-800',
    };
    return colorMap[this.status];
  }

  getIconPath(): string | null {
    if (!this.showIcon) return null;

    const iconMap: { [key in BadgeStatus]: string } = {
      active: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      inactive: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
      pending: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      completed: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      cancelled: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
      draft:
        'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
      published:
        'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
      signed: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      unsigned: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      expired: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      warning:
        'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z',
      error: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
      info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    };
    return iconMap[this.status];
  }

  getIconSize(): string {
    const sizeMap = {
      sm: 'w-3 h-3',
      md: 'w-3 h-3',
      lg: 'w-4 h-4',
    };
    return sizeMap[this.size];
  }
}
