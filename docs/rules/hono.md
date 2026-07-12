# Hono Backend Rules

## Architecture & Setup
- Always explicitly define the `Env` type (Bindings and Variables) and pass it to the Hono instance: `new Hono<{ Bindings: Env }>()`.
- Group routes logically using sub-apps and mount them via `app.route('/path', subApp)`.

## Type-Safe RPC Integration (Critical)
- Always export the `AppType` from your main server entry point or route definitions: `export type AppType = typeof routes;`.
- Do not use `app.fire()` or separate build steps that break RPC type references. Ensure the frontend can directly import `AppType` for `hc<AppType>()`.

## Request Validation & Security
- Never trust raw request data. Always use `@hono/zod-validator` (or equivalent) to validate `json`, `query`, and `param`.
- Extract validated data strictly via `c.req.valid('json')` or `c.req.valid('param')` to ensure runtime and compile-time alignment.

## Error Handling
- Use `app.onError` to implement centralized error handling. Map internal application errors to semantic HTTP status codes.
- Never leak sensitive system errors or stack traces to the client in production. Return structured JSON: `{ success: false, message: string }`.