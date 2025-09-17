import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';
import { SharedModule } from '../../../shared/shared.module';
import { NavigationService, NavigationItem } from '../../../core/services/navigation.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  children?: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [SharedModule],
  template: `
    <nav class="sidebar" [class.collapsed]="isCollapsed">
      <div class="sidebar-content">
        <mat-nav-list class="nav-list">
          <ng-container *ngFor="let item of menuItems">
            <mat-list-item
              *ngIf="!item.children"
              class="nav-item"
              [class.active]="item.active"
              (click)="navigateTo(item.route)">
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle class="nav-label">{{ item.label }}</span>
            </mat-list-item>

            <mat-expansion-panel
              *ngIf="item.children"
              class="nav-expansion-panel"
              [expanded]="hasActiveChild(item)">
              <mat-expansion-panel-header class="nav-expansion-header">
                <mat-panel-title class="nav-expansion-title">
                  <mat-icon class="nav-expansion-icon">{{ item.icon }}</mat-icon>
                  <span class="nav-label">{{ item.label }}</span>
                </mat-panel-title>
              </mat-expansion-panel-header>

              <mat-nav-list class="nav-sub-list">
                <mat-list-item
                  *ngFor="let child of item.children"
                  class="nav-sub-item"
                  [class.active]="child.active"
                  (click)="navigateTo(child.route)">
                  <mat-icon matListItemIcon>{{ child.icon }}</mat-icon>
                  <span matListItemTitle class="nav-label">{{ child.label }}</span>
                </mat-list-item>
              </mat-nav-list>
            </mat-expansion-panel>
          </ng-container>
        </mat-nav-list>
      </div>

      <div class="sidebar-footer">
        <button
          mat-icon-button
          class="collapse-button"
          (click)="toggleCollapse()"
          [matTooltip]="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
          matTooltipPosition="right">
          <mat-icon>{{ isCollapsed ? 'chevron_right' : 'chevron_left' }}</mat-icon>
        </button>
      </div>
    </nav>
  `,
  styles: [`
    .sidebar {
      width: 260px;
      height: 100%;
      background-color: var(--surface-color);
      border-right: 1px solid var(--divider-color);
      display: flex;
      flex-direction: column;
      transition: width 0.3s ease-in-out;
      overflow: hidden;

      &.collapsed {
        width: 56px;
      }
    }

    .sidebar-content {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .nav-list {
      padding: 8px 0;
    }

    .nav-item {
      margin: 2px 8px;
      border-radius: var(--border-radius);
      cursor: pointer;
      transition: background-color var(--transition-fast);
      min-height: 48px;

      &:hover {
        background-color: rgba(0, 0, 0, 0.04);
      }

      &.active {
        background-color: rgba(25, 118, 210, 0.12);
        color: var(--primary-color);

        .mat-icon {
          color: var(--primary-color);
        }
      }
    }

    .nav-expansion-panel {
      margin: 2px 8px;
      box-shadow: none;
      border-radius: var(--border-radius);

      .mat-expansion-panel-header {
        padding: 0 16px;
        height: 48px;
        border-radius: var(--border-radius);

        &:hover {
          background-color: rgba(0, 0, 0, 0.04);
        }
      }

      .mat-expansion-panel-body {
        padding: 0;
      }
    }

    .nav-expansion-title {
      display: flex;
      align-items: center;
      gap: 16px;
      margin: 0;
    }

    .nav-expansion-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .nav-sub-list {
      padding: 0;
      margin-left: 24px;
    }

    .nav-sub-item {
      margin: 2px 8px;
      border-radius: var(--border-radius);
      cursor: pointer;
      transition: background-color var(--transition-fast);
      min-height: 40px;

      &:hover {
        background-color: rgba(0, 0, 0, 0.04);
      }

      &.active {
        background-color: rgba(25, 118, 210, 0.12);
        color: var(--primary-color);

        .mat-icon {
          color: var(--primary-color);
        }
      }
    }

    .nav-label {
      font-size: 14px;
      font-weight: 400;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .sidebar-footer {
      padding: 8px;
      border-top: 1px solid var(--divider-color);
      display: flex;
      justify-content: center;
    }

    .collapse-button {
      width: 40px;
      height: 40px;
    }

    /* Collapsed state styles */
    .sidebar.collapsed {
      .nav-label {
        display: none;
      }

      .nav-expansion-panel {
        .mat-expansion-panel-header {
          padding: 0 12px;
          justify-content: center;
        }

        .nav-expansion-title {
          justify-content: center;
        }
      }

      .nav-sub-list {
        display: none;
      }
    }

    @media (max-width: 768px) {
      .sidebar {
        position: fixed;
        top: 64px;
        left: 0;
        z-index: 1030;
        transform: translateX(-100%);
        transition: transform 0.3s ease-in-out;

        &.open {
          transform: translateX(0);
        }
      }
    }
  `]
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() isCollapsed = false;

  currentRoute = '';
  menuItems: NavigationItem[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private navigationService: NavigationService
  ) {}

  ngOnInit(): void {
    // Track current route and update menu items
    this.navigationService.currentRoute$
      .pipe(takeUntil(this.destroy$))
      .subscribe((route) => {
        this.currentRoute = route;
        this.updateMenuItems();
      });

    // Initial menu setup
    this.updateMenuItems();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateMenuItems(): void {
    this.menuItems = this.navigationService.getNavigationItems();
  }

  navigateTo(route: string): void {
    this.navigationService.navigateTo(route);
  }

  isRouteActive(route: string): boolean {
    return this.navigationService.isRouteActive(route);
  }

  hasActiveChild(item: NavigationItem): boolean {
    if (!item.children) {
      return false;
    }
    return item.children.some(child => child.active);
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }
}