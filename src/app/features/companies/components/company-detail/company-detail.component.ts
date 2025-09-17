import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil, forkJoin, switchMap } from 'rxjs';
import { SharedModule } from '../../../../shared/shared.module';
import { CompaniesService } from '../../../../core/services/companies.service';
import { Company } from '../../../../core/models/company.interface';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';

// Mock interfaces for documents and signers (replace with actual ones when available)
interface Document {
  id: number;
  name: string;
  status: 'pending' | 'signed' | 'cancelled';
  created_at: string;
  signers_count: number;
}

interface Signer {
  id: number;
  name: string;
  email: string;
  status: 'pending' | 'signed';
  signed_at?: string;
}

@Component({
  selector: 'app-company-detail',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './company-detail.component.html',
  styleUrls: ['./company-detail.component.scss']
})
export class CompanyDetailComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly companiesService = inject(CompaniesService);
  private readonly destroy$ = new Subject<void>();

  // Component state
  company = signal<Company | null>(null);
  recentDocuments = signal<Document[]>([]);
  recentSigners = signal<Signer[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Stats
  totalDocuments = signal<number>(0);
  totalSigners = signal<number>(0);
  pendingDocuments = signal<number>(0);
  signedDocuments = signal<number>(0);

  // Computed properties
  hasCompany = computed(() => !!this.company());
  hasDocuments = computed(() => this.recentDocuments().length > 0);
  hasSigners = computed(() => this.recentSigners().length > 0);
  companyAge = computed(() => {
    const company = this.company();
    if (!company) return '';

    const created = new Date(company.created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 day ago';
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  });

  ngOnInit(): void {
    this.loadCompanyData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load company data and related information
   */
  private loadCompanyData(): void {
    const companyId = this.route.snapshot.paramMap.get('id');

    if (!companyId || isNaN(+companyId)) {
      this.error.set('Invalid company ID');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.companiesService.getCompany(+companyId)
      .pipe(
        switchMap(company => {
          this.company.set(company);

          // Load related data (mocked for now)
          return forkJoin({
            documents: this.loadRecentDocuments(company.id),
            signers: this.loadRecentSigners(company.id),
            stats: this.loadCompanyStats(company.id)
          });
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (data) => {
          this.recentDocuments.set(data.documents);
          this.recentSigners.set(data.signers);
          this.updateStats(data.stats);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading company data:', error);
          this.error.set('Failed to load company details. Please try again.');
          this.isLoading.set(false);
          this.showErrorMessage('Failed to load company details');
        }
      });
  }

  /**
   * Load recent documents for the company (mocked)
   */
  private loadRecentDocuments(companyId: number): Promise<Document[]> {
    // This would be replaced with actual DocumentsService call
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            name: 'Service Agreement 2024',
            status: 'signed',
            created_at: '2024-01-15T10:30:00Z',
            signers_count: 2
          },
          {
            id: 2,
            name: 'NDA Template',
            status: 'pending',
            created_at: '2024-01-10T14:20:00Z',
            signers_count: 1
          },
          {
            id: 3,
            name: 'Employment Contract',
            status: 'signed',
            created_at: '2024-01-05T09:15:00Z',
            signers_count: 3
          }
        ]);
      }, 500);
    });
  }

  /**
   * Load recent signers for the company (mocked)
   */
  private loadRecentSigners(companyId: number): Promise<Signer[]> {
    // This would be replaced with actual SignersService call
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            name: 'John Doe',
            email: 'john.doe@example.com',
            status: 'signed',
            signed_at: '2024-01-15T10:30:00Z'
          },
          {
            id: 2,
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            status: 'pending'
          },
          {
            id: 3,
            name: 'Bob Johnson',
            email: 'bob.johnson@example.com',
            status: 'signed',
            signed_at: '2024-01-10T16:45:00Z'
          }
        ]);
      }, 500);
    });
  }

  /**
   * Load company statistics (mocked)
   */
  private loadCompanyStats(companyId: number): Promise<{
    totalDocuments: number;
    totalSigners: number;
    pendingDocuments: number;
    signedDocuments: number;
  }> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          totalDocuments: 15,
          totalSigners: 42,
          pendingDocuments: 3,
          signedDocuments: 12
        });
      }, 300);
    });
  }

  /**
   * Update statistics signals
   */
  private updateStats(stats: any): void {
    this.totalDocuments.set(stats.totalDocuments);
    this.totalSigners.set(stats.totalSigners);
    this.pendingDocuments.set(stats.pendingDocuments);
    this.signedDocuments.set(stats.signedDocuments);
  }

  /**
   * Navigate to edit company
   */
  onEditCompany(): void {
    const company = this.company();
    if (company) {
      this.router.navigate(['/companies', company.id, 'edit']);
    }
  }

  /**
   * Delete company with confirmation
   */
  onDeleteCompany(): void {
    const company = this.company();
    if (!company) return;

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Delete Company',
        message: `Are you sure you want to delete "${company.name}"? This will also delete all associated documents and signers. This action cannot be undone.`,
        confirmText: 'Delete Company',
        cancelText: 'Cancel',
        type: 'danger'
      }
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.deleteCompany(company);
        }
      });
  }

  /**
   * Execute company deletion
   */
  private deleteCompany(company: Company): void {
    this.companiesService.deleteCompany(company.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccessMessage(`Company "${company.name}" deleted successfully`);
          this.router.navigate(['/companies']);
        },
        error: (error) => {
          console.error('Error deleting company:', error);
          this.showErrorMessage('Failed to delete company. Please try again.');
        }
      });
  }

  /**
   * Navigate to company documents
   */
  onViewAllDocuments(): void {
    const company = this.company();
    if (company) {
      this.router.navigate(['/companies', company.id, 'documents']);
    }
  }

  /**
   * Navigate to specific document
   */
  onViewDocument(document: Document): void {
    // This would navigate to document details
    this.router.navigate(['/documents', document.id]);
  }

  /**
   * Navigate to all signers (hypothetical route)
   */
  onViewAllSigners(): void {
    const company = this.company();
    if (company) {
      // This would be a route to view all signers for this company
      this.router.navigate(['/companies', company.id, 'signers']);
    }
  }

  /**
   * Navigate to specific signer (hypothetical route)
   */
  onViewSigner(signer: Signer): void {
    // This would navigate to signer details
    this.router.navigate(['/signers', signer.id]);
  }

  /**
   * Copy API token to clipboard
   */
  onCopyApiToken(): void {
    const company = this.company();
    if (!company) return;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(company.api_token).then(() => {
        this.showSuccessMessage('API token copied to clipboard');
      }).catch(() => {
        this.showErrorMessage('Failed to copy token to clipboard');
      });
    } else {
      // Fallback for browsers without clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = company.api_token;
      document.body.appendChild(textArea);
      textArea.select();

      try {
        document.execCommand('copy');
        this.showSuccessMessage('API token copied to clipboard');
      } catch (err) {
        this.showErrorMessage('Failed to copy token to clipboard');
      }

      document.body.removeChild(textArea);
    }
  }

  /**
   * Refresh company data
   */
  onRefresh(): void {
    this.loadCompanyData();
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
      case 'cancelled':
        return 'cancel';
      default:
        return 'description';
    }
  }

  /**
   * Get status color for signers
   */
  getSignerStatusColor(status: string): string {
    switch (status) {
      case 'signed':
        return 'primary';
      case 'pending':
        return 'accent';
      default:
        return '';
    }
  }

  /**
   * Get status icon for signers
   */
  getSignerStatusIcon(status: string): string {
    switch (status) {
      case 'signed':
        return 'check_circle';
      case 'pending':
        return 'schedule';
      default:
        return 'person';
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
   * Truncate API token for display
   */
  getTruncatedToken(token: string): string {
    if (token.length <= 12) return token;
    return `${token.substring(0, 8)}...${token.substring(token.length - 4)}`;
  }

  /**
   * Show success message
   */
  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  /**
   * Show error message
   */
  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  /**
   * Track by function for documents list
   */
  trackByDocument(index: number, document: Document): number {
    return document.id;
  }

  /**
   * Track by function for signers list
   */
  trackBySigner(index: number, signer: Signer): number {
    return signer.id;
  }
}