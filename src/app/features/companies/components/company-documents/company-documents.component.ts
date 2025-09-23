import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, startWith, forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { CompaniesService } from '../../../../core/services/companies.service';
import { Company } from '../../../../core/models/company.interface';

// Mock Document interface (replace with actual when available)
interface Document {
  id: number;
  name: string;
  status: 'draft' | 'pending' | 'signed' | 'cancelled' | 'expired';
  created_at: string;
  updated_at: string;
  company_id: number;
  signers_count: number;
  file_url?: string;
  file_size?: number;
}

@Component({
  selector: 'app-company-documents',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './company-documents.component.html',
})
export class CompanyDocumentsComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly companiesService = inject(CompaniesService);
  private readonly destroy$ = new Subject<void>();

  // Search functionality
  searchControl = new FormControl('');

  // Component state
  company = signal<Company | null>(null);
  documents = signal<Document[]>([]);
  filteredDocuments = signal<Document[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Statistics
  totalDocuments = signal<number>(0);
  draftDocuments = signal<number>(0);
  pendingDocuments = signal<number>(0);
  signedDocuments = signal<number>(0);

  // Computed properties
  hasCompany = computed(() => !!this.company());
  hasDocuments = computed(() => this.documents().length > 0);
  hasFilteredResults = computed(() => this.filteredDocuments().length > 0);
  showNoResults = computed(
    () => this.hasDocuments() && !this.hasFilteredResults() && this.searchControl.value?.trim(),
  );

  // Table configuration
  displayedColumns: string[] = ['name', 'status', 'signers', 'created_at', 'actions'];

  ngOnInit(): void {
    this.loadCompanyAndDocuments();
    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load company and its documents
   */
  private loadCompanyAndDocuments(): void {
    const companyId = this.route.snapshot.paramMap.get('id');

    if (!companyId || isNaN(+companyId)) {
      this.error.set('Invalid company ID');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    forkJoin({
      company: this.companiesService.getCompany(+companyId),
      documents: this.loadDocuments(+companyId),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.company.set(data.company);
          this.documents.set(data.documents);
          this.applyFilter(this.searchControl.value || '');
          this.updateStatistics(data.documents);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading company documents:', error);
          this.error.set('Failed to load company documents. Please try again.');
          this.isLoading.set(false);
          this.showErrorMessage('Failed to load company documents');
        },
      });
  }

  /**
   * Load documents for the company (mocked)
   */
  private loadDocuments(companyId: number): Promise<Document[]> {
    // This would be replaced with actual DocumentsService call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            name: 'Service Agreement 2024',
            status: 'signed',
            created_at: '2024-01-15T10:30:00Z',
            updated_at: '2024-01-16T14:20:00Z',
            company_id: companyId,
            signers_count: 2,
            file_size: 1024000,
          },
          {
            id: 2,
            name: 'NDA Template',
            status: 'pending',
            created_at: '2024-01-10T14:20:00Z',
            updated_at: '2024-01-10T14:20:00Z',
            company_id: companyId,
            signers_count: 1,
            file_size: 512000,
          },
          {
            id: 3,
            name: 'Employment Contract - Draft',
            status: 'draft',
            created_at: '2024-01-05T09:15:00Z',
            updated_at: '2024-01-05T09:15:00Z',
            company_id: companyId,
            signers_count: 0,
            file_size: 256000,
          },
          {
            id: 4,
            name: 'Expired Contract',
            status: 'expired',
            created_at: '2023-12-01T10:00:00Z',
            updated_at: '2023-12-31T23:59:59Z',
            company_id: companyId,
            signers_count: 1,
            file_size: 128000,
          },
          {
            id: 5,
            name: 'Cancelled Document',
            status: 'cancelled',
            created_at: '2024-01-08T16:30:00Z',
            updated_at: '2024-01-09T10:15:00Z',
            company_id: companyId,
            signers_count: 0,
            file_size: 64000,
          },
        ]);
      }, 800);
    });
  }

  /**
   * Setup search functionality with debouncing
   */
  private setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(startWith(''), debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((searchTerm) => {
        this.applyFilter(searchTerm || '');
      });
  }

  /**
   * Apply search filter to documents
   */
  private applyFilter(searchTerm: string): void {
    const filtered = this.documents().filter(
      (document) =>
        document.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        document.status.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    this.filteredDocuments.set(filtered);
  }

  /**
   * Update statistics based on documents
   */
  private updateStatistics(documents: Document[]): void {
    this.totalDocuments.set(documents.length);
    this.draftDocuments.set(documents.filter((d) => d.status === 'draft').length);
    this.pendingDocuments.set(documents.filter((d) => d.status === 'pending').length);
    this.signedDocuments.set(documents.filter((d) => d.status === 'signed').length);
  }

  /**
   * Refresh documents data
   */
  onRefresh(): void {
    this.loadCompanyAndDocuments();
  }

  /**
   * Clear search filter
   */
  onClearSearch(): void {
    this.searchControl.setValue('');
  }

  /**
   * Navigate back to company details
   */
  onGoBack(): void {
    const company = this.company();
    if (company) {
      this.router.navigate(['/companies', company.id]);
    } else {
      this.router.navigate(['/companies']);
    }
  }

  /**
   * Navigate to create new document
   */
  onCreateDocument(): void {
    const company = this.company();
    if (company) {
      this.router.navigate(['/documents/create'], {
        queryParams: { companyId: company.id },
      });
    }
  }

  /**
   * Navigate to document details
   */
  onViewDocument(document: Document): void {
    this.router.navigate(['/documents', document.id]);
  }

  /**
   * Navigate to edit document
   */
  onEditDocument(document: Document): void {
    this.router.navigate(['/documents', document.id, 'edit']);
  }

  /**
   * Navigate to document analysis
   */
  onAnalyzeDocument(document: Document): void {
    this.router.navigate(['/documents', document.id, 'analysis']);
  }

  /**
   * Delete document with confirmation
   */
  onDeleteDocument(document: Document): void {
    const confirmed = confirm(
      `Are you sure you want to delete "${document.name}"? This action cannot be undone.`,
    );
    if (confirmed) {
      this.deleteDocument(document);
    }
  }

  /**
   * Execute document deletion (mocked)
   */
  private deleteDocument(document: Document): void {
    // This would be replaced with actual DocumentsService call
    const currentDocuments = this.documents();
    const updatedDocuments = currentDocuments.filter((d) => d.id !== document.id);

    this.documents.set(updatedDocuments);
    this.applyFilter(this.searchControl.value || '');
    this.updateStatistics(updatedDocuments);

    this.showSuccessMessage(`Document "${document.name}" deleted successfully`);
  }

  /**
   * Download document
   */
  onDownloadDocument(document: Document): void {
    // This would be replaced with actual file download logic
    this.showSuccessMessage(`Downloading "${document.name}"...`);
  }

  /**
   * Get status color for documents
   */
  getDocumentStatusColor(status: string): string {
    switch (status) {
      case 'signed':
        return 'primary';
      case 'pending':
        return 'accent';
      case 'draft':
        return '';
      case 'expired':
      case 'cancelled':
        return 'warn';
      default:
        return '';
    }
  }

  /**
   * Get status icon for documents
   */
  getDocumentStatusIcon(status: string): string {
    switch (status) {
      case 'signed':
        return 'check_circle';
      case 'pending':
        return 'schedule';
      case 'draft':
        return 'edit';
      case 'expired':
        return 'access_time';
      case 'cancelled':
        return 'cancel';
      default:
        return 'description';
    }
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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
      minute: '2-digit',
    });
  }

  /**
   * Show success message
   */
  private showSuccessMessage(message: string): void {
    // TODO: Implement toast notification
    // TODO: Implement toast notification
  }

  /**
   * Show error message
   */
  private showErrorMessage(message: string): void {
    console.error('Error:', message);
    // TODO: Implement toast notification
  }

  /**
   * Track by function for documents list
   */
  trackByDocument(_index: number, document: Document): number {
    return document.id;
  }
}
