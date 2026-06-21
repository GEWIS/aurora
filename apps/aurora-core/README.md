# Aurora Core

This is the **central hub** of the Aurora suite — it receives commands and state changes, and pushes them in real time to all connected subscribers over SocketIO WebSockets.
End users control Aurora through the backoffice web interface, which communicates with the core over HTTP.
See the root [README](../README.md) for the full architecture overview and list of all Aurora repositories.

## Prerequisites

- NodeJS 22.
- A SQLite database or a PostgreSQL instance.

## Development setup

1. Copy `.env.example` to `.env` and fill in the environment variables.
1. Run `pnpm install` from the monorepo root.
1. Run `pnpm dev`.
1. The application is now running at http://localhost:3000. API documentation is available at http://localhost:3000/api-docs.

The database is automatically synchronised with the application models in development mode (`TYPEORM_SYNCHRONIZE=true`).
To seed the database with test data, run `pnpm seed:gewis`.

## Deployment

Deployment is handled by Docker Compose from the monorepo root.
The core can be built standalone with `pnpm docker-build` from this directory.
