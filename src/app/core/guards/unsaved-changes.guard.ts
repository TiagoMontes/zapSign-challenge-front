import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable, of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { map, switchMap } from 'rxjs/operators';

/**
 * Interface that components should implement to work with UnsavedChangesGuard
 */
export interface CanComponentDeactivate {
  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean;
  hasUnsavedChanges(): boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UnsavedChangesGuard implements CanDeactivate<CanComponentDeactivate> {
  constructor(private dialog: MatDialog) {}

  canDeactivate(
    component: CanComponentDeactivate
  ): Observable<boolean> {
    // If the component doesn't implement the interface, allow navigation
    if (!component.canDeactivate || !component.hasUnsavedChanges) {
      return of(true);
    }

    // If there are no unsaved changes, allow navigation
    if (!component.hasUnsavedChanges()) {
      return of(true);
    }

    // If there are unsaved changes, show confirmation dialog
    return this.confirmDialog();
  }

  private confirmDialog(): Observable<boolean> {
    return this.dialog.open(UnsavedChangesDialogComponent, {
      width: '400px',
      disableClose: true,
      data: {
        title: 'Alterações não Salvas',
        message: 'Você tem alterações não salvas. Tem certeza que deseja sair desta página?',
        confirmText: 'Sair da Página',
        cancelText: 'Permanecer na Página'
      }
    }).afterClosed().pipe(
      map(result => !!result)
    );
  }
}

/**
 * Dialog component for confirming navigation with unsaved changes
 */
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface DialogData {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
}

@Component({
  selector: 'app-unsaved-changes-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        
        <h2 mat-dialog-title>{{ data.title }}</h2>
      </div>

      <mat-dialog-content class="dialog-content">
        <p>{{ data.message }}</p>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button
          mat-button
          (click)="onCancel()"
          class="cancel-button">
          {{ data.cancelText }}
        </button>
        <button
          mat-raised-button
          color="warn"
          (click)="onConfirm()"
          class="confirm-button">
          {{ data.confirmText }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 8px 0;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;

      .warning-icon {
        color: #ff9800;
        font-size: 28px;
        width: 28px;
        height: 28px;
      }

      h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 500;
      }
    }

    .dialog-content {
      margin: 0 0 24px 0;

      p {
        margin: 0;
        font-size: 14px;
        line-height: 1.5;
        color: var(--text-secondary);
      }
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin: 0;
      padding: 0;

      .cancel-button {
        min-width: 100px;
      }

      .confirm-button {
        min-width: 100px;
      }
    }
  `]
})
export class UnsavedChangesDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<UnsavedChangesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}