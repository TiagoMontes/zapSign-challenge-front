# Documents Feature Implementation

## Overview
Implement document management within the companies context. Documents are accessed and managed through the company details page, with ZapSign integration, AI analysis, and signer management. Note: Documents don't support PUT/PATCH operations.

## Architecture Changes
Documents are now managed within the companies context:
- No standalone documents list - documents are viewed per company
- Company details page includes a documents section
- Document creation is initiated from company context with pre-filled company_id
- Documents section replaces "Recent Documents" in company details view

## Components to Update/Create

### 1. Company Detail Component Enhancement
- [ ] Add documents section to company-detail component
- [ ] Display company documents as clickable items
- [ ] Show document status and signer count
- [ ] Add "Create Document" button in company context
- [ ] Remove "Recent Documents" placeholder section

### 2. Document Section Component (New)
- [ ] Display documents list within company context
- [ ] Show document status and details for the specific company
- [ ] Actions: View (navigate to details), Delete, Create New
- [ ] Show associated signers count per document
- [ ] Handle empty state when company has no documents

### 3. Document Form Component (Create Only)
- [ ] Reactive form for document creation
- [ ] Pre-filled company context (no dropdown needed)
- [ ] Document name input
- [ ] PDF URL input with validation
- [ ] Dynamic signer addition (name + email)
- [ ] ZapSign integration for document creation
- [ ] Loading states during ZapSign API calls

### 4. Document Detail Component
- [ ] Display document information
- [ ] Show ZapSign status and details
- [ ] List all signers with their status
- [ ] AI analysis section with generate button
- [ ] Actions: Delete, Analyze, Manage Signers

### 5. Document Analysis Component
- [ ] Display AI analysis results
- [ ] Generate new analysis button
- [ ] Analysis history if multiple analyses
- [ ] Export analysis functionality

### 6. Document Signers Component
- [ ] List signers for specific document
- [ ] Add/remove signers
- [ ] Show signing status
- [ ] Signer management actions

## API Integration

### Company Details Endpoint
Company details now includes documents:
```json
{
  "success": true,
  "code": 200,
  "message": "Company retrieved successfully",
  "data": {
    "id": 10,
    "name": "company_test",
    "api_token": "179780ba-9822-4c74-b866-f88de0f29cc045fd2d53-5917-4f26-8a99-958648fea9bb",
    "created_at": "2025-09-15T18:59:31.488118+00:00",
    "last_updated_at": "2025-09-15T18:59:31.488135+00:00",
    "documents": [
      {
        "id": 18,
        "name": "documento teste 2",
        "status": "pending"
      }
    ]
  }
}
```

### Document Creation Flow
1. User clicks "Create Document" from company details page
2. Document form opens with company_id pre-filled
3. User fills document form with signers
4. Frontend validates data
5. POST to `/api/documents/` with:
   ```json
   {
     "name": "Document Name",
     "company_id": 10,
     "url_pdf": "https://example.com/document.pdf",
     "signers": [
       {"name": "John Doe", "email": "john@example.com"},
       {"name": "Jane Smith", "email": "jane@example.com"}
     ]
   }
   ```
6. Backend integrates with ZapSign API using company's api_token
7. Document created with ZapSign doc ID
8. Success feedback and redirect to company details or document details

### AI Analysis Flow
1. User clicks "Generate AI Analysis" on document
2. POST to `/api/documents/{id}/analyze/`
3. Backend processes document with AI
4. Analysis results displayed to user
5. Analysis saved for future reference

## Features Implementation

### Updated User Flow
1. **Company Navigation**: User navigates to Companies list (`/companies`)
2. **Company Selection**: User selects a company to view details (`/companies/{id}`)
3. **Company Details**: Company details page displays company info + documents section
4. **Document Access**: Each document in the list acts as a link to document details (`/documents/{id}`)
5. **Document Creation**: "Create Document" button available in company context
6. **Document Management**: Document creation form pre-fills company_id from context

### CRUD Operations
```typescript
// Get Company with Documents (replaces standalone list)
getCompany(id: number) -> Company & { documents: Document[] }

// Create Document (with ZapSign) - company context
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
  company_id: number; // Pre-filled from company context
  url_pdf: string;
  signers: {
    name: string;
    email: string;
  }[];
}
```

