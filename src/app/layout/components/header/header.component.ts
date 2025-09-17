import { Component, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { NavigationService } from '../../../core/services/navigation.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [SharedModule],
  template: `
    <mat-toolbar class="app-header" color="primary">
      <button
        mat-button
        class="menu-button"
        (click)="toggleSidebar()"
        aria-label="Toggle sidebar">
        
      </button>

      <div class="header-brand" (click)="navigateToHome()">
        
        <span class="brand-text">ZapSign</span>
      </div>

      <div class="header-spacer"></div>

      <div class="header-actions">
        <button
          mat-button
          class="header-action-button"
          matTooltip="Notifications"
          aria-label="Notifications">
          
        </button>

        <button
          mat-button
          class="header-action-button"
          [matMenuTriggerFor]="userMenu"
          aria-label="User menu">
          
        </button>

        <mat-menu #userMenu="matMenu" xPosition="before">
          <button mat-menu-item (click)="navigateToProfile()">
            
            <span>Profile</span>
          </button>
          <button mat-menu-item (click)="navigateToSettings()">
            
            <span>Settings</span>
          </button>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="signOut()">
            
            <span>Sign Out</span>
          </button>
        </mat-menu>

        <!-- Quick actions menu -->
        <button
          mat-button
          class="header-action-button"
          [matMenuTriggerFor]="quickMenu"
          matTooltip="Quick Actions"
          aria-label="Quick actions menu">
          
        </button>

        <mat-menu #quickMenu="matMenu" xPosition="before">
          <button mat-menu-item (click)="quickCreateCompany()">
            
            <span>New Company</span>
          </button>
          <button mat-menu-item (click)="quickCreateDocument()">
            
            <span>New Document</span>
          </button>
          <button mat-menu-item (click)="quickCreateSigner()">
            
            <span>New Signer</span>
          </button>
        </mat-menu>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .app-header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1030;
      height: 64px;
      padding: 0 16px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .menu-button {
      margin-right: 16px;
    }

    .header-brand {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      user-select: none;
      transition: opacity var(--transition-fast);

      &:hover {
        opacity: 0.8;
      }
    }

    .brand-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .brand-text {
      font-size: 20px;
      font-weight: 500;
      letter-spacing: 0.5px;
    }

    .header-spacer {
      flex: 1;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .header-action-button {
      width: 40px;
      height: 40px;

        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }

    @media (max-width: 768px) {
      .brand-text {
        display: none;
      }

      .header-brand {
        margin-right: auto;
      }
    }

    @media (max-width: 480px) {
      .app-header {
        padding: 0 8px;
      }

      .menu-button {
        margin-right: 8px;
      }
    }
  `]
})
export class HeaderComponent {
  @Output() sidebarToggle = new EventEmitter<void>();

  constructor(
    private router: Router,
    private navigationService: NavigationService
  ) {}

  toggleSidebar(): void {
    this.sidebarToggle.emit();
  }

  navigateToHome(): void {
    this.navigationService.navigateTo('/dashboard');
  }

  // User menu actions
  navigateToProfile(): void {
    // TODO: Implement when profile route is available
    console.log('Navigate to profile');
  }

  navigateToSettings(): void {
    // TODO: Implement when settings route is available
    console.log('Navigate to settings');
  }

  signOut(): void {
    // TODO: Implement sign out functionality
    console.log('Sign out');
  }

  // Quick action methods
  quickCreateCompany(): void {
    this.navigationService.navigateToCreateCompany();
  }

  quickCreateDocument(): void {
    this.navigationService.navigateToCreateDocument();
  }

  quickCreateSigner(): void {
    this.navigationService.navigateToCreateSigner();
  }
}