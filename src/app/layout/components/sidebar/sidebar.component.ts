import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NavigationService, NavigationItem } from '../../../core/services/navigation.service';

// (Removed unused local MenuItem interface; using NavigationItem from service)

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="h-full flex flex-col bg-white">
      <div class="flex-1 py-4 overflow-y-auto">
        <ul class="space-y-1 px-3">
          <li *ngFor="let item of menuItems">
            <!-- Simple menu item -->
            <div *ngIf="!item.children">
              <button
                (click)="navigateTo(item.route)"
                class="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                [class.bg-blue-50]="item.active"
                [class.text-blue-600]="item.active"
                [class.border-r-2]="item.active"
                [class.border-blue-600]="item.active"
              >
                <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path [attr.d]="getIconPath(item.icon)" />
                </svg>
                <span [class.hidden]="isCollapsed" class="font-medium">{{ item.label }}</span>
              </button>
            </div>

            <!-- Expandable menu item -->
            <div *ngIf="item.children" class="space-y-1">
              <button
                (click)="toggleSubmenu(item)"
                class="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                [class.bg-gray-100]="hasActiveChild(item)"
              >
                <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path [attr.d]="getIconPath(item.icon)" />
                </svg>
                <span [class.hidden]="isCollapsed" class="font-medium flex-1 text-left">{{
                  item.label
                }}</span>
                <svg
                  *ngIf="!isCollapsed"
                  class="w-4 h-4 transition-transform"
                  [class.rotate-180]="item.expanded"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <!-- Submenu -->
              <ul *ngIf="item.expanded && !isCollapsed" class="ml-8 space-y-1">
                <li *ngFor="let child of item.children">
                  <button
                    (click)="navigateTo(child.route)"
                    class="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    [class.bg-blue-50]="child.active"
                    [class.text-blue-600]="child.active"
                  >
                    <div
                      class="w-2 h-2 rounded-full bg-gray-400"
                      [class.bg-blue-600]="child.active"
                    ></div>
                    <span class="font-medium">{{ child.label }}</span>
                  </button>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </div>

      <!-- Footer with collapse button -->
      <div class="border-t border-gray-200 p-3">
        <button
          (click)="toggleCollapse()"
          class="w-full flex items-center justify-center p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          [title]="isCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              [attr.d]="
                isCollapsed ? 'M13 5l7 7-7 7M5 5l7 7-7 7' : 'M11 19l-7-7 7-7M19 19l-7-7 7-7'
              "
            />
          </svg>
        </button>
      </div>
    </nav>
  `,
  styles: [],
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() isCollapsed = false;

  currentRoute = '';
  menuItems: NavigationItem[] = [];
  private destroy$ = new Subject<void>();

  constructor(private navigationService: NavigationService) {}

  ngOnInit(): void {
    // Track current route and update menu items
    this.navigationService.currentRoute$.pipe(takeUntil(this.destroy$)).subscribe((route) => {
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
    return item.children.some((child) => child.active);
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleSubmenu(item: NavigationItem): void {
    if (item.children) {
      item.expanded = !item.expanded;
    }
  }

  getIconPath(iconName: string): string {
    const iconPaths: { [key: string]: string } = {
      dashboard: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',
      business:
        'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      description:
        'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      people:
        'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      settings:
        'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
    };
    return iconPaths[iconName] || iconPaths['dashboard'];
  }
}
