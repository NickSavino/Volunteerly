# Volunteerly Server

This package contains the Volunteerly backend API. It is an Express + TypeScript server using Prisma for database access and Supabase for authentication-related integration.

## Script details

### Development and build

- `npm run dev -w server`
  Starts the server in watch mode using `tsx watch src/server.ts`.

- `npm run dev:docker -w server`
  Generates Prisma client and starts the server in a Docker-oriented development mode.

- `npm run build -w server`
  Runs `prisma generate` and compiles TypeScript.

- `npm run start -w server`
  Generates Prisma client and starts the compiled server from `dist/server.js`.

### Prisma

- `npm run prisma:generate -w server`
  Generates Prisma client.

- `npm run prisma:migrate -w server`
  Runs `prisma migrate dev`. Intended for local development.

- `npm run prisma:migrate:empty -w server`
  Creates an empty migration with `--create-only`.

### Database bootstrap and seed

- `npm run db:auth-bootstrap -w server`
  Executes `sql/supabase-auth-bootstrap.sql` against the local Supabase Postgres container. This script is currently wired to a local Docker container name and is intended for local setup.

- `npm run db:seed -w server`
  Executes `sql/seed.sql` against the local Supabase Postgres container.

- `npm run db:reset -w server`
  Resets the local database with Prisma and then runs auth bootstrap and seed scripts.

## Local Database Workflow

For local development, the expected workflow is:

1. start local Supabase
2. run Prisma migrations locally
3. bootstrap auth SQL
4. apply seed data if needed

Typical commands:

```bash
npx supabase start
npm run db:reset -w server
```

## Testing and Type Checking

Run tests:

```bash
npm run test -w server
```

Run type checks:

```bash
npm run typecheck -w server
```

## Shared Contracts

The server imports shared schemas and types from `@volunteerly/shared`. If shared contracts change, rebuild the shared package first:

```bash
npm run build -w shared
```

or run it in watch mode:

```bash
npm run dev -w shared
```
