# Repository Guidelines

## Project Structure & Module Organization

- Source lives in `src/`; entrypoints: `src/main.ts`, `src/index.html`.
- Feature-first layout under `src/app/`:
  - `core/` (guards, interceptors, models, services)
  - `features/` (domain features: `companies/`, `documents/`, `signers/`, `dashboard/`)
  - `shared/` (reusable components, module, utilities)
  - `layout/` (shell, header, sidebar, breadcrumb)
  - `styles/` (global SCSS, variables, mixins)
- Assets are served from `public/`. Unit tests live beside code as `*.spec.ts`.
- Routing uses standalone routes (e.g., `*.routes.ts`); components are standalone.

## Build, Test, and Development Commands

- Install: `npm install`
- Dev server: `npm start` or `ng serve` (http://localhost:4200)
- Build (prod default): `npm run build` (outputs `dist/`)
- Dev watch build: `npm run watch`
- Unit tests: `npm test` or `ng test`
- Coverage: `ng test --code-coverage`
- Generate scaffolds (examples):
  - `ng generate component features/companies/components/company-card`
  - `ng generate service core/services/companies`

## Coding Style & Naming Conventions

- Formatting via Prettier (printWidth 100, single quotes). Run your editor’s format-on-save.
- `.editorconfig`: UTF-8, 2-space indent, trim trailing whitespace.
- File names (kebab-case):
  - Components `*.component.ts|html`, Services `*.service.ts`, Interfaces `*.interface.ts`, Guards `*.guard.ts`, Interceptors `*.interceptor.ts`, Routes `*.routes.ts`.
- Component selectors use `app-` prefix. Favor Angular standalone components and the official Angular Style Guide.
- Templates use Tailwind utility classes; keep classes readable and extracted into SCSS variables when repeated.

## Testing Guidelines

- Framework: Karma + Jasmine.
- Place specs next to sources; name with `*.spec.ts` and describe behavior (e.g., “should render title”).
- Add/extend tests for new logic and bug fixes; aim to keep or improve coverage (`ng test --code-coverage`).

## Commit & Pull Request Guidelines

- Use Conventional Commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`.
- PRs must include: clear description, linked issues, screenshots/GIFs for UI changes, and testing notes.
- Before opening a PR: run `npm test` and `npm run build`; ensure no type errors and lint/format passes.

## Security & Configuration Tips

- Do not commit secrets. Configure API URLs in `src/environments/environment*.ts`.
- Prefer Angular interceptors for auth/error handling; avoid storing tokens in code.
- Validate inputs and surface errors via shared notification/toast services.
