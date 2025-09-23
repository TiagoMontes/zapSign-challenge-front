import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div class="w-full max-w-sm bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h1 class="text-xl font-semibold text-gray-900 mb-4 text-center">Acessar</h1>

        <form (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Usuário</label>
            <input
              [(ngModel)]="username"
              name="username"
              type="text"
              class="mt-1 input-base"
              autocomplete="username"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Senha</label>
            <input
              [(ngModel)]="password"
              name="password"
              type="password"
              class="mt-1 input-base"
              autocomplete="current-password"
            />
          </div>
          <button
            class="w-full btn-primary"
            type="submit"
            [disabled]="isLoading()"
          >
            {{ isLoading() ? 'Entrando...' : 'Entrar' }}
          </button>
          <p *ngIf="error()" class="text-sm text-red-600 text-center">{{ error() }}</p>
        </form>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private notifications = inject(NotificationService);

  username = '';
  password = '';
  isLoading = signal(false);
  error = signal<string | null>(null);

  onSubmit(): void {
    if ( this.isLoading()) return;
    this.isLoading.set(true);
    this.error.set(null);

    this.auth.login(this.username.trim(), this.password).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.notifications.showSuccess('Login realizado com sucesso');
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading.set(false);
        const message = err?.error?.message || 'Usuário ou senha inválidos';
        this.error.set(message);
        this.notifications.showError(message);
      },
    });
  }
}