## User Interface

### Company Details with Documents Section
```
+---------------------------------------------------+
|  Company Details - Acme Inc                      |
+---------------------------------------------------+
| Name: Acme Inc                                    |
| API Token: ****-****-****-****                   |
| Created: 2025-09-15                               |
| Last Updated: 2025-09-15                          |
+---------------------------------------------------+
|  Documents                    [+ Create Document] |
+---------------------------------------------------+
| 📄 Contract A        | Pending   | 2/3 signers    |
| 📄 Contract B        | Completed | 1/1 signers    |
| 📄 NDA Agreement     | Pending   | 0/2 signers    |
+---------------------------------------------------+
| Empty state: No documents yet. Create your first  |
| document to get started.                          |
+---------------------------------------------------+
```

### Document Creation Form (Company Context)
```
+---------------------------------------------------+
|  Create Document for Acme Inc                    |
+---------------------------------------------------+
| Document Name: [_________________________]        |
| Company:       Acme Inc (pre-filled)             |
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
│   ├── document-section/          # NEW - for company details page
│   │   ├── document-section.component.ts
│   │   ├── document-section.component.html
│   │   └── document-section.component.scss
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
├── documents.routes.ts             # Updated routing
└── index.ts

src/app/features/companies/
├── components/
│   └── company-detail/             # UPDATED - includes document-section
│       ├── company-detail.component.ts
│       ├── company-detail.component.html
│       └── company-detail.component.scss
```

## Routing Changes

### Updated Routes
```typescript
// Remove standalone documents list route
// OLD: { path: 'documents', component: DocumentsListComponent }

// Keep individual document routes
{ path: 'documents/:id', component: DocumentDetailComponent }
{ path: 'documents/create', component: DocumentFormComponent } // Accessed from company context

// Company routes now handle documents context
{ path: 'companies/:id', component: CompanyDetailComponent } // Includes documents section
```

## Tasks

### 1. Architecture Updates
- [ ] Remove standalone documents list component and route
- [ ] Update company-detail component to include documents section
- [ ] Create document-section component for company details integration
- [ ] Update document-form to handle company context (pre-filled company_id)
- [ ] Update navigation to remove documents from main menu

### 2. Component Updates
- [ ] Enhance company-detail component with documents section
- [ ] Create document-section component with company-specific document list
- [ ] Update document-form component to work with company context
- [ ] Keep document-detail component with full information
- [ ] Keep document-analysis component for AI results
- [ ] Keep document-signers component for signer management

### 3. ZapSign Integration
- [ ] Implement document creation with ZapSign API in company context
- [ ] Handle ZapSign responses and errors
- [ ] Display ZapSign document status in company documents section
- [ ] Implement proper loading states

### 4. AI Analysis Feature
- [ ] Create AI analysis trigger
- [ ] Display analysis results
- [ ] Handle analysis loading and errors
- [ ] Implement analysis history

### 5. Signer Management
- [ ] Dynamic signer form array
- [ ] Signer validation (email format, required fields)
- [ ] Display signer status from ZapSign
- [ ] Signer CRUD operations

### 6. Form Implementation
- [ ] Setup reactive forms with FormArray for signers
- [ ] PDF URL validation
- [ ] Remove company selection (use context instead)
- [ ] Form submission with proper error handling and company context

### 7. API Integration Updates
- [ ] Update company service to handle documents in company details
- [ ] Implement document creation with company context
- [ ] Handle document deletion and refresh company view
- [ ] Implement proper error handling for company-document operations

## Acceptance Criteria
- Documents are accessed only through company context (no standalone list)
- Company details page displays documents section with company's documents
- Document creation works from company context with pre-filled company_id
- Document creation integrates with ZapSign API using company's api_token
- AI analysis functionality working
- Dynamic signer management in forms
- Proper error handling for ZapSign failures
- Loading states during API operations
- Document status tracking from ZapSign
- Responsive design for all components
- No edit functionality (create/delete only)
- Integration with companies and signers
- Success feedback for all operations
- Navigation updated to remove standalone documents menu
- Documents section replaces "Recent Documents" placeholder in company details
- Empty state handling when company has no documents
- Document items are clickable and navigate to document details
- Proper company context maintained throughout document workflows