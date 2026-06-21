# Aurora Backoffice

This is the **management interface** of the Aurora suite — the web UI used to control DMX lighting, narrowcasting screens, and music playback. The backoffice sends commands to the core over HTTP and receives real-time state updates over SocketIO.
See the root [README](../README.md) for the full architecture overview and list of all Aurora repositories.

## Prerequisites

- NodeJS 22.

## Development setup

1. Run `pnpm install` from the monorepo root.
1. Run `pnpm dev`.
1. The application is now running at http://localhost:8080.
   In development mode, you are automatically logged in without OIDC credentials (mock auth).

By default, the dev server proxies API requests to `http://localhost:3000`. To use a different core URL, set `VITE_CORE_URL` in the environment.

## Deployment

Deployment is handled by Docker Compose from the monorepo root alongside Aurora Core.
The backoffice can be built standalone with `pnpm docker-build` from this directory.

In production, the backoffice authenticates via OIDC (Keycloak). The `VITE_OIDC_*` environment variables must be configured for the production build.
