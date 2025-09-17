import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Observable, of } from 'rxjs';
import { Document } from '../../../../core/models/document.interface';
import { Company } from '../../../../core/models/company.interface';
import { DocumentsService } from '../../../../core/services/documents.service';
import { CompaniesService } from '../../../../core/services/companies.service';

@Component({
  selector: 'app-company-documents',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatToolbarModule
  ],
  template: `
    <div class="company-documents-container">
      <mat-toolbar class="page-header">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span class="page-title">{{ company?.name }} - Documents</span>
        <span class="spacer"></span>
        <button
          mat-raised-button
          color="primary"
          (click)="createDocument()">
          <mat-icon>add</mat-icon>
          Create Document
        </button>
      </mat-toolbar>

      <div class="content">
        <mat-card *ngIf="company" class="company-info-card">
          <mat-card-header>
            <mat-card-title>Company Information</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p><strong>Name:</strong> {{ company.name }}</p>
            <p><strong>Document Count:</strong> {{ documents.length || 0 }}</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="documents-card">
          <mat-card-header>
            <mat-card-title>Documents</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div *ngIf="!documents || documents.length === 0" class="empty-state">
              <mat-icon>description</mat-icon>
              <h3>No documents found</h3>
              <p>This company doesn't have any documents yet.</p>
              <button mat-raised-button color="primary" (click)="createDocument()">
                Create First Document
              </button>
            </div>

            <mat-table
              *ngIf="documents && documents.length > 0"
              [dataSource]="documents"
              class="documents-table">

              <ng-container matColumnDef="name">
                <mat-header-cell *matHeaderCellDef>Name</mat-header-cell>
                <mat-cell *matCellDef="let document">{{ document.name }}</mat-cell>
              </ng-container>

              <ng-container matColumnDef="status">
                <mat-header-cell *matHeaderCellDef>Status</mat-header-cell>
                <mat-cell *matCellDef="let document">
                  <span [class]="'status-' + document.status">
                    {{ document.status | titlecase }}
                  </span>
                </mat-cell>
              </ng-container>

              <ng-container matColumnDef="createdAt">
                <mat-header-cell *matHeaderCellDef>Created</mat-header-cell>
                <mat-cell *matCellDef="let document">
                  {{ document.created_at | date:'short' }}
                </mat-cell>
              </ng-container>

              <ng-container matColumnDef="actions">
                <mat-header-cell *matHeaderCellDef>Actions</mat-header-cell>
                <mat-cell *matCellDef="let document">
                  <button
                    mat-icon-button
                    (click)="viewDocument(document)"
                    matTooltip="View document">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button
                    mat-icon-button
                    (click)="analyzeDocument(document)"
                    matTooltip="Analyze document">
                    <mat-icon>analytics</mat-icon>
                  </button>
                </mat-cell>
              </ng-container>

              <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
              <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
            </mat-table>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .company-documents-container {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .page-header {
      background-color: var(--surface-color);
      border-bottom: 1px solid var(--divider-color);
      margin-bottom: 24px;
    }

    .page-title {
      font-size: 18px;
      font-weight: 500;
    }

    .spacer {
      flex: 1;
    }

    .content {
      flex: 1;
      padding: 0 24px 24px;
      overflow-y: auto;
    }

    .company-info-card {
      margin-bottom: 24px;
    }

    .documents-card {
      min-height: 400px;
    }

    .empty-state {
      text-align: center;
      padding: 48px 24px;
      color: var(--text-secondary);

      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        margin-bottom: 16px;
        opacity: 0.5;
      }

      h3 {
        margin: 16px 0 8px;
        color: var(--text-primary);
      }

      p {
        margin-bottom: 24px;
      }
    }

    .documents-table {
      width: 100%;
    }

    .status-pending {
      color: #ff9800;
      font-weight: 500;
    }

    .status-signed {
      color: #4caf50;
      font-weight: 500;
    }

    .status-draft {
      color: #757575;
      font-weight: 500;
    }

    .status-expired {
      color: #f44336;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .content {
        padding: 0 16px 16px;
      }

      .page-header {
        padding: 0 16px;
      }
    }
  `]
})
export class CompanyDocumentsComponent implements OnInit {
  company: Company | null = null;
  documents: Document[] = [];
  companyId: string | null = null;
  displayedColumns: string[] = ['name', 'status', 'createdAt', 'actions'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private companiesService: CompaniesService,
    private documentsService: DocumentsService
  ) {}

  ngOnInit(): void {
    this.companyId = this.route.snapshot.paramMap.get('id');
    if (this.companyId) {
      this.loadCompany();
      this.loadDocuments();
    }
  }

  private loadCompany(): void {
    if (this.companyId) {
      this.companiesService.getCompany(Number(this.companyId)).subscribe({
        next: (company: Company) => {
          this.company = company;
        },
        error: (error: any) => {
          console.error('Error loading company:', error);
          this.router.navigate(['/companies']);
        }
      });
    }
  }

  private loadDocuments(): void {
    if (this.companyId) {
      // Use the company-specific documents method
      this.documentsService.getDocumentsByCompany(Number(this.companyId)).subscribe({
        next: (documents: Document[]) => {
          this.documents = documents;
        },
        error: (error: any) => {
          console.error('Error loading documents:', error);
        }
      });
    }
  }

  goBack(): void {
    if (this.companyId) {
      this.router.navigate(['/companies', this.companyId]);
    } else {
      this.router.navigate(['/companies']);
    }
  }

  createDocument(): void {
    // Navigate to document creation with company pre-selected
    this.router.navigate(['/documents/create'], {
      queryParams: { companyId: this.companyId }
    });
  }

  viewDocument(document: Document): void {
    this.router.navigate(['/documents', document.id]);
  }

  analyzeDocument(document: Document): void {
    this.router.navigate(['/documents', document.id, 'analysis']);
  }
}