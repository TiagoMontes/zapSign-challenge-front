import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, switchMap, startWith, combineLatest } from 'rxjs';
import { FormControl } from '@angular/forms';
import { SharedModule } from '../../../../shared/shared.module';
import { CompaniesService } from '../../../../core/services/companies.service';
import { Company } from '../../../../core/models/company.interface';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-companies-list',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './companies-list.component.html',
  styleUrls: ['./companies-list.component.scss']
})
export class CompaniesListComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly companiesService = inject(CompaniesService);
  private readonly destroy$ = new Subject<void>();

  // Search functionality
  searchControl = new FormControl('');

  // Component state signals
  companies = signal<Company[]>([]);
  filteredCompanies = signal<Company[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Computed properties
  hasCompanies = computed(() => this.companies().length > 0);
  hasFilteredResults = computed(() => this.filteredCompanies().length > 0);
  showNoResults = computed(() =>
    this.hasCompanies() && !this.hasFilteredResults() && this.searchControl.value?.trim()
  );

  // Table configuration
  displayedColumns: string[] = ['name', 'api_token', 'created_at', 'actions'];

  ngOnInit(): void {
    this.loadCompanies();
    this.setupSearch();
    this.subscribeToCompaniesUpdates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load companies from service
   */
  private loadCompanies(): void {
    this.loading.set(true);
    this.error.set(null);

    this.companiesService.getCompanies()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (companies) => {
          this.companies.set(companies);
          this.applyFilter(this.searchControl.value || '');
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error loading companies:', error);
          this.error.set('Failed to load companies. Please try again.');
          this.loading.set(false);
          this.showErrorMessage('Failed to load companies');
        }
      });
  }

  /**
   * Setup search functionality with debouncing
   */
  private setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(
        startWith(''),
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(searchTerm => {
        this.applyFilter(searchTerm || '');
      });
  }

  /**
   * Subscribe to real-time company updates
   */
  private subscribeToCompaniesUpdates(): void {
    this.companiesService.companies$
      .pipe(takeUntil(this.destroy$))
      .subscribe((companies: Company[]) => {
        this.companies.set(companies);
        this.applyFilter(this.searchControl.value || '');
      });
  }

  /**
   * Apply search filter to companies
   */
  private applyFilter(searchTerm: string): void {
    const filtered = this.companies().filter(company =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.api_token.toLowerCase().includes(searchTerm.toLowerCase())
    );
    this.filteredCompanies.set(filtered);
  }

  /**
   * Refresh companies data
   */
  onRefresh(): void {
    this.companiesService.refreshCompanies()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccessMessage('Companies refreshed successfully');
        },
        error: () => {
          this.showErrorMessage('Failed to refresh companies');
        }
      });
  }

  /**
   * Clear search filter
   */
  onClearSearch(): void {
    this.searchControl.setValue('');
  }

  /**
   * Navigate to create company form
   */
  onCreateCompany(): void {
    this.router.navigate(['/companies/create']);
  }

  /**
   * Navigate to company details
   */
  onViewCompany(company: Company): void {
    this.router.navigate(['/companies', company.id]);
  }

  /**
   * Navigate to edit company form
   */
  onEditCompany(company: Company): void {
    this.router.navigate(['/companies', company.id, 'edit']);
  }

  /**
   * Navigate to company documents
   */
  onViewDocuments(company: Company): void {
    this.router.navigate(['/companies', company.id, 'documents']);
  }

  /**
   * Delete company with confirmation
   */
  onDeleteCompany(company: Company): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Delete Company',
        message: `Are you sure you want to delete "${company.name}"? This action cannot be undone.`,
        confirmText: 'Delete',
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
        },
        error: (error) => {
          console.error('Error deleting company:', error);
          this.showErrorMessage('Failed to delete company. Please try again.');
        }
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
   * Track by function for company list
   */
  trackByCompany(index: number, company: Company): number {
    return company.id;
  }
}