# Volunteerly - SENG 513

Volunteerly is a web platform that connects volunteers with organizations.

---

## Tech Stack / Tool Reference

### Frontend

- Next.js 16 - <https://nextjs.org/docs>
- React - <https://react.dev/reference/react>
- Typescript - <https://www.typescriptlang.org/docs/>

### Backend

- Node.js 20.19.0 - <https://nodejs.org/en/learn/getting-started/introduction-to-nodejs>
- Express.js 5.2.1 - <https://expressjs.com/en/5x/api.html>
- Prisma ORM 7.4.2 - <https://www.prisma.io/docs/orm>

### Database

- PostgreSQL 16 - <https://www.postgresql.org/docs/>

### Infrastructure

- Docker - <https://docs.docker.com/reference/dockerfile/>
- Make - <https://www.gnu.org/software/make/>

## Monorepo Structure

The project consists of 3 packages:
- `client/` - Next.js frontend
- `server/` - Express Backend
- `shared/` - shared Zod schemas and types used by both client and server

Each package and the repository root contain a `package.json` with useful development commands.
Type `npm run` to view available commands

You can manage each package individually by adding: `-w (package)` to the end of a `npm run` command

Examples:
```bash
npm run build -w shared
npm run typecheck -w client
npm run db:setup -w server
```
## Development Setup

The dev environment is ran using docker for a consistent cross-platform environment.

### Prerequisites

#### 1. Install necessary tools

Docker Desktop (reccomended), Docker engine (required):
- <https://docs.docker.com/desktop/>

Make:
- Windows: <https://medium.com/@AliMasaoodi/installing-make-on-windows-10-using-chocolatey-a-step-by-step-guide-5e178c449394>
- Mac: <https://www.google.com/search?client=firefox-b-d&q=install+make+on+mac>
- Linux/WSL: <https://www.geeksforgeeks.org/installation-guide/how-to-install-make-on-ubuntu/>
- Node.js (20+):

- Ensure PostgreSQL client is setup, you should be able to run commands using `sql`

#### 2. Verify installation

```bash
docker --version
docker compose version
make # Should print out a list of available commands
node --version
npm --version
```

#### 3. Set environment variables

In repo root:
- `touch .env`

Place environment variables only in this file 

**(DO NOT COMMIT SECRETS TO REPOSITORY)**

#### 4. Install packages
From repository root:
`npm install`

#### 5. Run Development environment

Simplest method:

```bash
docker compose up --build
supabase start
# After supabase has initialized:
npm run db:reset -w server
```

This will:

1. Build and run the client and server containers
2. Start supabase containers
3. Bootstrap authenication to SQL


*** Note: it is possible to run the client and backend without docker, but not reccomended due to potential issues across development environments.

*** Note: Always remember to run `npm run db:reset -w server` after resetting the database, or auth will not properly bootstrap

## Services
After startup the following services are available:

Client: <http://localhost:3000>
Server: <http://localhost:4000>

## Migrations
The project uses [Prisma Migrations](https://www.prisma.io/docs/orm/prisma-migrate).

Generate the prisma client:
- `npm run prisma:migrate -w server`

Run Migrations
- `npm run prisma:migrate -w server`

*** Note: Never manually deleted a migration file unless it is an untracked change in your current working branch. If you need to make a change or revert after a commit, simply edit the schema file and rerun migrations.

#### Migration Conventions:
Use standard snake_case for column names through the use of the `@map()` attribute

For tables use `@@map()` and follow snake_case as well.

The following fields should be in every table that represents a tracked entity within the database schema:
```bash
createdAt DateTime @default(now()) @map("created_at")
updatedAt DateTime @updatedAt @default(now()) @map("updated_at")
```

Enforce id primary keys on every table with `@id @default(uuid())`

Define both sides of relationship in schema when referencing tables through primary keys

## Supabase Auth Integration
Volunteerly uses [Supabase Auth](https://supabase.com/docs/guides/auth) for authentication.

When a user signs up:

1. Supabase inserts a row in `auth.users`
2. A database triggers automatically inserts a related record into `public.users`, mapping them by keys while protecting the authentication data.

## Supabase Local Development
a local supabase instance is used in development. From the repository root:
- `supabase start`

You can access the supabase dashboard locally at:

<http://localhost:54323>

To view your connection settings, run:

`npx supabase status`

Reset the local database by running:
- `npm run db:reset -w server`

## Client Authentication Flow
There the following pages manage authentication:
- `/`
- `/login`
- `/signup`
- `/bootstrap`
- `/volunteer`
- `/organization`
- `/moderator`

After login or signup, the app routes to `/bootstrap`, fetches the current user from the backend, and redirects to the correct dashboard based on the user`s role.

## API Contract
API schemas are defined in the `shared/` package using [Zod](https://zod.dev/). This provides runtime validation and shared types between frontend and backend

After adding your schema to `shared/src` run:
- `npm run build -w shared`

Alternatively, you can run:
- `npm run dev -w shared`

For automatic reloading.

### CSS
Use components from [shacdn/ui](https://ui.shadcn.com/docs/components). Styling for web application is set in `/client/src/app/globals.css`.

Imported components can be styled by accessing the relevant `.tsx` file for that component inside `/client/src/components/ui`