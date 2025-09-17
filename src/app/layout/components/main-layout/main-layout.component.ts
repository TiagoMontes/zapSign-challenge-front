import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, HeaderComponent, SidebarComponent, BreadcrumbComponent, RouterOutlet],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-header (sidebarToggle)="toggleSidebar()"></app-header>

      <div class="flex pt-16">
        <!-- Sidebar -->
        <aside
          class="fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white shadow-sm border-r border-gray-200 transition-all duration-300 z-40"
          [class.w-64]="!isSidebarCollapsed && (sidenavMode === 'side')"
          [class.w-16]="isSidebarCollapsed && (sidenavMode === 'side')"
          [class.-translate-x-full]="sidenavMode === 'over' && !sidenavOpened"
          [class.translate-x-0]="sidenavMode === 'over' && sidenavOpened">
          <app-sidebar [isCollapsed]="isSidebarCollapsed"></app-sidebar>
        </aside>

        <!-- Overlay for mobile -->
        <div
          *ngIf="sidenavMode === 'over' && sidenavOpened"
          class="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          (click)="closeSidebar()">
        </div>

        <!-- Main Content -->
        <main
          class="flex-1 transition-all duration-300"
          [class.ml-64]="!isSidebarCollapsed && sidenavMode === 'side'"
          [class.ml-16]="isSidebarCollapsed && sidenavMode === 'side'"
          [class.ml-0]="sidenavMode === 'over'">

          <div class="p-6">
            <app-breadcrumb></app-breadcrumb>
            <div class="mt-4">
              <router-outlet></router-outlet>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: []
})
export class MainLayoutComponent {
  // Responsive breakpoints
  private readonly MOBILE_BREAKPOINT = 768;

  // Sidenav state
  sidenavMode: 'side' | 'over' = 'side';
  sidenavOpened = true;
  isSidebarCollapsed = false;

  constructor() {
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    const isMobile = window.innerWidth < this.MOBILE_BREAKPOINT;

    if (isMobile) {
      this.sidenavMode = 'over';
      this.sidenavOpened = false;
      this.isSidebarCollapsed = false;
    } else {
      this.sidenavMode = 'side';
      this.sidenavOpened = true;
    }
  }

  toggleSidebar(): void {
    if (this.sidenavMode === 'over') {
      this.sidenavOpened = !this.sidenavOpened;
    } else {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    }
  }

  closeSidebar(): void {
    if (this.sidenavMode === 'over') {
      this.sidenavOpened = false;
    }
  }
}