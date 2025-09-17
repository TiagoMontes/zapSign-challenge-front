import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap, catchError, shareReplay } from 'rxjs/operators';
import { BaseApiService, RequestOptions } from './base-api.service';
import { CacheService } from './cache.service';
import { Company, CreateCompanyRequest, UpdateCompanyRequest } from '../models';

/**
 * Service for managing companies with comprehensive CRUD operations,
 * caching, error handling, and real-time state management.
 */
@Injectable({
  providedIn: 'root'
})
export class CompaniesService extends BaseApiService {

  // State management for companies
  private companiesSubject = new BehaviorSubject<Company[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private selectedCompanySubject = new BehaviorSubject<Company | null>(null);

  // Public observables for components
  public readonly companies$ = this.companiesSubject.asObservable();
  public readonly loading$ = this.loadingSubject.asObservable();
  public readonly selectedCompany$ = this.selectedCompanySubject.asObservable();

  // Cache configuration
  private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes
  private readonly COMPANIES_CACHE_KEY = 'companies:list';

  /**
   * Get all companies with caching and state management
   */
  getCompanies(forceRefresh: boolean = false): Observable<Company[]> {
    const options: RequestOptions = {
      cache: !forceRefresh,
      cacheOptions: {
        ttl: this.CACHE_TTL,
        staleWhileRevalidate: true
      },
      cacheKey: this.COMPANIES_CACHE_KEY,
      retry: true
    };

    if (forceRefresh) {
      this.invalidateCache(this.COMPANIES_CACHE_KEY);
    }

    this.loadingSubject.next(true);

    return this.get<Company[]>('/companies/', options).pipe(
      tap(companies => {
        this.companiesSubject.next(companies);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        // Return cached data if available on error
        const cached = this.cacheService.get<Company[]>(this.COMPANIES_CACHE_KEY);
        if (cached) {
          this.companiesSubject.next(cached);
          return of(cached);
        }
        throw error;
      }),
      shareReplay(1)
    );
  }

  /**
   * Get a specific company by ID with caching
   */
  getCompany(id: number, useCache: boolean = true): Observable<Company> {
    const cacheKey = CacheService.generateEntityKey('company', id);
    const options: RequestOptions = {
      cache: useCache,
      cacheOptions: { ttl: this.CACHE_TTL },
      cacheKey,
      retry: true
    };

    return this.get<Company>(`/companies/${id}/`, options).pipe(
      tap(company => {
        // Update selected company if it matches
        const current = this.selectedCompanySubject.value;
        if (current?.id === id) {
          this.selectedCompanySubject.next(company);
        }

        // Update company in the list if loaded
        this.updateCompanyInList(company);
      }),
      shareReplay(1)
    );
  }

  /**
   * Create a new company
   */
  createCompany(companyData: CreateCompanyRequest): Observable<Company> {
    return this.post<Company>('/companies/', companyData, { retry: true }).pipe(
      tap(newCompany => {
        // Add to current list
        const currentCompanies = this.companiesSubject.value;
        this.companiesSubject.next([...currentCompanies, newCompany]);

        // Invalidate list cache to ensure consistency
        this.invalidateCache(this.COMPANIES_CACHE_KEY);
      })
    );
  }

  /**
   * Update an existing company
   */
  updateCompany(id: number, companyData: UpdateCompanyRequest): Observable<Company> {
    return this.put<Company>(`/companies/${id}/`, companyData, { retry: true }).pipe(
      tap(updatedCompany => {
        // Update in current list
        this.updateCompanyInList(updatedCompany);

        // Update selected company if it matches
        const current = this.selectedCompanySubject.value;
        if (current?.id === id) {
          this.selectedCompanySubject.next(updatedCompany);
        }

        // Invalidate related caches
        this.invalidateCompanyCache(id);
      })
    );
  }

  /**
   * Partially update a company using PATCH
   */
  patchCompany(id: number, companyData: Partial<UpdateCompanyRequest>): Observable<Company> {
    return this.patch<Company>(`/companies/${id}/`, companyData, { retry: true }).pipe(
      tap(updatedCompany => {
        this.updateCompanyInList(updatedCompany);

        const current = this.selectedCompanySubject.value;
        if (current?.id === id) {
          this.selectedCompanySubject.next(updatedCompany);
        }

        this.invalidateCompanyCache(id);
      })
    );
  }

  /**
   * Delete a company
   */
  deleteCompany(id: number): Observable<void> {
    return this.delete<void>(`/companies/${id}/`, { retry: false }).pipe(
      tap(() => {
        // Remove from current list
        const currentCompanies = this.companiesSubject.value;
        const updatedCompanies = currentCompanies.filter(company => company.id !== id);
        this.companiesSubject.next(updatedCompanies);

        // Clear selected company if it was deleted
        const current = this.selectedCompanySubject.value;
        if (current?.id === id) {
          this.selectedCompanySubject.next(null);
        }

        // Invalidate caches
        this.invalidateCompanyCache(id);
      })
    );
  }

  /**
   * Set the selected company
   */
  setSelectedCompany(company: Company | null): void {
    this.selectedCompanySubject.next(company);
  }

  /**
   * Search companies by name (client-side filtering)
   */
  searchCompanies(query: string): Observable<Company[]> {
    if (!query.trim()) {
      return this.companies$;
    }

    return this.companies$.pipe(
      map((companies: Company[]) =>
        companies.filter((company: Company) =>
          company.name.toLowerCase().includes(query.toLowerCase())
        )
      )
    );
  }

  /**
   * Get companies count
   */
  getCompaniesCount(): Observable<number> {
    return this.companies$.pipe(
      map((companies: Company[]) => companies.length)
    );
  }

  /**
   * Check if a company exists by name
   */
  companyExistsByName(name: string, excludeId?: number): Observable<boolean> {
    return this.companies$.pipe(
      map((companies: Company[]) =>
        companies.some((company: Company) =>
          company.name.toLowerCase() === name.toLowerCase() &&
          company.id !== excludeId
        )
      )
    );
  }

  /**
   * Refresh companies data
   */
  refreshCompanies(): Observable<Company[]> {
    return this.getCompanies(true);
  }

  /**
   * Clear all company-related state and cache
   */
  clearState(): void {
    this.companiesSubject.next([]);
    this.selectedCompanySubject.next(null);
    this.loadingSubject.next(false);
    this.clearAllCache();
  }

  /**
   * Preload company data (useful for app initialization)
   */
  preloadCompanies(): Observable<Company[]> {
    // Check if we already have data
    if (this.companiesSubject.value.length > 0) {
      return of(this.companiesSubject.value);
    }

    return this.getCompanies();
  }

  // Private helper methods

  /**
   * Update a company in the current list
   */
  private updateCompanyInList(updatedCompany: Company): void {
    const currentCompanies = this.companiesSubject.value;
    const index = currentCompanies.findIndex(company => company.id === updatedCompany.id);

    if (index !== -1) {
      const updatedCompanies = [...currentCompanies];
      updatedCompanies[index] = updatedCompany;
      this.companiesSubject.next(updatedCompanies);
    }
  }

  /**
   * Invalidate all cache entries related to a specific company
   */
  private invalidateCompanyCache(id: number): void {
    // Invalidate company list cache
    this.invalidateCache(this.COMPANIES_CACHE_KEY);

    // Invalidate specific company cache
    const entityCacheKey = CacheService.generateEntityKey('company', id);
    this.invalidateCache(entityCacheKey);

    // Invalidate any related patterns
    this.invalidateCache(new RegExp(`companies.*${id}`));
  }
}