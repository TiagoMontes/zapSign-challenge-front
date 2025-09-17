# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Angular 20 application for ZapSign document management system integrating with a Django REST API backend. The application provides CRUD operations for Companies, Documents, and Signers with ZapSign API integration for electronic document signing.

## Development Commands

```bash
# Development server (http://localhost:4200)
npm start
# or
ng serve

# Build for production
npm run build
# or
ng build

# Run unit tests
npm test
# or
ng test

# Run tests in watch mode for development
ng test --watch

# Generate new components/services/modules
ng generate component features/component-name
ng generate service core/services/service-name
ng generate module features/module-name

# Build for specific environment
ng build --configuration=production
ng build --configuration=development
```

## Architecture

### API Integration Pattern
- **BaseApiService** (`src/app/core/services/base-api.service.ts`): Abstract base class handling common HTTP operations with standardized API response format
- All API services extend BaseApiService and implement entity-specific logic
- API responses follow standardized format: `{ success: boolean, code: number, message: string, data: T | null }`
- HTTP interceptor for global loading state management (`loading.interceptor.ts`)

### State Management
- Service-based state management using RxJS BehaviorSubjects
- LoadingService manages global loading states
- NotificationService handles user feedback across the application

### Project Structure
```
src/app/
├── core/               # Singleton services, interceptors, models
│   ├── interceptors/   # HTTP interceptors
│   ├── models/         # TypeScript interfaces
│   └── services/       # API and utility services
├── features/           # Feature modules (companies, documents, signers)
├── shared/             # Reusable components, directives, pipes
└── layout/             # App layout components
```

### Environment Configuration
- Environment files in `src/environments/`
- API URL configured via `environment.apiUrl`
- Development: `http://localhost:8000/api`
- Production: Configure in `environment.prod.ts`

## Backend API Endpoints

### Companies (`/api/companies/`)
- GET, POST, PUT, PATCH, DELETE operations
- Required fields: name, api_token

### Documents (`/api/documents/`)
- GET, POST, DELETE operations (no PUT/PATCH)
- POST creates document via ZapSign integration
- POST `/api/documents/{id}/analyze/` for AI analysis

### Signers (`/api/signers/`)
- Full CRUD operations
- Linked to documents via foreign key relationship

## Key Implementation Notes

### Document Creation Flow
1. Document created via POST to backend
2. Backend integrates with ZapSign API using company's api_token
3. Signers automatically created and linked
4. Document PDF URL and metadata returned

### AI Analysis Feature
- Triggered via `/api/documents/{id}/analyze/` endpoint
- Returns missing_topics, summary, and insights
- Use `force_reanalysis=true` to regenerate analysis

### Error Handling
- Global error interceptor in place
- Standardized error response format from API
- NotificationService displays user-friendly error messages

## Task Management

Implementation tasks are organized in `.claude/tasks/`:
- 01-project-setup.md: Initial configuration and dependencies
- 02-data-models.md: TypeScript interfaces and models
- 03-service-layer.md: API services implementation
- 04-routing-navigation.md: Application routing
- 05-companies-feature.md: Companies CRUD module
- 06-documents-feature.md: Documents management module
- 07-signers-feature.md: Signers CRUD module
- 08-ui-layout.md: Layout and navigation components
- 09-testing-quality.md: Unit and integration tests
- 10-deployment-optimization.md: Production optimization

## Angular Material Integration

Project uses Angular Material for UI components:
- Material modules imported as needed
- Custom theme configuration available
- Use Material components for consistent UX

## Testing Strategy

- Unit tests with Jasmine/Karma
- Service tests mock HTTP calls
- Component tests use TestBed configuration
- Run `ng test --code-coverage` for coverage report

## Performance Considerations

- Implement OnPush change detection for components
- Use trackBy functions in *ngFor loops
- Lazy load feature modules
- Implement virtual scrolling for large lists