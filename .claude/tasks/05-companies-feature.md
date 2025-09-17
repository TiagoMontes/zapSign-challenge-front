# Companies Feature Implementation

## Overview
Implement complete CRUD functionality for Companies with a user-friendly interface and proper state management.

## Components to Create

### 1. Companies List Component
- [ ] Display companies in a data table/cards
- [ ] Search and filter functionality
- [ ] Pagination if needed
- [ ] Actions: View, Edit, Delete, Create New
- [ ] Show company details (name, API token, dates)

### 2. Company Form Component
- [ ] Reactive form with validation
- [ ] Create and Edit modes
- [ ] Form fields: name, api_token
- [ ] Proper validation rules
- [ ] Loading states during submission
- [ ] Success/error feedback

### 3. Company Detail Component
- [ ] Display company information
- [ ] Show associated documents
- [ ] Show associated signers
- [ ] Quick actions (Edit, Delete)
- [ ] Navigation to related entities

### 4. Company Documents Component
- [ ] List documents for specific company
- [ ] Create new document for company
- [ ] Manage document signers
- [ ] Document status and actions

## Features Implementation

### CRUD Operations
```typescript
// List Companies
getCompanies() -> Company[]

// Create Company
createCompany(data: CreateCompanyRequest) -> Company

// Update Company
updateCompany(id: number, data: UpdateCompanyRequest) -> Company

// Delete Company
deleteCompany(id: number) -> success

// Get Company Details
getCompany(id: number) -> Company
```

### Form Validation
- [ ] Company name: required, min 2 characters
- [ ] API token: required, valid format
- [ ] Unique constraints where applicable
- [ ] Custom validators if needed

### State Management
- [ ] Component-level state using signals
- [ ] Loading states for all operations
- [ ] Error handling with user feedback
- [ ] Success messages after operations

## User Interface

### Companies List
```
+------------------------------------------+
|  Companies Management                    |
|  [+ Create Company] [Search: ____]      |
+------------------------------------------+
| Name        | API Token     | Actions   |
+------------------------------------------+
| Company A   | tok_abc123    | 👁 ✏️ 🗑️   |
| Company B   | tok_def456    | 👁 ✏️ 🗑️   |
+------------------------------------------+
```

### Company Form
```
+------------------------------------------+
|  Create/Edit Company                     |
+------------------------------------------+
| Company Name: [________________]         |
| API Token:    [________________]         |
|                                          |
| [Cancel] [Save Company]                  |
+------------------------------------------+
```

### Company Detail
```
+------------------------------------------+
|  Company Details          [Edit] [Delete]|
+------------------------------------------+
| Name: Company ABC                        |
| API Token: tok_abc123456                 |
| Created: 2024-01-01                      |
| Updated: 2024-01-15                      |
+------------------------------------------+
|  Documents (5)           [View All]      |
|  • Document 1 - Pending                 |
|  • Document 2 - Signed                  |
+------------------------------------------+
|  Recent Signers (3)      [View All]      |
|  • John Doe - john@example.com           |
|  • Jane Smith - jane@example.com         |
+------------------------------------------+
```

## File Structure
```
src/app/features/companies/
├── components/
│   ├── companies-list/
│   │   ├── companies-list.component.ts
│   │   ├── companies-list.component.html
│   │   └── companies-list.component.scss
│   ├── company-form/
│   │   ├── company-form.component.ts
│   │   ├── company-form.component.html
│   │   └── company-form.component.scss
│   ├── company-detail/
│   │   ├── company-detail.component.ts
│   │   ├── company-detail.component.html
│   │   └── company-detail.component.scss
│   └── company-documents/
│       ├── company-documents.component.ts
│       ├── company-documents.component.html
│       └── company-documents.component.scss
├── companies.routes.ts
└── index.ts
```

## Tasks

### 1. Component Creation
- [ ] Create companies-list component with data table
- [ ] Create company-form component with reactive forms
- [ ] Create company-detail component with full information
- [ ] Create company-documents component for document management

### 2. Form Implementation
- [ ] Setup reactive forms with FormBuilder
- [ ] Add comprehensive validation
- [ ] Implement form submission logic
- [ ] Add loading and success states

### 3. Data Integration
- [ ] Connect components to CompaniesService
- [ ] Implement proper error handling
- [ ] Add loading indicators
- [ ] Implement data refresh patterns

### 4. User Experience
- [ ] Add confirmation dialogs for delete operations
- [ ] Implement search and filtering
- [ ] Add pagination if needed
- [ ] Implement responsive design

### 5. Navigation Integration
- [ ] Setup routing between components
- [ ] Implement breadcrumbs
- [ ] Add navigation guards if needed

## Acceptance Criteria
- Complete CRUD operations for companies
- Responsive and user-friendly interface
- Proper form validation and error handling
- Loading states and success feedback
- Search and filter functionality
- Confirmation dialogs for destructive actions
- Mobile-responsive design
- Integration with documents and signers
- No page reloads during operations
- Proper TypeScript typing throughout