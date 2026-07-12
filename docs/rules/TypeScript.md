# TypeScript Development Rules

## Core Principles
- Maintain strict type safety. Never use `any`. Use `unknown` if the type is truly dynamic, and narrow it down using type guards or type predicates.
- Prefer immutability. Use `readonly` for properties that should not be mutated, and `ReadonlyArray<T>` or `as const` where appropriate.
- Avoid type assertions (`as Type`) unless absolutely necessary (e.g., mocking in tests). Use explicit type annotations or let type inference work naturally.

## Type Architecture
- Use Discriminated Unions for modeling complex states or API responses (e.g., `{ status: 'success'; data: T } | { status: 'error'; error: Error }`).
- Define explicit return types for all exported functions, API handlers, and public methods to improve readability and compiler error tracking.
- Maximize the use of template literal types and utility types (`Pick`, `Omit`, `Partial`, `Record`) to keep types DRY.

## Code Quality & Patterns
- Avoid deep nesting. Use early returns (guard clauses) to handle edge cases and errors first.
- Do not use magic numbers or hardcoded strings. Centralize them into enums (preferably `as const` objects) or configuration files.
- Ensure all asynchronous code uses `async/await` with proper `try/catch` blocks or explicit promise chain catch handlers.