import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, map, retryWhen, take, concatMap, finalize } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models';
import { ErrorHandlerService } from './error-handler.service';
import { CacheService, CacheOptions } from './cache.service';

/**
 * Options for API requests
 */
export interface RequestOptions {
  /** Enable caching for this request */
  cache?: boolean;
  /** Cache options (TTL, stale-while-revalidate) */
  cacheOptions?: CacheOptions;
  /** Custom cache key (auto-generated if not provided) */
  cacheKey?: string;
  /** Enable retry logic for this request */
  retry?: boolean;
  /** Maximum number of retry attempts */
  maxRetries?: number;
  /** Delay between retries in milliseconds */
  retryDelay?: number;
  /** HTTP query parameters */
  params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> };
}

/**
 * Base API service providing common HTTP methods with enhanced error handling,
 * retry logic, and caching capabilities for all API interactions.
 */
@Injectable({
  providedIn: 'root'
})
export class BaseApiService {
  private http = inject(HttpClient);
  private errorHandler = inject(ErrorHandlerService);
  protected cacheService = inject(CacheService);

  protected readonly baseUrl = environment.apiUrl;

  // Default retry configuration
  private readonly DEFAULT_MAX_RETRIES = 3;
  private readonly DEFAULT_RETRY_DELAY = 1000; // 1 second
  private readonly RETRY_STATUS_CODES = [500, 502, 503, 504, 429];

  /**
   * Perform GET request with optional caching and retry logic
   */
  protected get<T>(endpoint: string, options: RequestOptions = {}): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const cacheKey = options.cacheKey || this.generateCacheKey('GET', endpoint, options.params);

    // Check cache first if caching is enabled
    if (options.cache) {
      const cachedData = this.cacheService.get<T>(cacheKey);
      if (cachedData !== null) {
        return this.cacheService.cacheObservable(
          cacheKey,
          this.performGetRequest<T>(url, options),
          options.cacheOptions
        );
      }
    }

    const request$ = this.performGetRequest<T>(url, options);

    if (options.cache) {
      return this.cacheService.cacheObservable(cacheKey, request$, options.cacheOptions);
    }

    return request$;
  }

  /**
   * Perform POST request with automatic cache invalidation
   */
  protected post<T>(endpoint: string, data: any, options: RequestOptions = {}): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;

    return this.performRequest<T>(() =>
      this.http.post<ApiResponse<T>>(url, data, { params: options.params })
    , options).pipe(
      finalize(() => this.invalidateRelatedCache(endpoint, 'POST'))
    );
  }

  /**
   * Perform PUT request with automatic cache invalidation
   */
  protected put<T>(endpoint: string, data: any, options: RequestOptions = {}): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;

    return this.performRequest<T>(() =>
      this.http.put<ApiResponse<T>>(url, data, { params: options.params })
    , options).pipe(
      finalize(() => this.invalidateRelatedCache(endpoint, 'PUT'))
    );
  }

  /**
   * Perform PATCH request with automatic cache invalidation
   */
  protected patch<T>(endpoint: string, data: any, options: RequestOptions = {}): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;

    return this.performRequest<T>(() =>
      this.http.patch<ApiResponse<T>>(url, data, { params: options.params })
    , options).pipe(
      finalize(() => this.invalidateRelatedCache(endpoint, 'PATCH'))
    );
  }

  /**
   * Perform DELETE request with automatic cache invalidation
   */
  protected delete<T>(endpoint: string, options: RequestOptions = {}): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;

    return this.performRequest<T>(() =>
      this.http.delete<ApiResponse<T>>(url, { params: options.params })
    , options).pipe(
      finalize(() => this.invalidateRelatedCache(endpoint, 'DELETE'))
    );
  }

  /**
   * Perform the actual GET request
   */
  private performGetRequest<T>(url: string, options: RequestOptions): Observable<T> {
    return this.performRequest<T>(() =>
      this.http.get<ApiResponse<T>>(url, { params: options.params })
    , options);
  }

  /**
   * Generic method to perform HTTP requests with error handling and retry logic
   */
  private performRequest<T>(
    requestFn: () => Observable<ApiResponse<T>>,
    options: RequestOptions
  ): Observable<T> {
    let request$ = requestFn().pipe(
      map(response => this.extractData<T>(response)),
      catchError(error => this.handleError(error))
    );

    // Apply retry logic if enabled
    if (options.retry !== false) {
      const maxRetries = options.maxRetries || this.DEFAULT_MAX_RETRIES;
      const retryDelay = options.retryDelay || this.DEFAULT_RETRY_DELAY;

      request$ = request$.pipe(
        retryWhen(errors =>
          errors.pipe(
            take(maxRetries),
            concatMap((error, index) => {
              // Only retry on specific errors
              if (this.shouldRetry(error) && index < maxRetries) {
                const delay = retryDelay * Math.pow(2, index); // Exponential backoff
                if (environment.enableLogging) {
                  console.warn(`Retrying request in ${delay}ms (attempt ${index + 1}/${maxRetries})`);
                }
                return timer(delay);
              }
              return throwError(() => error);
            })
          )
        )
      );
    }

    return request$;
  }

  /**
   * Extract data from API response and handle success/error states
   */
  private extractData<T>(response: ApiResponse<T>): T {
    if (!response.success) {
      // Create a fake HttpErrorResponse to maintain compatibility with error handler
      const fakeError = {
        error: response,
        status: response.code,
        statusText: response.message,
        message: response.message
      } as HttpErrorResponse;

      throw this.errorHandler.processHttpError(fakeError);
    }
    return response.data as T;
  }

  /**
   * Handle HTTP errors using the error handler service
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    const processedError = this.errorHandler.processHttpError(error);
    this.errorHandler.logError(processedError, 'BaseApiService');
    return throwError(() => processedError);
  };

  /**
   * Determine if an error should trigger a retry
   */
  private shouldRetry(error: any): boolean {
    // Use error handler service to check if error is retryable
    return this.errorHandler.isRetryableError(error);
  }

  /**
   * Generate cache key for requests
   */
  private generateCacheKey(method: string, endpoint: string, params?: any): string {
    const paramsString = params ? JSON.stringify(params) : '';
    return CacheService.generateKey(method, endpoint, paramsString);
  }

  /**
   * Invalidate related cache entries after mutations
   */
  private invalidateRelatedCache(endpoint: string, method: string): void {
    // Extract entity type from endpoint (e.g., /companies/123 -> companies)
    const entityMatch = endpoint.match(/^\/([^\/]+)/);
    if (!entityMatch) return;

    const entityType = entityMatch[1];

    // Invalidate list caches for the entity type
    this.cacheService.invalidatePattern(new RegExp(`^GET:/api/${entityType}[/?]`));

    // For specific entity operations, also invalidate the entity cache
    if (endpoint.includes('/') && endpoint.split('/').length > 2) {
      this.cacheService.invalidatePattern(new RegExp(`^GET:${endpoint.replace(/\/$/, '')}$`));
    }

    if (environment.enableLogging) {
      console.debug(`Cache invalidated for ${entityType} after ${method} operation`);
    }
  }

  /**
   * Utility method to manually invalidate cache
   */
  protected invalidateCache(pattern: string | RegExp): void {
    if (typeof pattern === 'string') {
      this.cacheService.invalidate(pattern);
    } else {
      this.cacheService.invalidatePattern(pattern);
    }
  }

  /**
   * Utility method to clear all cache
   */
  protected clearAllCache(): void {
    this.cacheService.clear();
  }
}