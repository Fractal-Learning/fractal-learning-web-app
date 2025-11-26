# Cursor Rules Creation Todo List

This document tracks the creation and implementation of Cursor rules (`.cursorrules`) for the project.

## 1. Security Review Rules
- [x] **Define Authentication & Authorization Standards**
    - [x] Enforce server-side auth checks (Clerk `auth()` or `currentUser()`) in Server Actions and Route Handlers.
    - [x] Ensure Middleware protects private routes.
- [x] **Data Validation & Sanitization**
    - [x] Enforce Zod schema validation for all user inputs.
    - [x] Prevent SQL injection (ensure Drizzle ORM parameterization usage).
    - [x] Sanitize HTML content if rendering user-generated text.
- [x] **Secrets Management**
    - [x] Rule to prevent hardcoding secrets/API keys in code.
    - [x] Ensure environment variables are used for sensitive config.
- [x] **Dependency Security**
    - [x] Check for `npm audit` or equivalent workflow integration reminders.

## 2. TypeScript & Next.js Best Practices
- [ ] **TypeScript Strictness**
    - [ ] Enforce strict type checking (no `any` types).
    - [ ] Prefer `interface` or `type` definitions for all props and state.
    - [ ] Ensure return types are explicitly typed for exported functions.
- [ ] **Next.js App Router Patterns**
    - [ ] Enforce "use client" directive usage only when necessary (leaf components).
    - [ ] Prefer Server Components for data fetching.
    - [ ] Use `next/image` for image optimization.
    - [ ] Use `next/font` for font loading.
    - [ ] meaningful metadata exports for SEO.
- [ ] **Code Organization**
    - [ ] Enforce project structure (e.g., colocation of tests, specialized component folders).
    - [ ] Standardize naming conventions (kebab-case for files, PascalCase for components).

## 3. Testing Best Practices (Playwright & Vite)
- [ ] **E2E Testing (Playwright)**
    - [ ] Rule to ensure critical flows (Sign In, Onboarding) have E2E tests.
    - [ ] Use reliable locators (e.g., `getByRole`, `getByTestId`) instead of brittle CSS selectors.
    - [ ] Ensure tests clean up created data (database reset or unique IDs).
- [ ] **Unit/Integration Testing (Vite/Vitest)**
    - [ ] Setup rules for testing utility functions and hooks.
    - [ ] Ensure components are tested for rendering and interaction states.
    - [ ] Mock external services (like Clerk or Database) appropriately.

## 4. Accessibility (a11y) Best Practices
- [ ] **Semantic HTML**
    - [ ] Enforce use of semantic elements (`<main>`, `<nav>`, `<button>`) over `<div>` where appropriate.
    - [ ] Ensure headings (`h1`-`h6`) follow a logical hierarchy.
- [ ] **Interactive Elements**
    - [ ] Ensure all interactive elements have accessible names (`aria-label` or text content).
    - [ ] Verify keyboard navigation (tabindex, focus states).
    - [ ] Ensure form inputs have associated labels.
- [ ] **Visual Accessibility**
    - [ ] Check for sufficient color contrast in styles.
    - [ ] Support reduced motion preferences.
    - [ ] Ensure `alt` text is present for meaningful images.

