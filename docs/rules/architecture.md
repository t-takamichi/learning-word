# Layered Architecture Rules

## Core Principles
- **Strict Dependency Direction**: Dependencies must flow only from the outside in. 
  `Presentation (Hono) -> Application (Use Case) -> Domain <- Infrastructure (DB/External API)`
- **Dependency Inversion Principle (DIP)**: The Application layer must not depend on concrete Infrastructure components. It must depend on interfaces (Repositories/Gateways) defined in the Domain or Application layer.
- **No Shared State**: Ensure each layer is stateless and thread-safe.

## Layer Definitions & Responsibilities

### 1. Presentation Layer (Controller / Handler)
- **Role**: Handle HTTP infrastructure via Hono.
- **Allowed Operations**: 
  - Request validation using Hono input validators (`c.req.valid`).
  - Extracting path parameters, query parameters, and context boundaries.
  - Invoking the appropriate Application layer service (Use Case).
  - Mapping Use Case outputs/errors to semantic HTTP responses and JSON payloads.
- **Prohibitions**: Never write business logic, transaction boundaries, or direct database queries (e.g., Prisma/Drizzle calls) here.

### 2. Application Layer (Use Case / Service)
- **Role**: Orchestrate business logic execution and manage transaction boundaries.
- **Allowed Operations**:
  - Coordinate multiple Domain models and Repositories to fulfill a specific user goal.
  - Implement use-case specific validation that requires database state checking.
  - Define input/output data structures (DTOs) for the Presentation layer.
- **Prohibitions**: Must not import any HTTP-related objects (`c: Context` from Hono, status codes, etc.). Must remain framework-agnostic.

### 3. Domain Layer (Domain Model / Enterprise Business Rules)
- **Role**: Encapsulate core business rules, logic, and invariants.
- **Allowed Operations**:
  - Define Entities, Value Objects, and Domain Events using pure TypeScript.
  - Define Repository Interfaces (abstractions for data access).
- **Prohibitions**: Must have zero third-party framework dependencies (except utility libraries like Zod if used for domain validation). Completely isolated from DB schemas and API models.

### 4. Infrastructure Layer (Repository / Gateway)
- **Role**: Implement data access, external API integrations, and technical details.
- **Allowed Operations**:
  - Implement Repository interfaces defined by upper layers.
  - Execute concrete ORM/Query Builder operations (Prisma, Drizzle, Kysely, etc.).
  - Handle data mapping between Database Entities and Domain Models.
- **Prohibitions**: Never execute use-case logic or business rules.

## Dependency Injection (DI) Pattern
- Use explicit constructor injection or functional factory functions to wire dependencies.
- In the Hono application entry point, instantiate repositories, inject them into use cases, and inject use cases into handlers.
- (Optional) Utilize Hono's custom context variable middleware (`c.set / c.get`) *only* if required for dynamic request-scoped dependency resolution.

## Data Flow & Anti-Corruption Layer
- Do not expose raw Database Entities to the Presentation layer or Frontend via Hono RPC.
- Always map Database Entities to Domain Models in the Infrastructure layer.
- Always map Domain Models to DTOs/JSON targets in the Application or Presentation layer before returning the data to maximize contract stability.