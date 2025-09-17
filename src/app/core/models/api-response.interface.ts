/**
 * Common HTTP status codes used by the API
 */
export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500
}

/**
 * API error details interface for error responses
 */
export interface ApiError {
  /** Error field name (for validation errors) */
  field?: string;
  /** Error code identifier */
  code: string;
  /** Human-readable error message */
  message: string;
}

/**
 * Standardized API response wrapper used across all endpoints.
 * Provides consistent structure for success/error handling and data payload.
 *
 * @template T The type of data contained in the response
 */
export interface ApiResponse<T> {
  /** Indicates if the request was successful */
  success: boolean;
  /** HTTP status code or custom error code */
  code: HttpStatusCode;
  /** Human-readable message describing the response */
  message: string;
  /** Response payload data, null if request failed or no data */
  data: T | null;
  /** Error details for failed requests */
  errors?: ApiError[];
}