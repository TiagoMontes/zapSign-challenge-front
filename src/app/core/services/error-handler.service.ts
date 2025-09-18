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
        'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.',
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
            message || 'Falha na validação',
            errors
          );
        }
        return new ApiException(
          message || 'Dados de solicitação inválidos',
          code,
          errors,
          originalError
        );

      case HttpStatusCode.UNAUTHORIZED:
        return new ApiException(
          'Autenticação necessária. Faça login.',
          code,
          errors,
          originalError
        );

      case HttpStatusCode.FORBIDDEN:
        return new ApiException(
          'Você não tem permissão para executar esta ação.',
          code,
          errors,
          originalError
        );

      case HttpStatusCode.NOT_FOUND:
        return new ApiException(
          'O recurso solicitado não foi encontrado.',
          code,
          errors,
          originalError
        );

      case HttpStatusCode.CONFLICT:
        return new ApiException(
          message || 'Ocorreu um conflito. O recurso pode já existir.',
          code,
          errors,
          originalError
        );

      case HttpStatusCode.INTERNAL_SERVER_ERROR:
        return new ApiException(
          'Erro do servidor ocorreu. Tente novamente mais tarde.',
          code,
          errors,
          originalError
        );

      default:
        return new ApiException(
          message || 'Ocorreu um erro inesperado',
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
        message = 'Solicitação inválida. Verifique sua entrada.';
        break;
      case 401:
        message = 'Autenticação necessária. Faça login.';
        break;
      case 403:
        message = 'Você não tem permissão para executar esta ação.';
        break;
      case 404:
        message = 'O recurso solicitado não foi encontrado.';
        break;
      case 409:
        message = 'Ocorreu um conflito. O recurso pode já existir.';
        break;
      case 422:
        message = 'Dados inválidos fornecidos. Verifique sua entrada.';
        break;
      case 429:
        message = 'Muitas solicitações. Aguarde e tente novamente.';
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        message = 'Erro do servidor ocorreu. Tente novamente mais tarde.';
        break;
      default:
        message = `Erro inesperado ocorreu (${error.status}). Tente novamente.`;
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
      return `Falha na validação: ${error.errors.map(e => e.message).join(', ')}`;
    }

    if (error instanceof NetworkException) {
      return error.message;
    }

    if (error instanceof ApiException) {
      return error.message;
    }

    return 'Ocorreu um erro inesperado. Tente novamente.';
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