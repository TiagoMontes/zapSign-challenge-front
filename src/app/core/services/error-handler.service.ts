import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiError, ApiResponse, HttpStatusCode } from '../models';

/**
 * Custom error class for API-related errors
 */
export class ApiException extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly errors?: ApiError[],
    public readonly originalError?: HttpErrorResponse
  ) {
    super(message);
    this.name = 'ApiException';
  }
}

/**
 * Custom error class for network-related errors
 */
export class NetworkException extends Error {
  constructor(message: string, public readonly originalError?: HttpErrorResponse) {
    super(message);
    this.name = 'NetworkException';
  }
}

/**
 * Custom error class for validation errors
 */
export class ValidationException extends Error {
  constructor(
    message: string,
    public readonly errors: ApiError[]
  ) {
    super(message);
    this.name = 'ValidationException';
  }
}

/**
 * Service for handling and processing errors throughout the application.
 * Provides consistent error handling, logging, and user-friendly error messages.
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  /**
   * Process HTTP error response and return appropriate error instance
   */
  processHttpError(error: HttpErrorResponse): Error {
    if (environment.enableLogging) {
      console.error('HTTP Error occurred:', error);
    }

    // Network connectivity issues
    if (error.status === 0) {
      return new NetworkException(
        'Unable to connect to server. Please check your internet connection.',
        error
      );
    }

    // Try to extract API response from error
    const apiResponse = this.extractApiResponse(error);

    if (apiResponse) {
      return this.processApiError(apiResponse, error);
    }

    // Handle standard HTTP errors without API response
    return this.processStandardHttpError(error);
  }

  /**
   * Extract API response from HTTP error if available
   */
  private extractApiResponse(error: HttpErrorResponse): ApiResponse<any> | null {
    try {
      if (error.error && typeof error.error === 'object') {
        // Check if error.error has the structure of ApiResponse
        if ('success' in error.error && 'code' in error.error && 'message' in error.error) {
          return error.error as ApiResponse<any>;
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Process API error response and create appropriate error instance
   */
  private processApiError(apiResponse: ApiResponse<any>, originalError: HttpErrorResponse): Error {
    const { code, message, errors } = apiResponse;

    switch (code) {
      case HttpStatusCode.BAD_REQUEST:
      case HttpStatusCode.UNPROCESSABLE_ENTITY:
        if (errors && errors.length > 0) {
          return new ValidationException(
            message || 'Validation failed',
            errors
          );
        }
        return new ApiException(
          message || 'Invalid request data',
          code,
          errors,
          originalError
        );

      case HttpStatusCode.UNAUTHORIZED:
        return new ApiException(
          'Authentication required. Please log in.',
          code,
          errors,
          originalError
        );

      case HttpStatusCode.FORBIDDEN:
        return new ApiException(
          'You do not have permission to perform this action.',
          code,
          errors,
          originalError
        );

      case HttpStatusCode.NOT_FOUND:
        return new ApiException(
          'The requested resource was not found.',
          code,
          errors,
          originalError
        );

      case HttpStatusCode.CONFLICT:
        return new ApiException(
          message || 'A conflict occurred. The resource may already exist.',
          code,
          errors,
          originalError
        );

      case HttpStatusCode.INTERNAL_SERVER_ERROR:
        return new ApiException(
          'Server error occurred. Please try again later.',
          code,
          errors,
          originalError
        );

      default:
        return new ApiException(
          message || 'An unexpected error occurred',
          code,
          errors,
          originalError
        );
    }
  }

  /**
   * Process standard HTTP errors without API response structure
   */
  private processStandardHttpError(error: HttpErrorResponse): Error {
    let message: string;

    switch (error.status) {
      case 400:
        message = 'Invalid request. Please check your input.';
        break;
      case 401:
        message = 'Authentication required. Please log in.';
        break;
      case 403:
        message = 'You do not have permission to perform this action.';
        break;
      case 404:
        message = 'The requested resource was not found.';
        break;
      case 409:
        message = 'A conflict occurred. The resource may already exist.';
        break;
      case 422:
        message = 'Invalid data provided. Please check your input.';
        break;
      case 429:
        message = 'Too many requests. Please wait and try again.';
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        message = 'Server error occurred. Please try again later.';
        break;
      default:
        message = `Unexpected error occurred (${error.status}). Please try again.`;
    }

    return new ApiException(message, error.status, undefined, error);
  }

  /**
   * Get user-friendly error message from any error
   */
  getUserFriendlyMessage(error: Error): string {
    if (error instanceof ValidationException) {
      if (error.errors.length === 1) {
        return error.errors[0].message;
      }
      return `Validation failed: ${error.errors.map(e => e.message).join(', ')}`;
    }

    if (error instanceof NetworkException) {
      return error.message;
    }

    if (error instanceof ApiException) {
      return error.message;
    }

    return 'An unexpected error occurred. Please try again.';
  }

  /**
   * Check if error is retryable (network issues, temporary server errors)
   */
  isRetryableError(error: Error): boolean {
    if (error instanceof NetworkException) {
      return true;
    }

    if (error instanceof ApiException) {
      return error.statusCode >= 500 || error.statusCode === 429;
    }

    return false;
  }

  /**
   * Log error for debugging purposes
   */
  logError(error: Error, context?: string): void {
    if (!environment.enableLogging) {
      return;
    }

    const logData = {
      error: error.name,
      message: error.message,
      context,
      timestamp: new Date().toISOString(),
      ...(error instanceof ApiException && {
        statusCode: error.statusCode,
        apiErrors: error.errors
      })
    };

    console.error('Application Error:', logData);
  }
}