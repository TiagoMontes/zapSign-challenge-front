# Signers Feature Implementation

## Overview

Implement signer management functionality with document-first approach. Signers are accessed and managed through document details page, with navigation to individual signer pages for detailed management.

## Architecture Changes

Signers are now managed within the document context:

- Document details page includes signers section with clickable signer items
- Individual signer pages accessible via `/signers/{id}` for detailed management
- Signers displayed with status and clickable navigation

## API Integration

### Updated Document Response

Documents now include signers array in the response:

```json
{
  "success": true,
  "code": 200,
  "message": "Document retrieved successfully",
  "data": {
    "id": 10,
    "company_id": 10,
    "name": "document_test_django",
    "signers": [
      {
        "id": 19,
        "name": "tiago M",
        "email": "tiagosantos6303@gmail.com",
        "token": "2752ae48-e7ab-4c06-9040-86a77281a982",
        "status": "new",
        "external_id": "",
        "created_at": null,
        "last_updated_at": null
      },
      {
        "id": 20,
        "name": "Sarah M",
        "email": "sarahsartorelli71@gmail.com",
        "token": "fe91ae69-db6b-4789-9b00-adb3bc6899f7",
        "status": "new",
        "external_id": "",
        "created_at": null,
        "last_updated_at": null
      }
    ],
    "status": "pending",
    "token": "de02b4d8-a747-4b84-ae54-9bae24749a77",
    "url_pdf": "https://testbuckettiagor.s3.us-east-2.amazonaws.com/Git+e+Rebase_+Guia+Completo+para+Leigos.pdf"
  }
}
```

## Components to Create

### 1. Document Signers Section (Update Existing)

- [x] Already exists in document-detail component
- [ ] Make signer items clickable to navigate to individual signer pages
- [ ] Update signer display to show proper status from API
- [ ] Add proper routing to `/signers/{id}` when clicking on signers

### 2. Signer Detail Component (NEW)

- [ ] Display signer information at `/signers/{id}`
- [ ] Show associated document details
- [ ] Show signing status and ZapSign token
- [ ] Show signing history and timeline
- [ ] Quick actions (Edit, Delete, Back to Document)
- [ ] Display signer-specific ZapSign details

### 3. Signer Form Component (Create/Edit)

- [ ] Reactive form with validation for signer management
- [ ] Edit mode for individual signer updates
- [ ] Form fields: name, email, status
- [ ] Email validation and formatting
- [ ] Handle signer status updates
- [ ] Loading states during submission

### 4. Signer Status Component

- [ ] Visual status indicators for different signing states
- [ ] Status mapping: "new" → "Pending", "signed" → "Signed", etc.
- [ ] Color-coded status badges
- [ ] Status-specific actions and tooltips

## Features Implementation

### User Flow

1. **Document Navigation**: User views document details at `/documents/{id}`
2. **Signers Section**: Document details displays signers with status and names
3. **Signer Access**: User clicks on a signer to navigate to `/signers/{id}`
4. **Signer Management**: Individual signer page shows detailed information and management options
5. **Back Navigation**: Easy return to document details from signer page

### CRUD Operations

```typescript
// Get Signer Details (standalone endpoint)
getSigner(id: number) -> Signer & { documents: Document[] }

// Update Signer
updateSigner(id: number, data: UpdateSignerRequest) -> Signer

// Delete Signer
deleteSigner(id: number) -> success

// Get Signers by Document (embedded in document response)
getDocument(id: number) -> Document & { signers: Signer[] }
```

### Status Management

- [ ] Status mapping from API: "new" → "Pending", "signed" → "Signed", "declined" → "Declined"
- [ ] Show ZapSign token for each signer
- [ ] Display external_id when available
- [ ] Handle null created_at/last_updated_at dates gracefully
- [ ] Visual indicators for different statuses

### Form Validation (Signer Edit)

- [ ] Name: required, min 2 characters, max 100 characters
- [ ] Email: required, valid email format
- [ ] Status: read-only (managed by ZapSign)
- [ ] Custom validators for business rules

## User Interface

### Document Signers Section (Updated)

```
+---------------------------------------------------+
|  Signers (2)                                      |
+---------------------------------------------------+
| 👤 Tiago M        | Pending   | tiagosantos@... | → |
| 👤 Sarah M        | Pending   | sarahsartorelli@| → |
+---------------------------------------------------+
| Empty state: No signers added to this document   |
+---------------------------------------------------+
```

### Individual Signer Page

