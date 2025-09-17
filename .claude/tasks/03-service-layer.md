# Service Layer Implementation

## Overview
Implement comprehensive service layer for API communication with proper error handling, loading states, and reactive patterns.

## Services to Implement

### 1. HTTP Interceptor
- [x] Create error handling interceptor
- [x] Create loading interceptor
- [x] Add request/response logging (dev only)
- [x] Handle API response transformation

### 2. Base API Service
- [x] Create base service with common HTTP methods
- [x] Implement generic CRUD operations
- [x] Add proper error handling
- [x] Include retry logic for failed requests

### 3. Companies Service
```typescript
@Injectable({
  providedIn: 'root'
})
export class CompaniesService {
  // CRUD operations
  getCompanies(): Observable<ApiResponse<Company[]>>
  getCompany(id: number): Observable<ApiResponse<Company>>
  createCompany(company: CreateCompanyRequest): Observable<ApiResponse<Company>>
  updateCompany(id: number, company: UpdateCompanyRequest): Observable<ApiResponse<Company>>
  deleteCompany(id: number): Observable<ApiResponse<null>>
}
```

### 4. Documents Service
```typescript
@Injectable({
  providedIn: 'root'
})
export class DocumentsService {
  // CRUD operations (no PUT/PATCH)
  getDocuments(companyId?: number): Observable<ApiResponse<Document[]>>
  getDocument(id: number): Observable<ApiResponse<Document>>
  createDocument(document: CreateDocumentRequest): Observable<ApiResponse<Document>>
  deleteDocument(id: number): Observable<ApiResponse<null>>

  // ZapSign integration
  analyzeDocument(id: number): Observable<ApiResponse<DocumentAnalysis>>
}
```

### 5. Signers Service
```typescript
@Injectable({
  providedIn: 'root'
})
export class SignersService {
  // CRUD operations
  getSigners(documentId?: number): Observable<ApiResponse<Signer[]>>
  getSigner(id: number): Observable<ApiResponse<Signer>>
  createSigner(signer: CreateSignerRequest): Observable<ApiResponse<Signer>>
  updateSigner(id: number, signer: UpdateSignerRequest): Observable<ApiResponse<Signer>>
  deleteSigner(id: number): Observable<ApiResponse<null>>
}
```

## Implementation Details

### Error Handling Strategy
- [x] Create custom error types
- [x] Implement user-friendly error messages
- [x] Add retry logic for network errors
- [x] Log errors for debugging

### Loading States
- [x] Create loading service
- [x] Implement loading indicators
- [x] Handle concurrent requests
- [x] Prevent duplicate requests

### Caching Strategy
- [x] Implement simple in-memory caching
- [x] Cache invalidation on mutations
- [x] TTL for cached data

## File Structure
```
src/app/core/services/
├── base-api.service.ts
├── companies.service.ts
├── documents.service.ts
├── signers.service.ts
├── loading.service.ts
├── error-handler.service.ts
└── index.ts

src/app/core/interceptors/
├── error.interceptor.ts
├── loading.interceptor.ts
└── index.ts
```

## Tasks
- [x] Create base API service with common functionality
- [x] Implement all three entity services
- [x] Create HTTP interceptors
- [x] Add error handling service
- [x] Create loading service
- [x] Write unit tests for services
- [x] Add service documentation

## Acceptance Criteria
- [x] All CRUD operations implemented with proper typing
- [x] Error handling covers all edge cases
- [x] Loading states properly managed
- [x] Services follow Angular best practices
- [x] Proper dependency injection
- [x] Observable patterns used correctly
- [x] Services are testable and well-documented

## ✅ Status: COMPLETED
Task completed successfully on 2025-09-16. Comprehensive service layer implemented with:
- Enhanced BaseApiService with caching and retry logic
- Full CRUD operations for Companies, Documents, and Signers
- Custom error handling with ErrorHandlerService and CacheService
- ZapSign API integration for document creation and analysis
- Reactive state management with BehaviorSubjects
- Production-ready error handling, caching, and loading states
- Complete integration with existing interceptors