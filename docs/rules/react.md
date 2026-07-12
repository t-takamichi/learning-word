# React Frontend Rules

## Component Architecture
- Write functional components with explicit TypeScript interfaces for props: `interface Props { ... }`. Do not use `React.FC`.
- Keep components small and single-purpose. If a component exceeds 150 lines, refactor sub-elements into smaller, co-located components.
- Separate UI/Presentational logic from business logic. Extract complex state, data fetching, or side effects into custom hooks (e.g., `useBlogPost`).

## State Management & Performance
- Keep state as local as possible. Do not lift state up prematurely or use global context unless multiple disparate layout branches require it.
- Always provide precise dependency arrays for `useEffect`, `useMemo`, and `useCallback`. Never leave them empty if internal variables are referenced.
- Use `useMemo` for heavy computational tasks and `useCallback` when passing functions to memoized child components (`React.memo`).

## Data Fetching & Hono RPC
- When communicating with the backend, use Hono's RPC client (`hc`). Initialize the client once and reuse it across custom hooks.
- Use a declarative data-fetching library (like TanStack Query / React Query) to manage caching, loading states, and mutations cleanly.