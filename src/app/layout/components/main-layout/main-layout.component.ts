import { Component, HostListener, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { ToastContainerComponent } from '../../../shared/components/toast-notification/toast-container.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, HeaderComponent, SidebarComponent, BreadcrumbComponent, RouterOutlet, ToastContainerComponent],
  templateUrl: './main-layout.component.html',
  styles: []
})
export class MainLayoutComponent implements OnInit {
  // Responsive breakpoints (matching Tailwind CSS breakpoints)
  private readonly BREAKPOINTS = {
    sm: 640,   // Small devices
    md: 768,   // Medium devices (tablets)
    lg: 1024,  // Large devices (laptops)
    xl: 1280,  // Extra large devices (desktops)
    '2xl': 1536 // 2X Large devices
  };

  // Sidenav state
  sidenavMode: 'side' | 'over' = 'side';
  sidenavOpened = true;
  isSidebarCollapsed = false;
  currentBreakpoint = 'lg';

  constructor() {}

  ngOnInit(): void {
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.checkScreenSize();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.sidenavMode === 'over' && this.sidenavOpened) {
      this.closeSidebar();
    }
  }

  private checkScreenSize(): void {
    const width = window.innerWidth;

    // Determine current breakpoint
    if (width >= this.BREAKPOINTS['2xl']) {
      this.currentBreakpoint = '2xl';
    } else if (width >= this.BREAKPOINTS.xl) {
      this.currentBreakpoint = 'xl';
    } else if (width >= this.BREAKPOINTS.lg) {
      this.currentBreakpoint = 'lg';
    } else if (width >= this.BREAKPOINTS.md) {
      this.currentBreakpoint = 'md';
    } else if (width >= this.BREAKPOINTS.sm) {
      this.currentBreakpoint = 'sm';
    } else {
      this.currentBreakpoint = 'xs';
    }

    // Configure sidebar behavior based on screen size
    const isLargeScreen = width >= this.BREAKPOINTS.lg;

    if (isLargeScreen) {
      // Large screens: sidebar as permanent side panel
      this.sidenavMode = 'side';
      this.sidenavOpened = true;
      // Preserve collapsed state for large screens
    } else {
      // Small/medium screens: sidebar as overlay
      this.sidenavMode = 'over';
      this.sidenavOpened = false;
      this.isSidebarCollapsed = false; // Always expanded when overlay
    }
  }

  toggleSidebar(): void {
    if (this.sidenavMode === 'over') {
      // Mobile/tablet mode: toggle overlay
      this.sidenavOpened = !this.sidenavOpened;
    } else {
      // Desktop mode: toggle collapsed state
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    }
  }

  closeSidebar(): void {
    if (this.sidenavMode === 'over') {
      this.sidenavOpened = false;
    }
  }

  // Utility getter for debugging/template use
  get isLargeScreen(): boolean {
    return window.innerWidth >= this.BREAKPOINTS.lg;
  }

  get isMediumScreen(): boolean {
    return window.innerWidth >= this.BREAKPOINTS.md && window.innerWidth < this.BREAKPOINTS.lg;
  }

  get isSmallScreen(): boolean {
    return window.innerWidth < this.BREAKPOINTS.md;
  }
}