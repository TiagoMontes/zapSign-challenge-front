import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subject, takeUntil } from 'rxjs';
import { NavigationService, BreadcrumbItem } from '../../../core/services/navigation.service';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <nav class="breadcrumb-container" aria-label="Breadcrumb navigation">
      <ol class="breadcrumb-list">
        <li
          *ngFor="let item of breadcrumbs; let last = last; let first = first"
          class="breadcrumb-item"
          [class.active]="item.active">

          <!-- Separator (not for first item) -->
          <mat-icon *ngIf="!first" class="breadcrumb-separator">chevron_right</mat-icon>

          <!-- Home icon for first item -->
          <mat-icon *ngIf="first" class="breadcrumb-home-icon">home</mat-icon>

          <!-- Active item (no link) -->
          <span *ngIf="item.active" class="breadcrumb-text active-text">
            {{ item.label }}
          </span>

          <!-- Clickable item -->
          <a
            *ngIf="!item.active"
            [routerLink]="item.url"
            class="breadcrumb-link"
            [attr.aria-label]="'Navigate to ' + item.label">
            {{ item.label }}
          </a>
        </li>
      </ol>

      <!-- Back button -->
      <button
        *ngIf="showBackButton && navigationService.canGoBack()"
        mat-icon-button
        class="back-button"
        (click)="goBack()"
        matTooltip="Go back"
        aria-label="Go back">
        <mat-icon>arrow_back</mat-icon>
      </button>
    </nav>
  `,
  styles: [`
    .breadcrumb-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 24px;
      background-color: var(--surface-color);
      border-bottom: 1px solid var(--divider-color);
      min-height: 56px;
    }

    .breadcrumb-list {
      display: flex;
      align-items: center;
      list-style: none;
      margin: 0;
      padding: 0;
      flex-wrap: wrap;
      gap: 4px;
    }

    .breadcrumb-item {
      display: flex;
      align-items: center;
      font-size: 14px;
      line-height: 1.4;

      &:first-child .breadcrumb-text,
      &:first-child .breadcrumb-link {
        margin-left: 4px;
      }
    }

    .breadcrumb-separator {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: var(--text-secondary);
      margin: 0 4px;
    }

    .breadcrumb-home-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--text-secondary);
    }

    .breadcrumb-link {
      color: var(--text-secondary);
      text-decoration: none;
      padding: 4px 8px;
      border-radius: var(--border-radius);
      transition: all var(--transition-fast);
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      &:hover {
        color: var(--primary-color);
        background-color: rgba(25, 118, 210, 0.08);
      }

      &:focus {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
      }
    }

    .breadcrumb-text {
      padding: 4px 8px;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      &.active-text {
        color: var(--text-primary);
        font-weight: 500;
      }
    }

    .back-button {
      width: 40px;
      height: 40px;
      flex-shrink: 0;
      margin-left: 16px;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .breadcrumb-container {
        padding: 8px 16px;
        min-height: 48px;
      }

      .breadcrumb-list {
        gap: 2px;
      }

      .breadcrumb-link,
      .breadcrumb-text {
        max-width: 120px;
        font-size: 13px;
        padding: 2px 6px;
      }

      .breadcrumb-separator {
        font-size: 14px;
        width: 14px;
        height: 14px;
        margin: 0 2px;
      }

      .breadcrumb-home-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      .back-button {
        width: 36px;
        height: 36px;
        margin-left: 8px;

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }
    }

    /* Extra small screens */
    @media (max-width: 480px) {
      .breadcrumb-container {
        padding: 6px 12px;
      }

      .breadcrumb-link,
      .breadcrumb-text {
        max-width: 80px;
        font-size: 12px;
      }

      /* Hide intermediate breadcrumbs on very small screens, keep only first and last */
      .breadcrumb-item:not(:first-child):not(:last-child) {
        display: none;
      }

      .breadcrumb-item:nth-last-child(2) .breadcrumb-separator {
        display: none;
      }

      .breadcrumb-item:last-child::before {
        content: '...';
        color: var(--text-secondary);
        margin-right: 8px;
        font-weight: bold;
      }
    }

    /* High contrast mode support */
    @media (prefers-contrast: high) {
      .breadcrumb-container {
        border-bottom: 2px solid var(--divider-color);
      }

      .breadcrumb-link {
        border: 1px solid transparent;

        &:hover {
          border-color: var(--primary-color);
        }
      }
    }

    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      .breadcrumb-link {
        transition: none;
      }
    }
  `]
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