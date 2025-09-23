import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-spinner.component.html',
  styles: [],
})
export class LoadingSpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() color: 'primary' | 'secondary' | 'gray' = 'primary';
  @Input() message: string = '';
  @Input() centered: boolean = false;

  get sizeClasses(): string {
    const sizes = {
      sm: 'w-4 h-4',
      md: 'w-8 h-8',
      lg: 'w-12 h-12',
      xl: 'w-16 h-16',
    };
    return sizes[this.size];
  }

  get colorClasses(): string {
    const colors = {
      primary: 'text-blue-600',
      secondary: 'text-gray-600',
      gray: 'text-gray-400',
    };
    return colors[this.color];
  }
}
