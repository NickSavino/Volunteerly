# Volunteerly Shared

This package contains the shared schemas and TypeScript types used across the Volunteerly frontend and backend. It acts as the contract layer between the client and server by defining common entities, request payloads, response payloads, and validation rules in one place.

# Purpose

The `shared/` workspace is used to:

- define shared Zod schemas for API contracts
- export shared TypeScript types inferred from those schemas
- keep client and server data models aligned
- provide runtime validation and compile-time safety across the monorepo

## Usage

Both the client and server import from this package to share the same contracts.

Example:

```ts
import { CurrentUserSchema, type CurrentUser } from "@volunteerly/shared";
```

## Development Notes

When adding or updating API contracts:

1. create or update the schema in `src/schemas/`
2. export it through `src/index.ts` or the relevant schema index
3. rebuild or run the shared package in watch mode
4. update client and server usage as needed

This package should remain the single source of truth for shared request and response shapes across the application.