```
+---------------------------------------------------+
|  Signer Details                   [Edit] [Delete]|
|  [← Back to Document]                             |
+---------------------------------------------------+
| Name: Tiago M                                     |
| Email: tiagosantos6303@gmail.com                  |
| Status: 🟡 Pending                                |
| ZapSign Token: 2752ae48-e7ab-4c06-9040-86a77... |
| External ID: (not set)                           |
| Created: (not available)                         |
| Updated: (not available)                         |
+---------------------------------------------------+
|  Associated Documents                             |
|  📄 document_test_django - Status: Pending       |
+---------------------------------------------------+
```

### Signer Edit Form

```
+---------------------------------------------------+
|  Edit Signer                                      |
|  [← Back to Signer Details]                      |
+---------------------------------------------------+
| Name:     [Tiago M_________________]              |
| Email:    [tiagosantos6303@gmail.com]            |
| Status:   Pending (managed by ZapSign)           |
|                                                   |
| [Cancel] [Save Changes]                           |
+---------------------------------------------------+
```

### Signer Status Indicators

```
🟢 Signed (Green) - status: "signed"
🟡 Pending (Yellow/Orange) - status: "new"
🔴 Declined (Red) - status: "declined"
🔵 Invited (Blue) - status: "invited"
⚠️ Error (Red with warning) - status: "error"
```

### Routing Structure

```
/documents/{id}          # Document details with signers section
/signers/{id}           # Individual signer details page
/signers/{id}/edit      # Edit signer form
```

## File Structure

```
src/app/features/signers/
├── components/
│   ├── signer-detail/           # NEW - individual signer page
│   │   ├── signer-detail.component.ts
│   │   ├── signer-detail.component.html
│   │   └── signer-detail.component.scss
│   ├── signer-form/            # NEW - edit signer form
│   │   ├── signer-form.component.ts
│   │   ├── signer-form.component.html
│   │   └── signer-form.component.scss
│   └── signer-status/          # NEW - status indicator component
│       ├── signer-status.component.ts
│       ├── signer-status.component.html
│       └── signer-status.component.scss
├── signers.routes.ts            # NEW - signer routing
└── index.ts

src/app/features/documents/components/document-detail/
└── document-detail.component.html    # UPDATE - make signers clickable
```

## Navigation Flow

### From Document to Signer

1. User views document at `/documents/{id}`
2. Document displays signers section with list of signers
3. Each signer is clickable and navigates to `/signers/{signer_id}`
4. Signer detail page provides full management capabilities
5. "Back to Document" returns to original document

### Signer Management

- Individual signer pages for detailed management
- Edit functionality for signer information
- Status tracking and ZapSign integration
- Document association display

## Tasks

### 1. Update Document Detail Component

- [ ] Make signer items in document detail clickable
- [ ] Add navigation to `/signers/{id}` when clicking on signers
- [ ] Update signer status display to use new API format
- [ ] Handle empty state when no signers exist

### 2. Create Signer Detail Component

- [ ] Create individual signer page at `/signers/{id}`
- [ ] Display comprehensive signer information
- [ ] Show associated documents
- [ ] Add "Back to Document" navigation
- [ ] Implement Edit and Delete actions

### 3. Create Signer Form Component

- [ ] Setup reactive form for signer editing
- [ ] Implement name and email validation
- [ ] Handle form submission and API integration
- [ ] Add proper error handling and loading states

### 4. Create Signer Status Component

- [ ] Visual status indicators for different signing states
- [ ] Map API status values to user-friendly labels
- [ ] Color-coded status badges with proper styling
- [ ] Responsive status display

### 5. Implement Signer Service Integration

- [ ] Add getSigner method to retrieve individual signer details
- [ ] Add updateSigner method for editing signer information
- [ ] Add deleteSigner method with proper error handling
- [ ] Implement proper caching and state management

### 6. Setup Routing

- [ ] Create signers routes module
- [ ] Configure routing for `/signers/{id}` and `/signers/{id}/edit`
- [ ] Add proper route guards and navigation
- [ ] Integrate with main app routing

## Acceptance Criteria

- Signers accessible through document details page (document-first approach)
- Clickable signer items that navigate to individual signer pages
- Individual signer management at `/signers/{id}` with full details
- Edit functionality for signer information (name, email)
- Status tracking with proper visual indicators
- Back navigation from signer pages to source document
- Integration with updated API response format (signers array in document)
- Proper handling of ZapSign status values and tokens
- Responsive design for all signer components
- Proper error handling and loading states
- Success feedback for all operations
- Mobile-responsive signer management interface
