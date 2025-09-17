import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { DocumentsService } from '../../../../core/services/documents.service';
import { Document, DocumentAnalysis, Signer } from '../../../../core/models';

@Component({
  selector: 'app-document-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './document-detail.component.html',
  styleUrls: ['./document-detail.component.scss']
})
export class DocumentDetailComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly documentsService = inject(DocumentsService);
  private readonly destroy$ = new Subject<void>();

  // Component state
  document = signal<Document | null>(null);
  analysis = signal<DocumentAnalysis | null>(null);
  isLoading = signal<boolean>(false);
  isAnalyzing = signal<boolean>(false);
  error = signal<string | null>(null);

  // Computed properties
  hasDocument = computed(() => !!this.document());
  hasAnalysis = computed(() => !!this.analysis());
  signers = computed(() => this.document()?.signers || []);
  pendingSigners = computed(() =>
    this.signers().filter(signer => signer.status === 'pending')
  );
  completedSigners = computed(() =>
    this.signers().filter(signer => signer.status === 'signed')
  );
  isDocumentCompleted = computed(() =>
    this.document()?.status === 'completed'
  );
  canAnalyze = computed(() =>
    this.hasDocument() && !this.isAnalyzing()
  );

  ngOnInit(): void {
    this.loadDocumentData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load document data and analysis
   */
  private loadDocumentData(): void {
    const documentId = this.route.snapshot.paramMap.get('id');

    if (!documentId || isNaN(+documentId)) {
      this.error.set('Invalid document ID');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.documentsService.getDocument(+documentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (document) => {
          this.document.set(document);

          // Check for cached analysis
          const cachedAnalysis = this.documentsService.getCachedAnalysis(+documentId);
          if (cachedAnalysis) {
            this.analysis.set(cachedAnalysis);
          }

          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading document data:', error);
          this.error.set('Failed to load document details. Please try again.');
          this.isLoading.set(false);
        }
      });
  }

  /**
   * Analyze document with AI
   */
  onAnalyzeDocument(forceReanalysis: boolean = false): void {
    const doc = this.document();
    if (!doc || this.isAnalyzing()) return;

    this.isAnalyzing.set(true);
    this.error.set(null);

    this.documentsService.analyzeDocument(doc.id, forceReanalysis)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (analysis) => {
          this.analysis.set(analysis);
          this.isAnalyzing.set(false);
        },
        error: (error) => {
          console.error('Error analyzing document:', error);
          this.error.set('Failed to analyze document. Please try again.');
          this.isAnalyzing.set(false);
        }
      });
  }

  /**
   * Delete document with confirmation
   */
  onDeleteDocument(): void {
    const doc = this.document();
    if (!doc) return;

    const confirmed = confirm(
      `Are you sure you want to delete "${doc.name}"? This action cannot be undone.`
    );

    if (confirmed) {
      this.documentsService.deleteDocument(doc.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.router.navigate(['/companies', doc.company_id]);
          },
          error: (error) => {
            console.error('Error deleting document:', error);
            this.error.set('Failed to delete document. Please try again.');
          }
        });
    }
  }

  /**
   * Navigate back to company
   */
  onBackToCompany(): void {
    const doc = this.document();
    if (doc) {
      this.router.navigate(['/companies', doc.company_id]);
    } else {
      this.router.navigate(['/companies']);
    }
  }

  /**
   * Refresh document data
   */
  onRefresh(): void {
    this.loadDocumentData();
  }

  /**
   * Get status badge classes
   */
  getStatusClasses(status: string): string {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'expired':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Get processing status classes
   */
  getProcessingStatusClasses(status: string): string {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Get signer status classes
   */
  getSignerStatusClasses(status: string): string {
    switch (status) {
      case 'signed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Format date and time for display
   */
  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Track by function for signers list
   */
  trackBySigner(index: number, signer: Signer): number {
    return signer.id;
  }

  /**
   * Get signer initials
   */
  getSignerInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2); // Limit to 2 characters
  }

  /**
   * Export analysis results
   */
  onExportAnalysis(): void {
    const analysis = this.analysis();
    const doc = this.document();

    if (!analysis || !doc) return;

    const exportData = {
      document: {
        name: doc.name,
        company: doc.company?.name || `Company ID: ${doc.company_id}`,
        status: doc.status,
        analyzed_at: analysis.analyzed_at
      },
      analysis: {
        summary: analysis.summary,
        insights: analysis.insights,
        missing_topics: analysis.missing_topics
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${doc.name}-analysis.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}