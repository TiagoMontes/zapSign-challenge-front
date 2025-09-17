import { Component, ViewChild, HostListener } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [SharedModule, HeaderComponent, SidebarComponent, BreadcrumbComponent, RouterOutlet],
  template: `
    <div class="layout-container">
      <app-header (sidebarToggle)="toggleSidebar()"></app-header>

      <mat-sidenav-container class="layout-content" autosize>
        <mat-sidenav
          #sidenav
          class="layout-sidenav"
          [mode]="sidenavMode"
          [opened]="sidenavOpened"
          [disableClose]="sidenavMode === 'side'"
          (openedChange)="onSidenavOpenedChange($event)">
          <app-sidebar [isCollapsed]="isSidebarCollapsed"></app-sidebar>
        </mat-sidenav>

        <mat-sidenav-content class="layout-main">
          <app-breadcrumb></app-breadcrumb>
          <main class="main-content" role="main">
            <router-outlet></router-outlet>
          </main>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    .layout-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .layout-content {
      flex: 1;
      margin-top: 64px;
    }

    .layout-sidenav {
      width: 260px;
      border-right: none;

      &.collapsed {
        width: 56px;
      }
    }

    .layout-main {
      background-color: var(--background-color);
    }

    .main-content {
      padding: 24px;
      min-height: calc(100vh - 64px);

      @media (max-width: 768px) {
        padding: 16px;
      }

      @media (max-width: 480px) {
        padding: 8px;
      }
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .layout-content {
        margin-top: 64px;
      }
    }
  `]
})
export class MainLayoutComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;

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
      this.sidenav.toggle();
    } else {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    }
  }

  onSidenavOpenedChange(opened: boolean): void {
    if (this.sidenavMode === 'over') {
      this.sidenavOpened = opened;
    }
  }
}