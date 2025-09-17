import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { DocumentsService } from '../../../../core/services/documents.service';
import { Document, DocumentAnalysis, Signer } from '../../../../core/models';
import { SignerStatusComponent } from '../../../signers/components/signer-status/signer-status.component';

@Component({
  selector: 'app-document-detail',
  standalone: true,
  imports: [CommonModule, SignerStatusComponent],
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
      case 'new':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      case 'invited':
        return 'bg-blue-100 text-blue-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Get user-friendly signer status label
   */
  getSignerStatusLabel(status: string): string {
    switch (status) {
      case 'new':
        return 'Pending';
      case 'signed':
        return 'Signed';
      case 'declined':
        return 'Declined';
      case 'invited':
        return 'Invited';
      case 'error':
        return 'Error';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  }

  /**
   * Navigate to signer detail page with document context
   */
  onSignerClick(signerId: number): void {
    const doc = this.document();
    this.router.navigate(['/signers', signerId], {
      state: { documentId: doc?.id, documentName: doc?.name }
    });
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
   * Format missing topics by removing surrounding quotes
   */
  formatMissingTopic(topic: string): string {
    if (!topic) return '';

    // Remove surrounding quotes if they exist
    let cleanTopic = topic.trim();
    if ((cleanTopic.startsWith('"') && cleanTopic.endsWith('"')) ||
        (cleanTopic.startsWith("'") && cleanTopic.endsWith("'"))) {
      cleanTopic = cleanTopic.slice(1, -1);
    }

    return cleanTopic;
  }

  /**
   * Format insights from numbered list to bullet points array
   */
  formatInsights(insights: string): string[] {
    if (!insights) return [];

    // Split by numbered pattern (1., 2., 3., etc.) followed by space
    const items = insights.split(/\d+\.\s*/).filter(item => item.trim().length > 0);

    // Remove trailing commas and clean up each item
    return items.map(item => {
      let cleanItem = item.trim();
      // Remove trailing comma if it exists
      if (cleanItem.endsWith(',')) {
        cleanItem = cleanItem.slice(0, -1);
      }
      return cleanItem;
    });
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