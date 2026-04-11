# Volunteerly Client

This package contains the Volunteerly frontend. It is a Next.js application that provides the user interface for volunteers, organizations, and moderators.

## Local Development

From the repository root:

```bash
docker compose up client --build
```

The client expects the backend and Supabase-related environment variables to be configured in the root `.env` used by the monorepo setup.

## Authentication and Routing

The frontend handles the browser-side auth flow and role-based navigation. The main auth-related routes are:

- `/`
- `/login`
- `/signup`
- `/bootstrap`
- `/volunteer`
- `/organization`
- `/moderator`

After login or signup, the client routes through a bootstrap phase and then redirects the user to the correct dashboard based on their role.

## Mapping and UI

The client includes:

- Leaflet for map functionality
- Radix-based UI primitives
- Tailwind CSS styling
- Sonner for toast notifications

## Testing

Run client tests with:

```bash
npm run test -w client
```

Run type checks with:

```bash
npm run typecheck -w client
```

Run linting with:

```bash
npm run lint -w client
```

## Relationship to the Shared Package

This package imports schemas and shared types from `@volunteerly/shared`. If shared contracts change, rebuild the shared package before expecting the client build to reflect them:

```bash
npm run build -w shared
```

or run the shared package in watch mode:

```bash
npm run dev -w shared
```
