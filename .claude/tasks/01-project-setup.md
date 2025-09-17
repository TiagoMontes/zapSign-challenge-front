# Project Setup and Configuration

## Overview
Setup Angular 20 project with all necessary dependencies and configurations for ZapSign document management application.

## Tasks

### 1. Dependencies Installation
- [ ] Install Angular Material + CDK
- [ ] Install Angular Flex Layout (if needed)
- [ ] Configure Angular Material theming
- [ ] Add HTTP client configuration

### 2. Environment Configuration
- [ ] Setup environment.ts files for API endpoints
- [ ] Configure base API URL
- [ ] Setup environment-specific settings

### 3. App Configuration
- [ ] Configure HTTP client in app.config.ts
- [ ] Setup global error handling
- [ ] Configure routing
- [ ] Add Material theme setup

### 4. Project Structure
```
src/
├── app/
│   ├── core/
│   │   ├── services/
│   │   ├── interceptors/
│   │   ├── guards/
│   │   └── models/
│   ├── features/
│   │   ├── companies/
│   │   ├── documents/
│   │   └── signers/
│   ├── shared/
│   │   ├── components/
│   │   ├── directives/
│   │   └── pipes/
│   └── layout/
├── assets/
└── environments/
```

## Acceptance Criteria
- Angular Material properly configured with custom theme
- Environment configuration working for different environments
- HTTP client configured with proper interceptors
- Project structure follows Angular best practices
- All dependencies installed and working