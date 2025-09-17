# Data Models and Interfaces

## Overview
Create TypeScript interfaces and models for all API entities and responses.

## API Response Format
All endpoints use standardized format:
```typescript
interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: T | null;
}
```

## Models to Create

### 1. Company Model
```typescript
interface Company {
  id: number;
  name: string;
  api_token: string;
  created_at: string;
  updated_at: string;
}

interface CreateCompanyRequest {
  name: string;
  api_token: string;
}

interface UpdateCompanyRequest {
  name?: string;
  api_token?: string;
}
```

### 2. Document Model
```typescript
interface Document {
  id: number;
  name: string;
  company_id: number;
  status: string;
  zapsign_doc_id?: string;
  created_at: string;
  updated_at: string;
  signers?: Signer[];
}

interface CreateDocumentRequest {
  name: string;
  company_id: number;
  pdf_url: string;
  signers: CreateSignerRequest[];
}

interface DocumentAnalysis {
  id: number;
  document_id: number;
  analysis_text: string;
  created_at: string;
}
```

### 3. Signer Model
```typescript
interface Signer {
  id: number;
  name: string;
  email: string;
  document_id: number;
  status?: string;
  signed_at?: string;
  created_at: string;
  updated_at: string;
}

interface CreateSignerRequest {
  name: string;
  email: string;
  document_id?: number; // Optional for document creation flow
}

interface UpdateSignerRequest {
  name?: string;
  email?: string;
}
```

## Tasks
- [x] Create core/models/api-response.interface.ts
- [x] Create core/models/company.interface.ts
- [x] Create core/models/document.interface.ts
- [x] Create core/models/signer.interface.ts
- [x] Create core/models/index.ts for exports
- [x] Add validation helpers if needed

## File Structure
```
src/app/core/models/
├── api-response.interface.ts
├── company.interface.ts
├── document.interface.ts
├── signer.interface.ts
└── index.ts
```

## Acceptance Criteria
- [x] All interfaces properly typed with strict TypeScript
- [x] Consistent naming conventions
- [x] Complete coverage of API requirements
- [x] Proper imports/exports structure
- [x] Documentation for complex interfaces

## ✅ Status: COMPLETED
Task completed successfully on 2025-09-16. All TypeScript data models have been implemented with:
- Complete API response structure matching
- ZapSign integration fields added
- Enhanced type safety with enums
- Comprehensive JSDoc documentation
- Production-ready interfaces for all entities