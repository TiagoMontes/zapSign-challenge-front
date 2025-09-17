# Documents Feature Implementation

## Overview
Implement document management with ZapSign integration, AI analysis, and signer management. Note: Documents don't support PUT/PATCH operations.

## Components to Create

### 1. Documents List Component
- [ ] Display documents in a data table/cards
- [ ] Filter by company
- [ ] Show document status and details
- [ ] Actions: View, Delete, Create New, Analyze
- [ ] Show associated signers count

### 2. Document Form Component (Create Only)
- [ ] Reactive form for document creation
- [ ] Company selection dropdown
- [ ] Document name input
- [ ] PDF URL input with validation
- [ ] Dynamic signer addition (name + email)
- [ ] ZapSign integration for document creation
- [ ] Loading states during ZapSign API calls

### 3. Document Detail Component
- [ ] Display document information
- [ ] Show ZapSign status and details
- [ ] List all signers with their status
- [ ] AI analysis section with generate button
- [ ] Actions: Delete, Analyze, Manage Signers

### 4. Document Analysis Component
- [ ] Display AI analysis results
- [ ] Generate new analysis button
- [ ] Analysis history if multiple analyses
- [ ] Export analysis functionality

### 5. Document Signers Component
- [ ] List signers for specific document
- [ ] Add/remove signers
- [ ] Show signing status
- [ ] Signer management actions

## ZapSign Integration

### Document Creation Flow
1. User fills document form with signers
2. Frontend validates data
3. POST to `/api/documents/` with:
   ```json
   {
     "name": "Document Name",
     "company_id": 1,
     "pdf_url": "https://example.com/document.pdf",
     "signers": [
       {"name": "John Doe", "email": "john@example.com"},
       {"name": "Jane Smith", "email": "jane@example.com"}
     ]
   }
   ```
4. Backend integrates with ZapSign API
5. Document created with ZapSign doc ID
6. Success feedback to user

### AI Analysis Flow
1. User clicks "Generate AI Analysis" on document
2. POST to `/api/documents/{id}/analyze/`
3. Backend processes document with AI
4. Analysis results displayed to user
5. Analysis saved for future reference

## Features Implementation

### CRUD Operations
```typescript
// List Documents
getDocuments(companyId?: number) -> Document[]

// Create Document (with ZapSign)
createDocument(data: CreateDocumentRequest) -> Document

// Delete Document
deleteDocument(id: number) -> success

// Get Document Details
getDocument(id: number) -> Document

// AI Analysis
analyzeDocument(id: number) -> DocumentAnalysis
```

### Form Structure
```typescript
interface DocumentFormValue {
  name: string;
  company_id: number;
  pdf_url: string;
  signers: {
    name: string;
    email: string;
  }[];
}
```

## User Interface

### Documents List
```
+---------------------------------------------------+
|  Documents Management                             |
|  [+ Create Document] [Filter: Company ▼]         |
+---------------------------------------------------+
| Name       | Company  | Status    | Signers | Actions |
+---------------------------------------------------+
| Contract A | Acme Inc | Pending   | 2/3     | 👁 🧠 🗑️ |
| Contract B | XYZ Corp | Completed | 1/1     | 👁 🧠 🗑️ |
+---------------------------------------------------+
```

### Document Creation Form
```
+---------------------------------------------------+
|  Create Document                                  |
+---------------------------------------------------+
| Document Name: [_________________________]        |
| Company:       [Select Company ▼]                |
| PDF URL:       [_________________________]        |
|                                                   |
| Signers:                                          |
| 1. Name: [______________] Email: [_______________] |
| 2. Name: [______________] Email: [_______________] |
| [+ Add Signer] [- Remove]                         |
|                                                   |
| [Cancel] [Create Document]                        |
+---------------------------------------------------+
```

### Document Detail
```
+---------------------------------------------------+
|  Document Details                [Analyze] [Delete]|
+---------------------------------------------------+
| Name: Important Contract                          |
| Company: Acme Inc                                 |
| Status: Pending Signatures                        |
| ZapSign ID: zap_abc123456                         |
| Created: 2024-01-01                               |
+---------------------------------------------------+
|  Signers (2/3 signed)                            |
|  ✅ John Doe - john@example.com (Signed)          |
|  ✅ Jane Smith - jane@example.com (Signed)        |
|  ⏳ Bob Wilson - bob@example.com (Pending)        |
+---------------------------------------------------+
|  AI Analysis                    [Generate New]    |
|  Last analyzed: 2024-01-15                        |
|  "This contract contains standard terms..."       |
|  [View Full Analysis]                             |
+---------------------------------------------------+
```

### AI Analysis View
```
+---------------------------------------------------+
|  AI Analysis - Important Contract                 |
+---------------------------------------------------+
| Generated: 2024-01-15 10:30 AM                    |
| Document: Important Contract                       |
|                                                   |
| Analysis Results:                                 |
| ============================================      |
|                                                   |
| [Full AI analysis text here...]                  |
|                                                   |
| Key Points:                                       |
| • Contract term: 2 years                         |
| • Payment terms: Net 30                          |
| • Renewal clause: Automatic                       |
|                                                   |
| [Generate New Analysis] [Export] [Back]           |
+---------------------------------------------------+
```

## File Structure
```
src/app/features/documents/
├── components/
│   ├── documents-list/
│   │   ├── documents-list.component.ts
│   │   ├── documents-list.component.html
│   │   └── documents-list.component.scss
│   ├── document-form/
│   │   ├── document-form.component.ts
│   │   ├── document-form.component.html
│   │   └── document-form.component.scss
│   ├── document-detail/
│   │   ├── document-detail.component.ts
│   │   ├── document-detail.component.html
│   │   └── document-detail.component.scss
│   ├── document-analysis/
│   │   ├── document-analysis.component.ts
│   │   ├── document-analysis.component.html
│   │   └── document-analysis.component.scss
│   └── document-signers/
│       ├── document-signers.component.ts
│       ├── document-signers.component.html
│       └── document-signers.component.scss
├── documents.routes.ts
└── index.ts
```

## Tasks

### 1. Component Creation
- [ ] Create documents-list component with filtering
- [ ] Create document-form component with dynamic signers
- [ ] Create document-detail component with full information
- [ ] Create document-analysis component for AI results
- [ ] Create document-signers component for signer management

### 2. ZapSign Integration
- [ ] Implement document creation with ZapSign API
- [ ] Handle ZapSign responses and errors
- [ ] Display ZapSign document status
- [ ] Implement proper loading states

### 3. AI Analysis Feature
- [ ] Create AI analysis trigger
- [ ] Display analysis results
- [ ] Handle analysis loading and errors
- [ ] Implement analysis history

### 4. Signer Management
- [ ] Dynamic signer form array
- [ ] Signer validation (email format, required fields)
- [ ] Display signer status from ZapSign
- [ ] Signer CRUD operations

### 5. Form Implementation
- [ ] Setup reactive forms with FormArray for signers
- [ ] PDF URL validation
- [ ] Company selection integration
- [ ] Form submission with proper error handling

## Acceptance Criteria
- Document creation integrates with ZapSign API
- AI analysis functionality working
- Dynamic signer management in forms
- Proper error handling for ZapSign failures
- Loading states during API operations
- Document status tracking from ZapSign
- Responsive design for all components
- No edit functionality (create/delete only)
- Integration with companies and signers
- Success feedback for all operations