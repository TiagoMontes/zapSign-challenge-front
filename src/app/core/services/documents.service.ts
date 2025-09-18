import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, of, forkJoin } from 'rxjs';
import { map, tap, catchError, shareReplay, filter, switchMap } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { BaseApiService, RequestOptions } from './base-api.service';
import { CacheService } from './cache.service';
import {
  Document,
  CreateDocumentRequest,
  DocumentAnalysis,
  DocumentStatus,
  ProcessingStatus
} from '../models';

/**
 * Query parameters for filtering documents
 */
export interface DocumentsQuery {
  companyId?: number;
  status?: DocumentStatus;
  processingStatus?: ProcessingStatus;
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Document list response with pagination info
 */
export interface DocumentsListResponse {
  documents: Document[];
  total: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Service for managing documents with ZapSign integration, comprehensive CRUD operations,
 * caching, filtering, and real-time state management.
 */
@Injectable({
  providedIn: 'root'
})
export class DocumentsService extends BaseApiService {

  // State management for documents
  private documentsSubject = new BehaviorSubject<Document[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private selectedDocumentSubject = new BehaviorSubject<Document | null>(null);
  private analysisLoadingSubject = new BehaviorSubject<Set<number>>(new Set());

  // Public observables for components
  public readonly documents$ = this.documentsSubject.asObservable();
  public readonly loading$ = this.loadingSubject.asObservable();
  public readonly selectedDocument$ = this.selectedDocumentSubject.asObservable();
  public readonly analysisLoading$ = this.analysisLoadingSubject.asObservable();

  // Cache configuration
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes (documents change more frequently)
  private readonly ANALYSIS_CACHE_TTL = 30 * 60 * 1000; // 30 minutes for analysis results

  /**
   * Get documents with optional filtering and caching
   */
  getDocuments(query: DocumentsQuery = {}, forceRefresh: boolean = false): Observable<Document[]> {
    const params = this.buildHttpParams(query);
    const cacheKey = CacheService.generateListKey('documents', query);

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

    return this.get<Document[]>('/documents/', options).pipe(
      tap(documents => {
        // Only update the main documents subject if no specific filters
        if (!query.companyId && !query.status && !query.search) {
          this.documentsSubject.next(documents);
        }
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        // Return cached data if available on error
        const cached = this.cacheService.get<Document[]>(cacheKey);
        if (cached) {
          return of(cached);
        }
        throw error;
      }),
      shareReplay(1)
    );
  }

  /**
   * Get documents by company ID
   */
  getDocumentsByCompany(companyId: number, forceRefresh: boolean = false): Observable<Document[]> {
    return this.getDocuments({ companyId }, forceRefresh);
  }

  /**
   * Get documents by status
   */
  getDocumentsByStatus(status: DocumentStatus, forceRefresh: boolean = false): Observable<Document[]> {
    return this.getDocuments({ status }, forceRefresh);
  }

  /**
   * Get a specific document by ID with caching
   */
  getDocument(id: number, useCache: boolean = true): Observable<Document> {
    const cacheKey = CacheService.generateEntityKey('document', id);
    const options: RequestOptions = {
      cache: useCache,
      cacheOptions: { ttl: this.CACHE_TTL },
      cacheKey,
      retry: true
    };

    return this.get<Document>(`/documents/${id}/`, options).pipe(
      tap(document => {
        // Update selected document if it matches
        const current = this.selectedDocumentSubject.value;
        if (current?.id === id) {
          this.selectedDocumentSubject.next(document);
        }

        // Update document in the list if loaded
        this.updateDocumentInList(document);
      }),
      shareReplay(1)
    );
  }

  /**
   * Create a new document with ZapSign integration
   */
  createDocument(documentData: CreateDocumentRequest): Observable<Document> {
    return this.post<Document>('/documents/', documentData, {
      retry: true,
      maxRetries: 2, // Fewer retries for creation due to potential side effects
    }).pipe(
      tap(newDocument => {
        // Add to current list
        const currentDocuments = this.documentsSubject.value;
        this.documentsSubject.next([newDocument, ...currentDocuments]);

        // Invalidate related caches
        this.invalidateDocumentListCaches();
      })
    );
  }

  /**
   * Add a new signer to an existing document
   */
  addSignerToDocument(documentId: number, signerData: { name: string; email: string }): Observable<any> {
    return this.post<any>(`/documents/${documentId}/add-signer/`, signerData, {
      retry: true,
      maxRetries: 2
    }).pipe(
      tap(() => {
        // Refresh the document to get updated signer information
        this.getDocument(documentId, false).subscribe();

        // Invalidate related caches
        this.invalidateDocumentCache(documentId);
      })
    );
  }

  /**
   * Delete a document
   */
  deleteDocument(id: number): Observable<void> {
    return this.delete<void>(`/documents/${id}/`, { retry: false }).pipe(
      tap(() => {
        // Remove from current list
        const currentDocuments = this.documentsSubject.value;
        const updatedDocuments = currentDocuments.filter(doc => doc.id !== id);
        this.documentsSubject.next(updatedDocuments);

        // Clear selected document if it was deleted
        const current = this.selectedDocumentSubject.value;
        if (current?.id === id) {
          this.selectedDocumentSubject.next(null);
        }

        // Invalidate caches
        this.invalidateDocumentCache(id);
      })
    );
  }

  /**
   * Analyze document using AI
   */
  analyzeDocument(id: number, forceReanalysis: boolean = false): Observable<DocumentAnalysis> {
    const cacheKey = `document:analysis:${id}`;

    // Check if analysis is already in progress
    const currentAnalysisLoading = this.analysisLoadingSubject.value;
    if (currentAnalysisLoading.has(id)) {
      return new Observable(subscriber => {
        subscriber.error(new Error('Analysis already in progress for this document'));
      });
    }

    // Add to analysis loading set
    const updatedLoading = new Set(currentAnalysisLoading);
    updatedLoading.add(id);
    this.analysisLoadingSubject.next(updatedLoading);

    // Invalidate cache if force reanalysis is requested
    if (forceReanalysis) {
      this.invalidateCache(cacheKey);
    }

    const requestBody = forceReanalysis ? { force_reanalysis: true } : {};

    const options: RequestOptions = {
      cache: !forceReanalysis,
      cacheOptions: { ttl: this.ANALYSIS_CACHE_TTL },
      cacheKey,
      retry: true,
      maxRetries: 2
    };

    return this.post<DocumentAnalysis>(`/documents/${id}/analyze/`, requestBody, options).pipe(
      tap(analysis => {
        // Remove from analysis loading set
        const currentLoading = this.analysisLoadingSubject.value;
        const updatedLoading = new Set(currentLoading);
        updatedLoading.delete(id);
        this.analysisLoadingSubject.next(updatedLoading);
      }),
      catchError(error => {
        // Remove from analysis loading set on error
        const currentLoading = this.analysisLoadingSubject.value;
        const updatedLoading = new Set(currentLoading);
        updatedLoading.delete(id);
        this.analysisLoadingSubject.next(updatedLoading);
        throw error;
      }),
      shareReplay(1)
    );
  }

  /**
   * Get cached analysis result if available
   */
  getCachedAnalysis(id: number): DocumentAnalysis | null {
    const cacheKey = `document:analysis:${id}`;
    return this.cacheService.get<DocumentAnalysis>(cacheKey);
  }

  /**
   * Check if analysis is in progress for a document
   */
  isAnalysisInProgress(id: number): Observable<boolean> {
    return this.analysisLoading$.pipe(
      map(loadingSet => loadingSet.has(id))
    );
  }

  /**
   * Set the selected document
   */
  setSelectedDocument(document: Document | null): void {
    this.selectedDocumentSubject.next(document);
  }

  /**
   * Search documents by name or content
   */
  searchDocuments(query: string, companyId?: number): Observable<Document[]> {
    if (!query.trim()) {
      return companyId ? this.getDocumentsByCompany(companyId) : this.documents$;
    }

    return this.getDocuments({ search: query, companyId });
  }

  /**
   * Get documents count
   */
  getDocumentsCount(companyId?: number): Observable<number> {
    const relevantDocuments$ = companyId
      ? this.getDocumentsByCompany(companyId)
      : this.documents$;

    return relevantDocuments$.pipe(
      map((documents: Document[]) => documents.length)
    );
  }

  /**
   * Get documents by processing status
   */
  getDocumentsByProcessingStatus(status: ProcessingStatus): Observable<Document[]> {
    return this.documents$.pipe(
      map((documents: Document[]) =>
        documents.filter((doc: Document) => doc.processing_status === status)
      )
    );
  }

  /**
   * Get recent documents (last 7 days)
   */
  getRecentDocuments(limit: number = 10): Observable<Document[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return this.documents$.pipe(
      map((documents: Document[]) =>
        documents
          .filter((doc: Document) => new Date(doc.created_at) >= sevenDaysAgo)
          .sort((a: Document, b: Document) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, limit)
      )
    );
  }

  /**
   * Refresh documents data
   */
  refreshDocuments(query?: DocumentsQuery): Observable<Document[]> {
    return this.getDocuments(query || {}, true);
  }

  /**
   * Bulk delete documents
   */
  bulkDeleteDocuments(ids: number[]): Observable<void[]> {
    const deleteRequests = ids.map(id => this.deleteDocument(id));
    return forkJoin(deleteRequests);
  }

  /**
   * Bulk analyze documents
   */
  bulkAnalyzeDocuments(ids: number[]): Observable<DocumentAnalysis[]> {
    const analysisRequests = ids.map(id => this.analyzeDocument(id));
    return forkJoin(analysisRequests);
  }

  /**
   * Clear all document-related state and cache
   */
  clearState(): void {
    this.documentsSubject.next([]);
    this.selectedDocumentSubject.next(null);
    this.loadingSubject.next(false);
    this.analysisLoadingSubject.next(new Set());
    this.clearAllCache();
  }

  /**
   * Preload documents data (useful for app initialization)
   */
  preloadDocuments(companyId?: number): Observable<Document[]> {
    // Check if we already have data
    if (this.documentsSubject.value.length > 0 && !companyId) {
      return of(this.documentsSubject.value);
    }

    return this.getDocuments(companyId ? { companyId } : {});
  }

  // Private helper methods

  /**
   * Build HTTP parameters from query object
   */
  private buildHttpParams(query: DocumentsQuery): HttpParams {
    let params = new HttpParams();

    if (query.companyId) {
      params = params.set('company_id', query.companyId.toString());
    }
    if (query.status) {
      params = params.set('status', query.status);
    }
    if (query.processingStatus) {
      params = params.set('processing_status', query.processingStatus);
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
   * Update a document in the current list
   */
  private updateDocumentInList(updatedDocument: Document): void {
    const currentDocuments = this.documentsSubject.value;
    const index = currentDocuments.findIndex(doc => doc.id === updatedDocument.id);

    if (index !== -1) {
      const updatedDocuments = [...currentDocuments];
      updatedDocuments[index] = updatedDocument;
      this.documentsSubject.next(updatedDocuments);
    }
  }

  /**
   * Invalidate all cache entries related to a specific document
   */
  private invalidateDocumentCache(id: number): void {
    // Invalidate document lists
    this.invalidateDocumentListCaches();

    // Invalidate specific document cache
    const entityCacheKey = CacheService.generateEntityKey('document', id);
    this.invalidateCache(entityCacheKey);

    // Invalidate analysis cache
    this.invalidateCache(`document:analysis:${id}`);

    // Invalidate any related patterns
    this.invalidateCache(new RegExp(`documents.*${id}`));
  }

  /**
   * Invalidate all document list caches
   */
  private invalidateDocumentListCaches(): void {
    this.invalidateCache(new RegExp('^documents:list:'));
  }
}