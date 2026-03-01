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

## Development Setup

The dev environment is ran using docker to ensure a consistent cross-platform environment.

## Prerequisites

### 1. Install necessary tools

Docker Desktop (reccomended), Docker engine (required):

- <https://docs.docker.com/desktop/>

Make:

- Windows: <https://medium.com/@AliMasaoodi/installing-make-on-windows-10-using-chocolatey-a-step-by-step-guide-5e178c449394>
- Mac: <https://www.google.com/search?client=firefox-b-d&q=install+make+on+mac>
- Linux/WSL: <https://www.geeksforgeeks.org/installation-guide/how-to-install-make-on-ubuntu/>

## 2. Verify installation

```bash
docker --version
docker compose version
make #Should print out a list of available commands
```

## 3. Set environment variables

Inside both `/client` and `/server`, run `cp .env.example .env`. This provides a minimum `.env` file that may need to be updated overtime depending on what services are being used.

## 4. Run Development environment

Simplest method:

```bash
make dev
# OR
make dev-d # Runs container detached
```

Each container can be manually started:

```bash
make web
make server
make db
# append -d to run in each in detached mode
```

*** Note: it is possible to run the client and backend without docker, but not reccomended due to potential issues across development environments.
