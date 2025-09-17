# Service Layer Implementation

## Overview
Implement comprehensive service layer for API communication with proper error handling, loading states, and reactive patterns.

## Services to Implement

### 1. HTTP Interceptor
- [ ] Create error handling interceptor
- [ ] Create loading interceptor
- [ ] Add request/response logging (dev only)
- [ ] Handle API response transformation

### 2. Base API Service
- [ ] Create base service with common HTTP methods
- [ ] Implement generic CRUD operations
- [ ] Add proper error handling
- [ ] Include retry logic for failed requests

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
- [ ] Create custom error types
- [ ] Implement user-friendly error messages
- [ ] Add retry logic for network errors
- [ ] Log errors for debugging

### Loading States
- [ ] Create loading service
- [ ] Implement loading indicators
- [ ] Handle concurrent requests
- [ ] Prevent duplicate requests

### Caching Strategy
- [ ] Implement simple in-memory caching
- [ ] Cache invalidation on mutations
- [ ] TTL for cached data

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
- [ ] Create base API service with common functionality
- [ ] Implement all three entity services
- [ ] Create HTTP interceptors
- [ ] Add error handling service
- [ ] Create loading service
- [ ] Write unit tests for services
- [ ] Add service documentation

## Acceptance Criteria
- All CRUD operations implemented with proper typing
- Error handling covers all edge cases
- Loading states properly managed
- Services follow Angular best practices
- Proper dependency injection
- Observable patterns used correctly
- Services are testable and well-documented