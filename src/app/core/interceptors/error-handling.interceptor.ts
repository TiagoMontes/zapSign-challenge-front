import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

interface ErrorMessage {
  title: string;
  message: string;
  action?: string;
}

/**
 * HTTP Error Handling Interceptor (Functional)
 * Handles global error responses and displays user-friendly messages
 */
export const errorHandlingInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const errorDetails = getErrorMessage(error);

      // Show error message to user (you might want to inject MatSnackBar differently)
      console.error('HTTP Error:', {
        status: error.status,
        statusText: error.statusText,
        url: error.url,
        message: errorDetails.message,
        error: error.error
      });

      // You can implement additional error handling logic here
      // such as redirecting to login page for 401 errors,
      // showing retry options, etc.

      return throwError(() => error);
    })
  );
};

/**
 * Get user-friendly error message based on HTTP status
 */
function getErrorMessage(error: HttpErrorResponse): ErrorMessage {
  switch (error.status) {
    case 0:
      return {
        title: 'Connection Error',
        message: 'Unable to connect to the server. Please check your internet connection.',
        action: 'Retry'
      };

    case 400:
      return {
        title: 'Invalid Request',
        message: error.error?.message || 'The request contains invalid data.',
        action: 'OK'
      };

    case 401:
      return {
        title: 'Authentication Required',
        message: 'You need to sign in to access this resource.',
        action: 'Sign In'
      };

    case 403:
      return {
        title: 'Access Denied',
        message: 'You do not have permission to access this resource.',
        action: 'OK'
      };

    case 404:
      return {
        title: 'Not Found',
        message: 'The requested resource could not be found.',
        action: 'OK'
      };

    case 409:
      return {
        title: 'Conflict',
        message: error.error?.message || 'The request conflicts with the current state.',
        action: 'OK'
      };

    case 422:
      return {
        title: 'Validation Error',
        message: error.error?.message || 'The provided data is invalid.',
        action: 'OK'
      };

    case 429:
      return {
        title: 'Too Many Requests',
        message: 'You have made too many requests. Please wait before trying again.',
        action: 'OK'
      };

    case 500:
      return {
        title: 'Server Error',
        message: 'An internal server error occurred. Please try again later.',
        action: 'Retry'
      };

    case 502:
    case 503:
    case 504:
      return {
        title: 'Service Unavailable',
        message: 'The service is temporarily unavailable. Please try again later.',
        action: 'Retry'
      };

    default:
      return {
        title: 'Unexpected Error',
        message: error.error?.message || `An unexpected error occurred (${error.status}).`,
        action: 'OK'
      };
  }
}

/**
 * Error Handling Service
 * Provides methods for displaying error messages and handling specific error scenarios
 */
@Injectable({
  providedIn: 'root'
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
        action: 'OK'
      };
    } else {
      errorDetails = getErrorMessage(error);
    }

    this.snackBar.open(
      errorDetails.message,
      errorDetails.action,
      {
        duration: 5000,
        panelClass: ['error-snackbar'],
        horizontalPosition: 'end',
        verticalPosition: 'top'
      }
    );
  }

  /**
   * Display success message to user
   */
  showSuccess(message: string, action: string = 'OK'): void {
    this.snackBar.open(
      message,
      action,
      {
        duration: 3000,
        panelClass: ['success-snackbar'],
        horizontalPosition: 'end',
        verticalPosition: 'top'
      }
    );
  }

  /**
   * Display warning message to user
   */
  showWarning(message: string, action: string = 'OK'): void {
    this.snackBar.open(
      message,
      action,
      {
        duration: 4000,
        panelClass: ['warning-snackbar'],
        horizontalPosition: 'end',
        verticalPosition: 'top'
      }
    );
  }

  /**
   * Display info message to user
   */
  showInfo(message: string, action: string = 'OK'): void {
    this.snackBar.open(
      message,
      action,
      {
        duration: 3000,
        panelClass: ['info-snackbar'],
        horizontalPosition: 'end',
        verticalPosition: 'top'
      }
    );
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

    Object.keys(errors).forEach(field => {
      const fieldErrors = errors[field];
      if (Array.isArray(fieldErrors)) {
        errorMessages.push(...fieldErrors);
      }
    });

    return errorMessages;
  }
}