import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class BaseApiService {
  private http = inject(HttpClient);
  protected readonly baseUrl = environment.apiUrl;

  protected get<T>(endpoint: string): Observable<T> {
    return this.http.get<ApiResponse<T>>(`${this.baseUrl}${endpoint}`)
      .pipe(
        map(response => this.extractData<T>(response)),
        catchError(this.handleError)
      );
  }

  protected post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, data)
      .pipe(
        map(response => this.extractData<T>(response)),
        catchError(this.handleError)
      );
  }

  protected put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, data)
      .pipe(
        map(response => this.extractData<T>(response)),
        catchError(this.handleError)
      );
  }

  protected patch<T>(endpoint: string, data: any): Observable<T> {
    return this.http.patch<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, data)
      .pipe(
        map(response => this.extractData<T>(response)),
        catchError(this.handleError)
      );
  }

  protected delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<ApiResponse<T>>(`${this.baseUrl}${endpoint}`)
      .pipe(
        map(response => this.extractData<T>(response)),
        catchError(this.handleError)
      );
  }

  private extractData<T>(response: ApiResponse<T>): T {
    if (!response.success) {
      throw new Error(response.message || 'An error occurred');
    }
    return response.data as T;
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.status === 0) {
        errorMessage = 'Unable to connect to server. Please check your connection.';
      } else if (error.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.status === 404) {
        errorMessage = 'The requested resource was not found.';
      } else if (error.status === 400) {
        errorMessage = 'Invalid request. Please check your input.';
      } else {
        errorMessage = `Server returned code: ${error.status}, error message is: ${error.message}`;
      }
    }

    if (environment.enableLogging) {
      console.error('API Error:', error);
    }

    return throwError(() => new Error(errorMessage));
  };
}