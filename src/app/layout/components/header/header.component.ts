import { Component, Output, EventEmitter, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavigationService } from '../../../core/services/navigation.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styles: []
})
export class HeaderComponent {
  @Output() sidebarToggle = new EventEmitter<void>();

  showUserMenu = false;
  showQuickMenu = false;
  sidebarCollapsed = false;
  notificationCount = 0; // This could be connected to a notifications service

  constructor(
    private router: Router,
    private navigationService: NavigationService
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;

    // Close user menu if clicked outside
    const userMenuContainer = document.querySelector('[role="menu"]');
    if (this.showUserMenu && userMenuContainer && !userMenuContainer.contains(target)) {
      this.showUserMenu = false;
    }

    // Close quick menu if clicked outside
    const quickMenuContainer = document.querySelector('#quick-actions-button');
    if (this.showQuickMenu && quickMenuContainer && !quickMenuContainer.contains(target)) {
      this.showQuickMenu = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.showUserMenu = false;
    this.showQuickMenu = false;
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    this.sidebarToggle.emit();
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
    if (this.showUserMenu) {
      this.showQuickMenu = false;
    }
  }

  toggleQuickMenu(): void {
    this.showQuickMenu = !this.showQuickMenu;
    if (this.showQuickMenu) {
      this.showUserMenu = false;
    }
  }

  navigateToHome(): void {
    this.navigationService.navigateTo('/dashboard');
  }

  // User menu actions
  navigateToProfile(): void {
    this.showUserMenu = false;
    // TODO: Implement when profile route is available
    console.log('Navigate to profile');
  }

  navigateToSettings(): void {
    this.showUserMenu = false;
    // TODO: Implement when settings route is available
    console.log('Navigate to settings');
  }

  signOut(): void {
    this.showUserMenu = false;
    // TODO: Implement sign out functionality
    console.log('Sign out');
  }

  // Quick action methods
  quickCreateCompany(): void {
    this.showQuickMenu = false;
    this.navigationService.navigateToCreateCompany();
  }

  quickCreateDocument(): void {
    this.showQuickMenu = false;
    this.navigationService.navigateToCreateDocument();
  }

  quickCreateSigner(): void {
    this.showQuickMenu = false;
    // Signers are created automatically when documents are created
    // Navigate to companies to create a document instead
    this.navigationService.navigateToCompanies();
  }
}