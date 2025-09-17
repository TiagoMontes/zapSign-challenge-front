import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, of, forkJoin } from 'rxjs';
import { map, tap, catchError, shareReplay, filter, switchMap } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { BaseApiService, RequestOptions } from './base-api.service';
import { CacheService } from './cache.service';
import {
  Signer,
  CreateSignerRequest,
  UpdateSignerRequest,
  SignerStatus,
  Document
} from '../models';

/**
 * Query parameters for filtering signers
 */
export interface SignersQuery {
  documentId?: number;
  status?: SignerStatus;
  email?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Signer statistics interface
 */
export interface SignerStats {
  total: number;
  pending: number;
  signed: number;
  declined: number;
  expired: number;
}

/**
 * Service for managing signers with comprehensive CRUD operations,
 * caching, filtering, and real-time state management.
 */
@Injectable({
  providedIn: 'root'
})
export class SignersService extends BaseApiService {

  // State management for signers
  private signersSubject = new BehaviorSubject<Signer[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private selectedSignerSubject = new BehaviorSubject<Signer | null>(null);
  private signersByDocumentSubject = new BehaviorSubject<Map<number, Signer[]>>(new Map());

  // Public observables for components
  public readonly signers$ = this.signersSubject.asObservable();
  public readonly loading$ = this.loadingSubject.asObservable();
  public readonly selectedSigner$ = this.selectedSignerSubject.asObservable();
  public readonly signersByDocument$ = this.signersByDocumentSubject.asObservable();

  // Cache configuration
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly SIGNERS_CACHE_KEY = 'signers:list';

  /**
   * Get signers with optional filtering and caching
   */
  getSigners(query: SignersQuery = {}, forceRefresh: boolean = false): Observable<Signer[]> {
    const params = this.buildHttpParams(query);
    const cacheKey = CacheService.generateListKey('signers', query);

    const options: RequestOptions = {
      cache: !forceRefresh,
      cacheOptions: {
        ttl: this.CACHE_TTL,
        staleWhileRevalidate: true
      },
      cacheKey,
      retry: true,
      params
    };

    if (forceRefresh) {
      this.invalidateCache(cacheKey);
    }

    this.loadingSubject.next(true);

    return this.get<Signer[]>('/signers/', options).pipe(
      tap(signers => {
        // Update the main signers subject if no specific filters
        if (!query.documentId && !query.status && !query.search) {
          this.signersSubject.next(signers);
        }

        // Update signers by document if filtering by document
        if (query.documentId) {
          this.updateSignersByDocument(query.documentId, signers);
        }

        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        // Return cached data if available on error
        const cached = this.cacheService.get<Signer[]>(cacheKey);
        if (cached) {
          return of(cached);
        }
        throw error;
      }),
      shareReplay(1)
    );
  }

  /**
   * Get signers by document ID
   */
  getSignersByDocument(documentId: number, forceRefresh: boolean = false): Observable<Signer[]> {
    return this.getSigners({ documentId }, forceRefresh);
  }

  /**
   * Get signers by status
   */
  getSignersByStatus(status: SignerStatus, forceRefresh: boolean = false): Observable<Signer[]> {
    return this.getSigners({ status }, forceRefresh);
  }

  /**
   * Get a specific signer by ID with caching
   */
  getSigner(id: number, useCache: boolean = true): Observable<Signer> {
    const cacheKey = CacheService.generateEntityKey('signer', id);
    const options: RequestOptions = {
      cache: useCache,
      cacheOptions: { ttl: this.CACHE_TTL },
      cacheKey,
      retry: true
    };

    return this.get<Signer>(`/signers/${id}/`, options).pipe(
      tap(signer => {
        // Update selected signer if it matches
        const current = this.selectedSignerSubject.value;
        if (current?.id === id) {
          this.selectedSignerSubject.next(signer);
        }

        // Update signer in the list if loaded
        this.updateSignerInList(signer);
      }),
      shareReplay(1)
    );
  }

  /**
   * Create a new signer
   */
  createSigner(signerData: CreateSignerRequest): Observable<Signer> {
    return this.post<Signer>('/signers/', signerData, { retry: true }).pipe(
      tap(newSigner => {
        // Add to current list
        const currentSigners = this.signersSubject.value;
        this.signersSubject.next([...currentSigners, newSigner]);

        // Update document-specific signers if document ID is provided
        if (signerData.document_id) {
          this.updateSignerInDocumentList(signerData.document_id, newSigner, 'add');
        }

        // Invalidate related caches
        this.invalidateSignerListCaches();
      })
    );
  }

  /**
   * Update an existing signer
   */
  updateSigner(id: number, signerData: UpdateSignerRequest): Observable<Signer> {
    return this.put<Signer>(`/signers/${id}/`, signerData, { retry: true }).pipe(
      tap(updatedSigner => {
        // Update in current list
        this.updateSignerInList(updatedSigner);

        // Update selected signer if it matches
        const current = this.selectedSignerSubject.value;
        if (current?.id === id) {
          this.selectedSignerSubject.next(updatedSigner);
        }

        // Invalidate related caches
        this.invalidateSignerCache(id);
      })
    );
  }

  /**
   * Partially update a signer using PATCH
   */
  patchSigner(id: number, signerData: Partial<UpdateSignerRequest>): Observable<Signer> {
    return this.patch<Signer>(`/signers/${id}/`, signerData, { retry: true }).pipe(
      tap(updatedSigner => {
        this.updateSignerInList(updatedSigner);

        const current = this.selectedSignerSubject.value;
        if (current?.id === id) {
          this.selectedSignerSubject.next(updatedSigner);
        }

        this.invalidateSignerCache(id);
      })
    );
  }

  /**
   * Delete a signer
   */
  deleteSigner(id: number): Observable<void> {
    return this.delete<void>(`/signers/${id}/`, { retry: false }).pipe(
      tap(() => {
        // Get signer before removal to update document lists
        const currentSigners = this.signersSubject.value;
        const signerToDelete = currentSigners.find(s => s.id === id);

        // Remove from current list
        const updatedSigners = currentSigners.filter(signer => signer.id !== id);
        this.signersSubject.next(updatedSigners);

        // Update document-specific lists
        if (signerToDelete) {
          this.removeSignerFromDocumentLists(signerToDelete);
        }

        // Clear selected signer if it was deleted
        const current = this.selectedSignerSubject.value;
        if (current?.id === id) {
          this.selectedSignerSubject.next(null);
        }

        // Invalidate caches
        this.invalidateSignerCache(id);
      })
    );
  }

  /**
   * Set the selected signer
   */
  setSelectedSigner(signer: Signer | null): void {
    this.selectedSignerSubject.next(signer);
  }

  /**
   * Search signers by name or email
   */
  searchSigners(query: string, documentId?: number): Observable<Signer[]> {
    if (!query.trim()) {
      return documentId ? this.getSignersByDocument(documentId) : this.signers$;
    }

    return this.getSigners({ search: query, documentId });
  }

  /**
   * Get signers count
   */
  getSignersCount(documentId?: number): Observable<number> {
    const relevantSigners$ = documentId
      ? this.getSignersByDocument(documentId)
      : this.signers$;

    return relevantSigners$.pipe(
      map((signers: Signer[]) => signers.length)
    );
  }

  /**
   * Get signer statistics
   */
  getSignerStats(documentId?: number): Observable<SignerStats> {
    const relevantSigners$ = documentId
      ? this.getSignersByDocument(documentId)
      : this.signers$;

    return relevantSigners$.pipe(
      map((signers: Signer[]) => {
        const stats: SignerStats = {
          total: signers.length,
          pending: 0,
          signed: 0,
          declined: 0,
          expired: 0
        };

        signers.forEach((signer: Signer) => {
          switch (signer.status) {
            case SignerStatus.NEW:
            case SignerStatus.PENDING:
            case SignerStatus.INVITED:
              stats.pending++;
              break;
            case SignerStatus.SIGNED:
              stats.signed++;
              break;
            case SignerStatus.DECLINED:
            case SignerStatus.ERROR:
              stats.declined++;
              break;
            case SignerStatus.EXPIRED:
              stats.expired++;
              break;
          }
        });

        return stats;
      })
    );
  }

  /**
   * Check if a signer email exists for a specific document
   */
  signerEmailExistsInDocument(email: string, documentId: number, excludeId?: number): Observable<boolean> {
    return this.getSignersByDocument(documentId).pipe(
      map(signers =>
        signers.some(signer =>
          signer.email.toLowerCase() === email.toLowerCase() &&
          signer.id !== excludeId
        )
      )
    );
  }

  /**
   * Get pending signers (across all documents or for specific document)
   * Includes NEW, PENDING, and INVITED statuses
   */
  getPendingSigners(documentId?: number): Observable<Signer[]> {
    const relevantSigners$ = documentId
      ? this.getSignersByDocument(documentId)
      : this.signers$;

    return relevantSigners$.pipe(
      map((signers: Signer[]) =>
        signers.filter((signer: Signer) =>
          signer.status === SignerStatus.NEW ||
          signer.status === SignerStatus.PENDING ||
          signer.status === SignerStatus.INVITED
        )
      )
    );
  }

  /**
   * Get completed signers (signed, declined, error, or expired)
   */
  getCompletedSigners(documentId?: number): Observable<Signer[]> {
    const relevantSigners$ = documentId
      ? this.getSignersByDocument(documentId)
      : this.signers$;

    return relevantSigners$.pipe(
      map((signers: Signer[]) =>
        signers.filter((signer: Signer) =>
          signer.status === SignerStatus.SIGNED ||
          signer.status === SignerStatus.DECLINED ||
          signer.status === SignerStatus.ERROR ||
          signer.status === SignerStatus.EXPIRED
        )
      )
    );
  }

  /**
   * Refresh signers data
   */
  refreshSigners(query?: SignersQuery): Observable<Signer[]> {
    return this.getSigners(query || {}, true);
  }

  /**
   * Bulk delete signers
   */
  bulkDeleteSigners(ids: number[]): Observable<void[]> {
    const deleteRequests = ids.map(id => this.deleteSigner(id));
    return forkJoin(deleteRequests);
  }

  /**
   * Bulk update signer status (for admin operations)
   */
  bulkUpdateSignerStatus(ids: number[], status: SignerStatus): Observable<Signer[]> {
    const updateRequests = ids.map(id =>
      this.patchSigner(id, { /* status updates would need to be part of the API */ })
    );
    return forkJoin(updateRequests);
  }

  /**
   * Clear all signer-related state and cache
   */
  clearState(): void {
    this.signersSubject.next([]);
    this.selectedSignerSubject.next(null);
    this.loadingSubject.next(false);
    this.signersByDocumentSubject.next(new Map());
    this.clearAllCache();
  }

  /**
   * Preload signers data (useful for app initialization)
   */
  preloadSigners(documentId?: number): Observable<Signer[]> {
    // Check if we already have data
    if (this.signersSubject.value.length > 0 && !documentId) {
      return of(this.signersSubject.value);
    }

    return this.getSigners(documentId ? { documentId } : {});
  }

  /**
   * Get documents associated with a signer
   * Uses the document_ids array from the signer to fetch document details
   * Returns an observable of documents, filtering out any that failed to load
   */
  getDocumentsForSigner(signer: Signer): Observable<Document[]> {
    if (!signer.document_ids || signer.document_ids.length === 0) {
      return of([]);
    }

    // Fetch all documents for this signer in parallel using the base API service
    const documentRequests = signer.document_ids.map(documentId =>
      this.get<Document>(`/documents/${documentId}/`, {
        retry: true,
        cache: true,
        cacheOptions: { ttl: this.CACHE_TTL }
      }).pipe(
        catchError(error => {
          console.warn(`Failed to load document ${documentId}:`, error);
          return of(null); // Return null for failed requests
        })
      )
    );

    return forkJoin(documentRequests).pipe(
      map(documents => documents.filter(doc => doc !== null) as Document[])
    );
  }

  /**
   * Get documents associated with a signer by ID
   * Convenience method that first fetches the signer, then its documents
   */
  getDocumentsForSignerId(signerId: number): Observable<Document[]> {
    return this.getSigner(signerId).pipe(
      switchMap(signer => this.getDocumentsForSigner(signer))
    );
  }

  // Private helper methods

  /**
   * Build HTTP parameters from query object
   */
  private buildHttpParams(query: SignersQuery): HttpParams {
    let params = new HttpParams();

    if (query.documentId) {
      params = params.set('document_id', query.documentId.toString());
    }
    if (query.status) {
      params = params.set('status', query.status);
    }
    if (query.email) {
      params = params.set('email', query.email);
    }
    if (query.search) {
      params = params.set('search', query.search);
    }
    if (query.limit) {
      params = params.set('limit', query.limit.toString());
    }
    if (query.offset) {
      params = params.set('offset', query.offset.toString());
    }

    return params;
  }

  /**
   * Update a signer in the current list
   */
  private updateSignerInList(updatedSigner: Signer): void {
    const currentSigners = this.signersSubject.value;
    const index = currentSigners.findIndex(signer => signer.id === updatedSigner.id);

    if (index !== -1) {
      const updatedSigners = [...currentSigners];
      updatedSigners[index] = updatedSigner;
      this.signersSubject.next(updatedSigners);
    }

    // Also update in document-specific lists
    this.updateSignerInDocumentLists(updatedSigner);
  }

  /**
   * Update signers by document mapping
   */
  private updateSignersByDocument(documentId: number, signers: Signer[]): void {
    const currentMap = this.signersByDocumentSubject.value;
    const updatedMap = new Map(currentMap);
    updatedMap.set(documentId, signers);
    this.signersByDocumentSubject.next(updatedMap);
  }

  /**
   * Update signer in document-specific lists
   */
  private updateSignerInDocumentLists(updatedSigner: Signer): void {
    const currentMap = this.signersByDocumentSubject.value;
    const updatedMap = new Map(currentMap);
    let updated = false;

    for (const [documentId, signers] of currentMap.entries()) {
      const index = signers.findIndex(s => s.id === updatedSigner.id);
      if (index !== -1) {
        const updatedSigners = [...signers];
        updatedSigners[index] = updatedSigner;
        updatedMap.set(documentId, updatedSigners);
        updated = true;
      }
    }

    if (updated) {
      this.signersByDocumentSubject.next(updatedMap);
    }
  }

  /**
   * Update signer in document list (add or update)
   */
  private updateSignerInDocumentList(documentId: number, signer: Signer, action: 'add' | 'update'): void {
    const currentMap = this.signersByDocumentSubject.value;
    const currentSigners = currentMap.get(documentId) || [];

    let updatedSigners: Signer[];

    if (action === 'add') {
      updatedSigners = [...currentSigners, signer];
    } else {
      const index = currentSigners.findIndex(s => s.id === signer.id);
      if (index !== -1) {
        updatedSigners = [...currentSigners];
        updatedSigners[index] = signer;
      } else {
        updatedSigners = currentSigners;
      }
    }

    const updatedMap = new Map(currentMap);
    updatedMap.set(documentId, updatedSigners);
    this.signersByDocumentSubject.next(updatedMap);
  }

  /**
   * Remove signer from all document lists
   */
  private removeSignerFromDocumentLists(signer: Signer): void {
    const currentMap = this.signersByDocumentSubject.value;
    const updatedMap = new Map(currentMap);
    let updated = false;

    for (const [documentId, signers] of currentMap.entries()) {
      const filteredSigners = signers.filter(s => s.id !== signer.id);
      if (filteredSigners.length !== signers.length) {
        updatedMap.set(documentId, filteredSigners);
        updated = true;
      }
    }

    if (updated) {
      this.signersByDocumentSubject.next(updatedMap);
    }
  }

  /**
   * Invalidate all cache entries related to a specific signer
   */
  private invalidateSignerCache(id: number): void {
    // Invalidate signer lists
    this.invalidateSignerListCaches();

    // Invalidate specific signer cache
    const entityCacheKey = CacheService.generateEntityKey('signer', id);
    this.invalidateCache(entityCacheKey);

    // Invalidate any related patterns
    this.invalidateCache(new RegExp(`signers.*${id}`));
  }

  /**
   * Invalidate all signer list caches
   */
  private invalidateSignerListCaches(): void {
    this.invalidateCache(new RegExp('^signers:list:'));
  }
}