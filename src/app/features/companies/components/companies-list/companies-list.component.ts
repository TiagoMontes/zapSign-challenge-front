import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, startWith } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CompaniesService } from '../../../../core/services/companies.service';
import { Company } from '../../../../core/models/company.interface';

@Component({
  selector: 'app-companies-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './companies-list.component.html',
  styleUrls: ['./companies-list.component.scss']
})
export class CompaniesListComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
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
          this.error.set('Falhou ao carregar empresas. Tente novamente.');
          this.loading.set(false);
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
          console.log('Companies refreshed successfully');
        },
        error: () => {
          console.error('Failed to refresh companies');
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
   * Delete company with confirmation
   */
  onDeleteCompany(company: Company): void {
    const confirmed = confirm(`Are you sure you want to delete "${company.name}"? This action cannot be undone.`);
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
        },
        error: (error) => {
          console.error('Error deleting company:', error);
          alert('Falhou ao excluir empresa. Tente novamente.');
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
   * Copy token to clipboard
   */
  copyToken(token: string, event: Event): void {
    event.stopPropagation();
    navigator.clipboard.writeText(token).then(() => {
      console.log('Token copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy token:', err);
    });
  }

  /**
   * Track by function for company list
   */
  trackByCompany(index: number, company: Company): number {
    return company.id;
  }
}