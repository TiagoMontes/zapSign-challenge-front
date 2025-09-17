import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { CompaniesService } from '../../../../core/services/companies.service';
import { Company, CompanyDocument } from '../../../../core/models/company.interface';

@Component({
  selector: 'app-company-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './company-detail.component.html',
  styleUrls: ['./company-detail.component.scss']
})
export class CompanyDetailComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly companiesService = inject(CompaniesService);
  private readonly destroy$ = new Subject<void>();

  // Component state
  company = signal<Company | null>(null);
  companyDocuments = signal<CompanyDocument[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Computed properties
  hasCompany = computed(() => !!this.company());
  hasDocuments = computed(() => this.companyDocuments().length > 0);
  totalDocuments = computed(() => this.companyDocuments().length);
  pendingDocuments = computed(() =>
    this.companyDocuments().filter(doc => doc.status === 'pending').length
  );
  completedDocuments = computed(() =>
    this.companyDocuments().filter(doc => doc.status === 'completed').length
  );
  totalSigners = computed(() =>
    this.companyDocuments().reduce((total, doc) => total + (doc.signers_count || 0), 0)
  );
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
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (company) => {
          this.company.set(company);
          this.companyDocuments.set(company.documents || []);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading company data:', error);
          this.error.set('Failed to load company details. Please try again.');
          this.isLoading.set(false);
        }
      });
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

    const confirmed = confirm(`Are you sure you want to delete "${company.name}"? This will also delete all associated documents and signers. This action cannot be undone.`);
    if (confirmed) {
      this.deleteCompany(company);
    }
  }

  /**
   * Execute company deletion
   */
  private deleteCompany(company: Company): void {
    this.companiesService.deleteCompany(company.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log(`Company "${company.name}" deleted successfully`);
          this.router.navigate(['/companies']);
        },
        error: (error) => {
          console.error('Error deleting company:', error);
          alert('Failed to delete company. Please try again.');
        }
      });
  }

  /**
   * Navigate to create document for this company
   */
  onCreateDocument(): void {
    const company = this.company();
    if (company) {
      this.router.navigate(['/documents/create'], {
        queryParams: { companyId: company.id }
      });
    }
  }

  /**
   * Navigate to specific document
   */
  onViewDocument(document: CompanyDocument): void {
    this.router.navigate(['/documents', document.id]);
  }

  /**
   * Copy API token to clipboard
   */
  onCopyApiToken(): void {
    const company = this.company();
    if (!company) return;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(company.api_token).then(() => {
        console.log('API token copied to clipboard');
      }).catch(() => {
        console.error('Failed to copy token to clipboard');
      });
    } else {
      // Fallback for browsers without clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = company.api_token;
      document.body.appendChild(textArea);
      textArea.select();

      try {
        document.execCommand('copy');
        console.log('API token copied to clipboard');
      } catch (err) {
        console.error('Failed to copy token to clipboard');
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
   * Get status badge classes for documents
   */
  getDocumentStatusClasses(status: string): string {
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
   * Track by function for documents list
   */
  trackByDocument(index: number, document: CompanyDocument): number {
    return document.id;
  }
}