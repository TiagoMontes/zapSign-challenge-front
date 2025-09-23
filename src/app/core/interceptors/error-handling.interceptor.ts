import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorHandlerService } from '../services/error-handler.service';
import { environment } from '../../../environments/environment';

interface ErrorMessage {
  title: string;
  message: string;
  action?: string;
}

/**
 * HTTP Error Handling Interceptor (Functional)
 * Handles global error responses with enhanced logging, user notifications,
 * and automatic error processing using the ErrorHandlerService
 */
export const errorHandlingInterceptor: HttpInterceptorFn = (req, next) => {
  const errorHandlerService = inject(ErrorHandlerService);
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Process error using our enhanced error handler
      const processedError = errorHandlerService.processHttpError(error);

      // Log error details for debugging
      if (environment.enableLogging) {
        errorHandlerService.logError(processedError, `HTTP Request: ${req.method} ${req.url}`);
      }

      // Handle specific error scenarios
      handleSpecificErrors(error, snackBar, processedError);

      // Return the processed error to maintain the error chain
      return throwError(() => processedError);
    }),
  );
};

/**
 * Handle specific error scenarios with appropriate actions
 */
function handleSpecificErrors(
  error: HttpErrorResponse,
  snackBar: MatSnackBar,
  processedError: Error,
): void {
  switch (error.status) {
    case 401:
      // Authentication required - don't show snackbar for auth errors
      // as they should be handled by auth guards/services
      if (environment.enableLogging) {
        console.warn('Authentication required for:', error.url);
      }
      break;

    case 403:
      // Forbidden - show error but don't redirect
      showErrorSnackbar(
        snackBar,
        'Access denied. You do not have permission to perform this action.',
      );
      break;

    case 404:
      // Not found - only show snackbar for non-navigation requests
      if (!isNavigationRequest(error.url)) {
        showErrorSnackbar(snackBar, 'The requested resource was not found.');
      }
      break;

    case 429:
      // Rate limiting - show specific message with retry info
      showErrorSnackbar(
        snackBar,
        'Too many requests. Please wait a moment before trying again.',
        'Retry',
        8000,
      );
      break;

    case 500:
    case 502:
    case 503:
    case 504:
      // Server errors - show error with retry option
      showErrorSnackbar(
        snackBar,
        'Server error occurred. Please try again in a moment.',
        'Retry',
        6000,
      );
      break;

    case 0:
      // Network error - show connection error
      showErrorSnackbar(
        snackBar,
        'Connection failed. Please check your internet connection.',
        'Retry',
        8000,
      );
      break;

    default:
      // For other errors, only show snackbar for non-auth, non-navigation requests
      if (error.status !== 401 && !isNavigationRequest(error.url)) {
        const userMessage = processedError.message || 'An unexpected error occurred.';
        showErrorSnackbar(snackBar, userMessage);
      }
  }
}

/**
 * Show error snackbar with consistent styling
 */
function showErrorSnackbar(
  snackBar: MatSnackBar,
  message: string,
  action: string = 'OK',
  duration: number = 5000,
): void {
  snackBar.open(message, action, {
    duration,
    panelClass: ['error-snackbar'],
    horizontalPosition: 'end',
    verticalPosition: 'top',
  });
}

/**
 * Check if the request is a navigation request (should not show error snackbars)
 */
function isNavigationRequest(url: string | null): boolean {
  if (!url) return false;

  // Add patterns for requests that should not show user notifications
  const navigationPatterns = [/\/auth\//, /\/login/, /\/logout/, /\/verify/];

  return navigationPatterns.some((pattern) => pattern.test(url));
}

/**
 * Get user-friendly error message based on HTTP status
 */
function getErrorMessage(error: HttpErrorResponse): ErrorMessage {
  switch (error.status) {
    case 0:
      return {
        title: 'Connection Error',
        message: 'Unable to connect to the server. Please check your internet connection.',
        action: 'Retry',
      };

    case 400:
      return {
        title: 'Invalid Request',
        message: error.error?.message || 'The request contains invalid data.',
        action: 'OK',
      };

    case 401:
      return {
        title: 'Authentication Required',
        message: 'You need to sign in to access this resource.',
        action: 'Sign In',
      };

    case 403:
      return {
        title: 'Access Denied',
        message: 'You do not have permission to access this resource.',
        action: 'OK',
      };

    case 404:
      return {
        title: 'Not Found',
        message: 'The requested resource could not be found.',
        action: 'OK',
      };

    case 409:
      return {
        title: 'Conflict',
        message: error.error?.message || 'The request conflicts with the current state.',
        action: 'OK',
      };

    case 422:
      return {
        title: 'Validation Error',
        message: error.error?.message || 'The provided data is invalid.',
        action: 'OK',
      };

    case 429:
      return {
        title: 'Too Many Requests',
        message: 'You have made too many requests. Please wait before trying again.',
        action: 'OK',
      };

    case 500:
      return {
        title: 'Server Error',
        message: 'An internal server error occurred. Please try again later.',
        action: 'Retry',
      };

    case 502:
    case 503:
    case 504:
      return {
        title: 'Service Unavailable',
        message: 'The service is temporarily unavailable. Please try again later.',
        action: 'Retry',
      };

    default:
      return {
        title: 'Unexpected Error',
        message: error.error?.message || `An unexpected error occurred (${error.status}).`,
        action: 'OK',
      };
  }
}

/**
 * Error Handling Service
 * Provides methods for displaying error messages and handling specific error scenarios
 */
@Injectable({
  providedIn: 'root',
})
export class ErrorHandlingService {
  constructor(private snackBar: MatSnackBar) {}

  /**
   * Display error message to user
   */
  showError(error: HttpErrorResponse | string): void {
    let errorDetails: ErrorMessage;

    if (typeof error === 'string') {
      errorDetails = {
        title: 'Error',
        message: error,
        action: 'OK',
      };
    } else {
      errorDetails = getErrorMessage(error);
    }

    this.snackBar.open(errorDetails.message, errorDetails.action, {
      duration: 5000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  /**
   * Display success message to user
   */
  showSuccess(message: string, action: string = 'OK'): void {
    this.snackBar.open(message, action, {
      duration: 3000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  /**
   * Display warning message to user
   */
  showWarning(message: string, action: string = 'OK'): void {
    this.snackBar.open(message, action, {
      duration: 4000,
      panelClass: ['warning-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  /**
   * Display info message to user
   */
  showInfo(message: string, action: string = 'OK'): void {
    this.snackBar.open(message, action, {
      duration: 3000,
      panelClass: ['info-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  /**
   * Handle authentication errors
   */
  handleAuthError(): void {
    this.showError('Your session has expired. Please sign in again.');
    // Redirect to login page or trigger re-authentication
    // You can inject Router here and navigate to login
  }

  /**
   * Handle validation errors from API
   */
  handleValidationErrors(errors: { [key: string]: string[] }): string[] {
    const errorMessages: string[] = [];

    Object.keys(errors).forEach((field) => {
      const fieldErrors = errors[field];
      if (Array.isArray(fieldErrors)) {
        errorMessages.push(...fieldErrors);
      }
    });

    return errorMessages;
  }
}
