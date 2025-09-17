import { Injectable, OnDestroy } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Interface for cache entry with TTL support
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

/**
 * Cache configuration options
 */
export interface CacheOptions {
  /** Time to live in milliseconds (default: 5 minutes) */
  ttl?: number;
  /** Whether to return stale data while refreshing (default: false) */
  staleWhileRevalidate?: boolean;
}

/**
 * Service for managing in-memory cache with TTL support and invalidation strategies.
 * Provides efficient caching for API responses with automatic cleanup.
 */
@Injectable({
  providedIn: 'root'
})
export class CacheService implements OnDestroy {
  private cache = new Map<string, CacheEntry<any>>();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly CLEANUP_INTERVAL = 60 * 1000; // 1 minute

  // Subject to track cache invalidations
  private invalidationSubject = new BehaviorSubject<string[]>([]);
  public readonly invalidations$ = this.invalidationSubject.asObservable();

  constructor() {
    this.startCleanupTimer();
  }

  /**
   * Get data from cache if valid, otherwise return null
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set data in cache with optional TTL
   */
  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const ttl = options.ttl || this.DEFAULT_TTL;

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl
    };

    this.cache.set(key, entry);
  }

  /**
   * Cache an Observable's result and return cached version if available
   */
  cacheObservable<T>(
    key: string,
    source$: Observable<T>,
    options: CacheOptions = {}
  ): Observable<T> {
    // Check if we have valid cached data
    const cachedData = this.get<T>(key);

    if (cachedData !== null) {
      return of(cachedData);
    }

    // If stale-while-revalidate is enabled, check for stale data
    if (options.staleWhileRevalidate) {
      const staleData = this.getStale<T>(key);
      if (staleData !== null) {
        // Return stale data immediately and refresh in background
        this.refreshInBackground(key, source$, options);
        return of(staleData);
      }
    }

    // No cached data, fetch from source and cache result
    return source$.pipe(
      tap(data => this.set(key, data, options))
    );
  }

  /**
   * Get stale data (expired but still in cache)
   */
  private getStale<T>(key: string): T | null {
    const entry = this.cache.get(key);
    return entry ? entry.data : null;
  }

  /**
   * Refresh data in background without returning the Observable
   */
  private refreshInBackground<T>(
    key: string,
    source$: Observable<T>,
    options: CacheOptions
  ): void {
    source$.subscribe({
      next: data => this.set(key, data, options),
      error: error => console.warn('Background cache refresh failed:', error)
    });
  }

  /**
   * Remove specific key from cache
   */
  invalidate(key: string): void {
    this.cache.delete(key);
    this.emitInvalidation([key]);
  }

  /**
   * Remove multiple keys from cache
   */
  invalidateMultiple(keys: string[]): void {
    keys.forEach(key => this.cache.delete(key));
    this.emitInvalidation(keys);
  }

  /**
   * Remove all keys matching a pattern
   */
  invalidatePattern(pattern: RegExp): void {
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
        keysToDelete.push(key);
      }
    }

    if (keysToDelete.length > 0) {
      this.emitInvalidation(keysToDelete);
    }
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    const allKeys = Array.from(this.cache.keys());
    this.cache.clear();
    this.emitInvalidation(allKeys);
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Emit cache invalidation event
   */
  private emitInvalidation(keys: string[]): void {
    this.invalidationSubject.next(keys);
  }

  /**
   * Start automatic cleanup timer to remove expired entries
   */
  private startCleanupTimer(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredEntries();
    }, this.CLEANUP_INTERVAL);
  }

  /**
   * Remove all expired entries from cache
   */
  private cleanupExpiredEntries(): void {
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        keysToDelete.push(key);
      }
    }
  }

  /**
   * Get cache statistics for debugging
   */
  getStats(): {
    size: number;
    keys: string[];
    totalMemoryUsage: number;
  } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      totalMemoryUsage: this.estimateMemoryUsage()
    };
  }

  /**
   * Estimate memory usage of cache (rough approximation)
   */
  private estimateMemoryUsage(): number {
    let totalSize = 0;

    for (const [key, entry] of this.cache.entries()) {
      // Rough estimation: key length + JSON size of data
      totalSize += key.length * 2; // 2 bytes per character for UTF-16
      totalSize += JSON.stringify(entry.data).length * 2;
      totalSize += 16; // timestamp and ttl numbers
    }

    return totalSize;
  }

  /**
   * Clean up resources when service is destroyed
   */
  ngOnDestroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
    this.invalidationSubject.complete();
  }

  /**
   * Utility methods for generating cache keys
   */
  static generateKey(prefix: string, ...parts: (string | number)[]): string {
    return [prefix, ...parts].join(':');
  }

  static generateListKey(entityType: string, filters?: Record<string, any>): string {
    const filterString = filters ? JSON.stringify(filters) : '';
    return `${entityType}:list:${filterString}`;
  }

  static generateEntityKey(entityType: string, id: string | number): string {
    return `${entityType}:entity:${id}`;
  }
}