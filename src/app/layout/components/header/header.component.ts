import { Component, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavigationService } from '../../../core/services/navigation.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white shadow-md">
      <div class="flex items-center justify-between h-16 px-4">
        <!-- Left Section -->
        <div class="flex items-center gap-4">
          <button
            (click)="toggleSidebar()"
            class="p-2 hover:bg-blue-700 rounded-lg transition-colors duration-200"
            aria-label="Toggle sidebar">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>

          <div class="flex items-center gap-2 cursor-pointer" (click)="navigateToHome()">
            <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7h20L12 2zm0 3.83L8.24 7h7.52L12 5.83zM4 9v10h16V9H4zm2 2h12v6H6v-6z"/>
            </svg>
            <span class="text-xl font-semibold tracking-wide hidden sm:block">ZapSign</span>
          </div>
        </div>

        <!-- Right Section -->
        <div class="flex items-center gap-2">
          <!-- Notifications Button -->
          <div class="relative">
            <button
              class="p-2 hover:bg-blue-700 rounded-lg transition-colors duration-200"
              title="Notifications"
              aria-label="Notifications">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
            </button>
          </div>

          <!-- User Menu -->
          <div class="relative" #userMenuContainer>
            <button
              (click)="toggleUserMenu()"
              class="p-2 hover:bg-blue-700 rounded-lg transition-colors duration-200 flex items-center gap-2"
              aria-label="User menu">
              <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            <!-- User Dropdown Menu -->
            <div *ngIf="showUserMenu" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
              <button
                (click)="navigateToProfile()"
                class="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                Profile
              </button>
              <button
                (click)="navigateToSettings()"
                class="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                Settings
              </button>
              <hr class="my-1">
              <button
                (click)="signOut()"
                class="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
                Sign Out
              </button>
            </div>
          </div>

          <!-- Quick Actions Menu -->
          <div class="relative" #quickMenuContainer>
            <button
              (click)="toggleQuickMenu()"
              class="p-2 hover:bg-blue-700 rounded-lg transition-colors duration-200"
              title="Quick Actions"
              aria-label="Quick actions menu">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
            </button>

            <!-- Quick Actions Dropdown Menu -->
            <div *ngIf="showQuickMenu" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
              <button
                (click)="quickCreateCompany()"
                class="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
                New Company
              </button>
              <button
                (click)="quickCreateDocument()"
                class="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                New Document
              </button>
              <button
                (click)="quickCreateSigner()"
                class="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                </svg>
                New Signer
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: []
})
export class HeaderComponent {
  @Output() sidebarToggle = new EventEmitter<void>();

  showUserMenu = false;
  showQuickMenu = false;

  constructor(
    private router: Router,
    private navigationService: NavigationService
  ) {}

  toggleSidebar(): void {
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
    this.navigationService.navigateToCreateSigner();
  }
}