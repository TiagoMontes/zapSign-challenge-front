import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

type ModalSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
})
export class ModalComponent {
  @Input() open = false;
  @Input() title = '';
  @Input() subtitle?: string;
  @Input() size: ModalSize = 'md';
  @Input() closeDisabled = false;

  @Output() close = new EventEmitter<void>();
  @Output() backdropClick = new EventEmitter<MouseEvent>();

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.backdropClick.emit(event);
    }
  }

  onCloseClick(): void {
    if (!this.closeDisabled) {
      this.close.emit();
    }
  }

  get containerMaxWidth(): string {
    switch (this.size) {
      case 'sm':
        return 'sm:max-w-md';
      case 'lg':
        return 'sm:max-w-2xl';
      case 'md':
      default:
        return 'sm:max-w-lg';
    }
  }
}
