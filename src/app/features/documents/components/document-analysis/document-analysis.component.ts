import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { Document } from '../../../../core/models/document.interface';
import { DocumentsService } from '../../../../core/services/documents.service';

interface DocumentAnalysis {
  id: string;
  documentId: string;
  summary: string;
  keyTerms: string[];
  riskFactors: string[];
  recommendations: string[];
  confidence: number;
  analysisDate: Date;
  sections: AnalysisSection[];
}

interface AnalysisSection {
  title: string;
  content: string;
  importance: 'high' | 'medium' | 'low';
  issues?: string[];
}

@Component({
  selector: 'app-document-analysis',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTabsModule,
  ],
  template: `
    <div class="document-analysis-container">
      <mat-toolbar class="page-header">
        <button mat-button (click)="goBack()"></button>
        <span class="page-title">Document Analysis</span>
        <span class="spacer"></span>
        <button
          mat-raised-button
          color="primary"
          (click)="regenerateAnalysis()"
          [disabled]="isAnalyzing"
        >
          Regenerate Analysis
        </button>
      </mat-toolbar>

      <div class="content">
        <mat-card *ngIf="document" class="document-info-card">
          <mat-card-header>
            <mat-card-title>{{ document.name }}</mat-card-title>
            <mat-card-subtitle>Document Information</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="document-meta">
              <span><strong>Status:</strong> {{ document.status | titlecase }}</span>
              <span><strong>Created:</strong> {{ document.created_at | date: 'medium' }}</span>
              <span><strong>Token:</strong> {{ document.token }}</span>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Loading State -->
        <mat-card *ngIf="isAnalyzing" class="analysis-loading-card">
          <mat-card-content class="loading-content">
            <mat-spinner diameter="50"></mat-spinner>
            <h3>Analyzing Document...</h3>
            <p>Our AI is analyzing the document content. This may take a few moments.</p>
          </mat-card-content>
        </mat-card>

        <!-- Analysis Results -->
        <div *ngIf="analysis && !isAnalyzing" class="analysis-results">
          <!-- Summary Card -->
          <mat-card class="summary-card">
            <mat-card-header>
              <mat-card-title> Executive Summary </mat-card-title>
              <mat-card-subtitle>
                Confidence: {{ analysis.confidence }}% | Analyzed:
                {{ analysis.analysisDate | date: 'medium' }}
              </mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p class="summary-text">{{ analysis.summary }}</p>
            </mat-card-content>
          </mat-card>

          <!-- Key Information -->
          <div class="info-grid">
            <mat-card class="key-terms-card">
              <mat-card-header>
                <mat-card-title> Key Terms </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <mat-chip-listbox class="terms-chips">
                  <mat-chip *ngFor="let term of analysis.keyTerms">
                    {{ term }}
                  </mat-chip>
                </mat-chip-listbox>
              </mat-card-content>
            </mat-card>

            <mat-card class="risk-factors-card">
              <mat-card-header>
                <mat-card-title> Risk Factors </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <ul class="risk-list">
                  <li *ngFor="let risk of analysis.riskFactors">{{ risk }}</li>
                </ul>
              </mat-card-content>
            </mat-card>

            <mat-card class="recommendations-card">
              <mat-card-header>
                <mat-card-title> Recommendations </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <ul class="recommendations-list">
                  <li *ngFor="let recommendation of analysis.recommendations">
                    {{ recommendation }}
                  </li>
                </ul>
              </mat-card-content>
            </mat-card>
          </div>

          <!-- Detailed Analysis Tabs -->
          <mat-card class="detailed-analysis-card">
            <mat-card-header>
              <mat-card-title> Detailed Analysis </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <mat-tab-group class="analysis-tabs">
                <mat-tab *ngFor="let section of analysis.sections" [label]="section.title">
                  <div class="tab-content">
                    <div class="section-header">
                      <span class="importance-badge" [class]="'importance-' + section.importance">
                        {{ section.importance | titlecase }} Priority
                      </span>
                    </div>
                    <p class="section-content">{{ section.content }}</p>
                    <div *ngIf="section.issues && section.issues.length > 0" class="section-issues">
                      <h4>Identified Issues:</h4>
                      <ul>
                        <li *ngFor="let issue of section.issues">{{ issue }}</li>
                      </ul>
                    </div>
                  </div>
                </mat-tab>
              </mat-tab-group>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- No Analysis State -->
        <mat-card *ngIf="!analysis && !isAnalyzing" class="no-analysis-card">
          <mat-card-content class="empty-state">
            <h3>No Analysis Available</h3>
            <p>
              This document hasn't been analyzed yet. Start an AI analysis to get insights about the
              document content.
            </p>
            <button mat-raised-button color="primary" (click)="startAnalysis()">
              Start Analysis
            </button>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [
    `
      .document-analysis-container {
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

      .document-info-card {
        margin-bottom: 24px;
      }

      .document-meta {
        display: flex;
        gap: 24px;
        flex-wrap: wrap;
      }

      .analysis-loading-card,
      .no-analysis-card {
        min-height: 300px;
      }

      .loading-content,
      .empty-state {
        text-align: center;
        padding: 48px 24px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;

        mat-icon {
          font-size: 64px;
          width: 64px;
          height: 64px;
          opacity: 0.5;
        }

        h3 {
          margin: 0;
          color: var(--text-primary);
        }

        p {
          margin: 0;
          color: var(--text-secondary);
        }
      }

      .analysis-results {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .summary-card {
        .summary-text {
          font-size: 16px;
          line-height: 1.6;
          margin: 0;
        }
      }

      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 24px;
      }

      .terms-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .risk-list,
      .recommendations-list {
        margin: 0;
        padding-left: 20px;

        li {
          margin-bottom: 8px;
        }
      }

      .detailed-analysis-card {
        min-height: 400px;
      }

      .analysis-tabs {
        .tab-content {
          padding: 24px 0;
        }

        .section-header {
          margin-bottom: 16px;
        }

        .importance-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;

          &.importance-high {
            background-color: #ffebee;
            color: #c62828;
          }

          &.importance-medium {
            background-color: #fff3e0;
            color: #ef6c00;
          }

          &.importance-low {
            background-color: #e8f5e8;
            color: #2e7d32;
          }
        }

        .section-content {
          font-size: 14px;
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .section-issues {
          background-color: #fff3e0;
          padding: 16px;
          border-radius: var(--border-radius);
          border-left: 4px solid #ff9800;

          h4 {
            margin: 0 0 12px 0;
            color: #ef6c00;
          }

          ul {
            margin: 0;
            padding-left: 20px;
          }
        }
      }

      @media (max-width: 768px) {
        .content {
          padding: 0 16px 16px;
        }

        .page-header {
          padding: 0 16px;
        }

        .document-meta {
          flex-direction: column;
          gap: 8px;
        }

        .info-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class DocumentAnalysisComponent implements OnInit {
  document: Document | null = null;
  analysis: DocumentAnalysis | null = null;
  documentId: string | null = null;
  isAnalyzing = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private documentsService: DocumentsService,
  ) {}

  ngOnInit(): void {
    this.documentId = this.route.snapshot.paramMap.get('id');
    if (this.documentId) {
      this.loadDocument();
      this.loadAnalysis();
    }
  }

  private loadDocument(): void {
    if (this.documentId) {
      this.documentsService.getDocument(Number(this.documentId)).subscribe({
        next: (document: Document) => {
          this.document = document;
        },
        error: (error: any) => {
          console.error('Error loading document:', error);
          this.router.navigate(['/documents']);
        },
      });
    }
  }

  private loadAnalysis(): void {
    // Mock analysis data - in a real app, this would come from an API
    setTimeout(() => {
      this.analysis = {
        id: '1',
        documentId: this.documentId!,
        summary:
          'This document appears to be a standard service agreement with typical terms and conditions. The contract includes provisions for service delivery, payment terms, liability limitations, and termination clauses. Overall risk level is considered low to moderate.',
        keyTerms: [
          'Service Agreement',
          'Payment Terms',
          'Liability',
          'Termination',
          'Confidentiality',
          'Intellectual Property',
        ],
        riskFactors: [
          'Broad liability limitation clauses that may be unfavorable',
          'Automatic renewal terms that could lock in unfavorable rates',
          'Insufficient termination notice period (30 days may not be adequate)',
        ],
        recommendations: [
          'Negotiate more balanced liability terms',
          'Add performance metrics and SLA requirements',
          'Include data protection and privacy clauses',
          'Consider adding dispute resolution mechanisms',
        ],
        confidence: 87,
        analysisDate: new Date(),
        sections: [
          {
            title: 'Service Terms',
            content:
              'The service terms section outlines the scope of work, deliverables, and performance expectations. The language is generally clear and reasonable.',
            importance: 'high',
            issues: ['Service scope could be more specific', 'Missing performance metrics'],
          },
          {
            title: 'Payment & Billing',
            content:
              'Payment terms are standard with net-30 payment periods. Invoice procedures are clearly defined.',
            importance: 'medium',
          },
          {
            title: 'Legal & Compliance',
            content:
              'Standard legal provisions including governing law, jurisdiction, and compliance requirements.',
            importance: 'high',
            issues: ['Consider adding data protection clauses', 'Review indemnification terms'],
          },
          {
            title: 'Termination',
            content:
              'Termination clauses allow for termination with 30-day notice. Includes provisions for early termination.',
            importance: 'medium',
          },
        ],
      };
    }, 2000);
  }

  startAnalysis(): void {
    this.isAnalyzing = true;
    this.loadAnalysis();
  }

  regenerateAnalysis(): void {
    this.analysis = null;
    this.startAnalysis();
  }

  goBack(): void {
    if (this.documentId) {
      this.router.navigate(['/documents', this.documentId]);
    } else {
      this.router.navigate(['/documents']);
    }
  }
}
