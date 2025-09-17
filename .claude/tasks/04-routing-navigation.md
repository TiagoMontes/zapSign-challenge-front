# Routing and Navigation

## Overview
Implement comprehensive routing structure with lazy loading and proper navigation for the document management application.

## Route Structure

### Main Routes
```typescript
const routes: Routes = [
  {
    path: '',
    redirectTo: '/companies',
    pathMatch: 'full'
  },
  {
    path: 'companies',
    loadChildren: () => import('./features/companies/companies.routes').then(m => m.COMPANIES_ROUTES)
  },
  {
    path: 'documents',
    loadChildren: () => import('./features/documents/documents.routes').then(m => m.DOCUMENTS_ROUTES)
  },
  {
    path: 'signers',
    loadChildren: () => import('./features/signers/signers.routes').then(m => m.SIGNERS_ROUTES)
  },
  {
    path: '**',
    redirectTo: '/companies'
  }
];
```

### Feature Routes

#### Companies Routes
```typescript
export const COMPANIES_ROUTES: Routes = [
  {
    path: '',
    component: CompaniesListComponent
  },
  {
    path: 'create',
    component: CompanyFormComponent
  },
  {
    path: ':id',
    component: CompanyDetailComponent
  },
  {
    path: ':id/edit',
    component: CompanyFormComponent
  },
  {
    path: ':id/documents',
    component: CompanyDocumentsComponent
  }
];
```

#### Documents Routes
```typescript
export const DOCUMENTS_ROUTES: Routes = [
  {
    path: '',
    component: DocumentsListComponent
  },
  {
    path: 'create',
    component: DocumentFormComponent
  },
  {
    path: ':id',
    component: DocumentDetailComponent
  },
  {
    path: ':id/analysis',
    component: DocumentAnalysisComponent
  }
];
```

#### Signers Routes
```typescript
export const SIGNERS_ROUTES: Routes = [
  {
    path: '',
    component: SignersListComponent
  },
  {
    path: 'create',
    component: SignerFormComponent
  },
  {
    path: ':id',
    component: SignerDetailComponent
  },
  {
    path: ':id/edit',
    component: SignerFormComponent
  }
];
```

## Navigation Structure

### Main Navigation
- [ ] Companies (list, create, edit, view)
- [ ] Documents (list, create, view, analyze)
- [ ] Signers (list, create, edit, view)

### Breadcrumbs
- [ ] Implement breadcrumb service
- [ ] Show current navigation path
- [ ] Allow navigation back to parent routes

### Route Guards
- [ ] Create route guards if needed
- [ ] Implement unsaved changes guard for forms

## Tasks

### 1. Setup Main Routing
- [ ] Configure app.routes.ts with lazy loading
- [ ] Create feature route files
- [ ] Test all route navigation

### 2. Navigation Components
- [ ] Create main navigation component
- [ ] Implement breadcrumb component
- [ ] Add navigation highlighting for active routes

### 3. Route Utilities
- [ ] Create routing helper service
- [ ] Add navigation utilities
- [ ] Implement programmatic navigation helpers

## File Structure
```
src/app/
├── app.routes.ts
├── features/
│   ├── companies/
│   │   └── companies.routes.ts
│   ├── documents/
│   │   └── documents.routes.ts
│   └── signers/
│       └── signers.routes.ts
├── layout/
│   ├── navigation/
│   │   └── navigation.component.ts
│   └── breadcrumb/
│       └── breadcrumb.component.ts
└── core/
    ├── guards/
    └── services/
        └── navigation.service.ts
```

## User Flow Examples

### Company Management Flow
1. `/companies` - List all companies
2. `/companies/create` - Create new company
3. `/companies/:id` - View company details
4. `/companies/:id/edit` - Edit company
5. `/companies/:id/documents` - View company documents

### Document Management Flow
1. `/documents` - List all documents
2. `/documents/create` - Create new document (with ZapSign)
3. `/documents/:id` - View document details and signers
4. `/documents/:id/analysis` - View AI analysis

### Signer Management Flow
1. `/signers` - List all signers
2. `/signers/create` - Create new signer
3. `/signers/:id` - View signer details
4. `/signers/:id/edit` - Edit signer

## Acceptance Criteria
- All routes properly configured with lazy loading
- Navigation works smoothly without page reloads
- Breadcrumbs show correct navigation path
- Active route highlighted in navigation
- Proper error handling for invalid routes
- Mobile-responsive navigation
- Route guards implemented where needed
- All routes tested and working