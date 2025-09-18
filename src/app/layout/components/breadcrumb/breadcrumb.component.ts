import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NavigationService, BreadcrumbItem } from '../../../core/services/navigation.service';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  template: `
    <nav class="flex items-center justify-between py-3 px-6 bg-white border-b border-gray-200" aria-label="Navegação breadcrumb">
      <ol class="flex items-center space-x-2 text-sm">
        <li *ngFor="let item of breadcrumbs; let first = first" class="flex items-center">
          <!-- Separator (not for first item) -->
          <svg *ngIf="!first" class="w-4 h-4 text-gray-400 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>

          <!-- Home icon for first item -->
          <svg *ngIf="first" class="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>

          <!-- Active item (no link) -->
          <span *ngIf="item.active" class="text-gray-900 font-medium">
            {{ item.label }}
          </span>

          <!-- Clickable item -->
          <a
            *ngIf="!item.active"
            [routerLink]="item.url"
            class="text-gray-500 hover:text-gray-700 transition-colors duration-200"
            [attr.aria-label]="'Navigate to ' + item.label">
            {{ item.label }}
          </a>
        </li>
      </ol>
    </nav>
  `,
  styles: []
})
export class BreadcrumbComponent implements OnInit, OnDestroy {
  breadcrumbs: BreadcrumbItem[] = [];
  showBackButton = true;

  private destroy$ = new Subject<void>();

  constructor(public navigationService: NavigationService) {}

  ngOnInit(): void {
    this.navigationService.breadcrumbs$
      .pipe(takeUntil(this.destroy$))
      .subscribe(breadcrumbs => {
        this.breadcrumbs = breadcrumbs;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goBack(): void {
    this.navigationService.goBack();
  }
}